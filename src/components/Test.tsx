import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {IUser} from '../interfaces/IUser';
import {
    AnyQuestionData, IChooseAnswer, IChooseRightData, IMatchAnswer, IMatchColumnsData, IOpenQuestionData, IQuestion,
    QuestionAnswer,
    QuestionType
} from '../interfaces/IQuestion';
import {database, storageRef} from '../modules/firebase';
import ChooseRightQuestion from './ChooseRightQuestion';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {embedKey} from '../utils/key-embedding';
import MatchColumnsQuestion from './MatchColumnsQuestion';
import OpenQuestion from './OpenQuestion';

import * as TestStyles from '../styles/Test.scss';
import Button from '@material-ui/core/Button';
import * as AppStyles from '../styles/App.scss';

interface Props {
    user: IUser;
}

interface State {
    questions?: IQuestion<AnyQuestionData>[];

    currentQuestion?: IQuestion<AnyQuestionData>;
    currentQNumber?: number;

    done?: boolean;
    loading: boolean;
    isNextPicturesLoaded: boolean;
    isCurrentPicturesLoaded: boolean;
}

class Test extends React.Component<Props & RouteComponentProps<{}>, State> {
    onDone = () => {
        let pointsSum = 0;
        this.state.questions.map((q: IQuestion<AnyQuestionData>) => {
            if (q.isAnswered) pointsSum += q.points;
        });

        database.ref('passed-questions/' + this.props.user.github).set({
            ...this.state.questions,
        }).then(() => {
            database.ref('users/' + this.props.user.github).set({
                ...this.props.user,
                points: pointsSum,
                test_passed: true,
                test_is_checked: false,
            }).then(() => {
                this.setState({
                    ...this.state,
                    done: true,
                });
            });
        });
    };
    loadPictures = (qNumber: number) => {
        const isNextQuestion = qNumber !== this.state.currentQNumber;

        const question = this.state.questions[qNumber];
        const pictures = question.pictures;

        if (isNextQuestion) this.nextQuestionImages = [];

        pictures.map((filename: string, i: number) => {
            storageRef.child(`${question.key}/${filename}`).getDownloadURL().then(url => {
                let xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function () {
                    const blob = xhr.response;
                    const objectURL = URL.createObjectURL(blob);
                    if (isNextQuestion) {
                        this.nextQuestionImages.push(objectURL);
                        if (i == pictures.length) {
                            this.setState({
                                ...this.state,
                                isNextPicturesLoaded: true,
                                loading: !this.state.isCurrentPicturesLoaded,
                            });
                        }
                    } else {
                        this.currentQuestionImages.push(objectURL);
                        if (i == pictures.length) {
                            this.setState({
                                ...this.state,
                                isCurrentPicturesLoaded: true,
                                loading: !this.state.isNextPicturesLoaded,
                            });
                        }
                    }
                }.bind(this);
                xhr.open('GET', url);
                xhr.send();
            });
        });
    };
    onAnswer = (answer: QuestionAnswer) => {
        //CHECK IS ANSWERED

        const question = this.state.currentQuestion;
        switch (question.type) {
            case QuestionType.choose_right:
                const chData = question.questionData as IChooseRightData;
                const ch = chData.answers.filter((v: IChooseAnswer) => v.text == (answer as IChooseAnswer).text)[0];
                (ch as IChooseAnswer).isAnswered = !ch.isAnswered;
                break;
            case QuestionType.match_columns:
                const mData = question.questionData as IMatchColumnsData;
                const m = mData.answers.filter((v: IMatchAnswer) => v.left == (answer as IMatchAnswer).left)[0];
                (m as IMatchAnswer).user_answer = (answer as IMatchAnswer).right;
                break;
            case QuestionType.open_question:
                (question.questionData as IOpenQuestionData).answer = answer as string;
        }
    };
    onNext = () => {
        this.currentQuestionImages = this.nextQuestionImages;
        this.nextQuestionImages = [];
        this.loadPictures(this.state.currentQNumber + 2);

        this.setState({
            ...this.state,
            isNextPicturesLoaded: false,
            loading: true,
        });
    };
    private nextQuestionImages: any[];
    private currentQuestionImages: any[];

    constructor(props) {
        super(props);

        this.state = {
            isNextPicturesLoaded: false,
            isCurrentPicturesLoaded: false,
            loading: true,
        };
    }

    static getTestQuestions() {
        return database.ref('/questions').once('value');
    }

    componentDidMount() {
        Test.getTestQuestions().then(snapshot => {
            const dbQuestions = Object.entries(embedKey(snapshot.val())).map((q) => q[1]);
            this.loadPictures(0);
            this.loadPictures(1);

            this.setState({
                ...this.state,
                questions: dbQuestions as IQuestion<AnyQuestionData>[],
                currentQNumber: 0,
                currentQuestion: dbQuestions[0] as IQuestion<AnyQuestionData>,
                loading: true,
            });
        });
    }

    render() {
        const question = this.state.currentQuestion;

        return (
            <React.Fragment>
                <Button variant="contained"
                        color="primary"
                        className={TestStyles.doneTestButton}
                        fullWidth={false}
                        onClick={this.onDone}>
                    Завершить тест
                </Button>
                <div className={TestStyles.container}>
                    {
                        !this.state.loading && !this.state.done &&
                        <Paper className={TestStyles.questionPaper}
                               elevation={10}>
                            <Typography variant="title"
                                        style={{paddingTop: '3px'}}>
                                <div className={TestStyles.questionNumberDiv}>
                                    <span className={TestStyles.questionOrderSpan}>{' ' + question.order + '.'}</span>
                                </div>
                                {question.text}
                            </Typography>
                            <br/>
                            {
                                this.currentQuestionImages &&
                                this.currentQuestionImages.map((url: string, i: number) => {
                                    return <img key={i}
                                                src={url}
                                                style={{
                                                    height: '180px',
                                                    display: 'inline-block',
                                                }}/>;
                                })
                            }
                            <br/>
                            {this.state.currentQuestion.type === QuestionType.choose_right &&
                            <ChooseRightQuestion question={question as IQuestion<IChooseRightData>}
                                                 mode={'pass'}
                                                 onAnswer={(answer) => this.onAnswer(answer)}/>}
                            {this.state.currentQuestion.type === QuestionType.match_columns &&
                            <MatchColumnsQuestion question={question as IQuestion<IMatchColumnsData>}
                                                  mode={'pass'}
                                                  onAnswer={(answer) => this.onAnswer(answer)}/>}
                            {this.state.currentQuestion.type === QuestionType.open_question &&
                            <OpenQuestion question={question as IQuestion<IOpenQuestionData>}
                                          mode={'pass'}
                                          onAnswer={(answer) => this.onAnswer(answer)}/>}
                            <div className={TestStyles.questionButtonNext}>
                                <Button variant="contained"
                                        color="primary"
                                        fullWidth={true}
                                        onClick={this.onNext}>
                                    Дальше
                                </Button>
                            </div>
                        </Paper>
                    }
                    {
                        !this.state.loading && this.state.done &&
                        <Paper className={TestStyles.testDonePaper}>
                            <Typography variant="body1" align={'center'}>
                                Тест пройден. Следите за новостями портала.
                            </Typography>
                        </Paper>
                    }
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(Test);
