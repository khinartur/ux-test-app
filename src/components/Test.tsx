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
import LinearProgress from '@material-ui/core/LinearProgress';

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
        debugger;
        const question = this.state.questions[qNumber];

        if (isNextQuestion) {
            this.nextQuestionImages = [];
        } else {
            this.currentQuestionImages = [];
        }

        const pictures = question.pictures;

        //TODO: i don't like it
        if (pictures) {
            pictures.map((filename: string, i: number) => {
                storageRef.child(`${question.key}/${filename}`).getDownloadURL().then(url => {
                    let xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = function () {
                        const blob = xhr.response;
                        const objectURL = URL.createObjectURL(blob);
                        if (isNextQuestion) {
                            this.nextQuestionImages.push(objectURL);
                            if (i == pictures.length - 1) {
                                this.setState({
                                    ...this.state,
                                    isNextPicturesLoaded: true,
                                    loading: !this.state.isCurrentPicturesLoaded,
                                });
                            }
                        } else {
                            this.currentQuestionImages.push(objectURL);
                            if (i == pictures.length - 1) {
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
        } else {
            if (isNextQuestion) {
                console.log('no pictures in next question');
                this.setState({
                    ...this.state,
                    isNextPicturesLoaded: true,
                    loading: !this.state.isCurrentPicturesLoaded,
                });
            } else {
                console.log('no pictures in current question');
                this.setState({
                    ...this.state,
                    isCurrentPicturesLoaded: true,
                    loading: !this.state.isNextPicturesLoaded,
                });
            }
        }
    };
    onAnswer = (answer: QuestionAnswer) => {
        debugger;

        const question = this.state.currentQuestion;
        switch (question.type) {
            case QuestionType.choose_right:
                const chData = question.questionData as IChooseRightData;
                const answeredChAnswers = chData.answers.filter((v: IChooseAnswer) => v.isAnswered);
                this.setState({
                    ...this.state,
                    currentQuestion: {
                        ...this.state.currentQuestion,
                        isAnswered: !!answeredChAnswers.length,
                    },
                });
                break;

            case QuestionType.match_columns:
                const mData = question.questionData as IMatchColumnsData;
                //const m = mData.answers.filter((v: IMatchAnswer) => v.left == (answer as IMatchAnswer).left)[0];
                const answeredMAnswers = mData.answers.filter((v: IMatchAnswer) => v.user_answer);
                this.setState({
                    ...this.state,
                    currentQuestion: {
                        ...this.state.currentQuestion,
                        isAnswered: answeredMAnswers.length == mData.answers.length,
                    },
                });
                break;

            case QuestionType.open_question:
                this.setState({
                    ...this.state,
                    currentQuestion: {
                        ...this.state.currentQuestion,
                        questionData: {
                            ...this.state.currentQuestion,
                            answer: answer,
                        } as IOpenQuestionData,
                        isAnswered: !!answer,
                    },
                });
        }
    };
    onNext = () => {
        debugger;
        const currNumber = this.state.currentQNumber;
        this.currentQuestionImages = this.nextQuestionImages;
        this.nextQuestionImages = [];

        const questions = this.state.questions;
        let newQuestions = questions.map((q: IQuestion<AnyQuestionData>, i: number) => {
            return i !== currNumber ? q : this.state.currentQuestion;
        });

        const newCurrentNumber = currNumber == questions.length - 1 ? 0 : currNumber + 1;
        const qnumberForPicturesLoad = currNumber == questions.length - 2 ? 0 :
            currNumber == questions.length - 1 ? 1 : currNumber + 2;

        this.setState({
            ...this.state,
            questions: newQuestions,
            currentQuestion: questions[newCurrentNumber],
            currentQNumber: newCurrentNumber,
            isNextPicturesLoaded: false,
            loading: true,
        }, () => {
            //TODO: make async
            this.loadPictures(qnumberForPicturesLoad);
        });
    };
    onReset = () => {

        // let resetAnswers;
        //
        // switch(this.state.currentQuestion.type) {
        //     case QuestionType.match_columns:
        //         resetAnswers = (this.state.currentQuestion.questionData as any)
        //             .answers.map((a: any) => {
        //                 return {...a, user_answer: ''};
        //             });
        // }

        this.setState({
            ...this.state,
            currentQuestion: {
                ...this.state.currentQuestion,
                // questionData: {
                //     ...this.state.currentQuestion.questionData,
                //     answers: resetAnswers,
                // },
                isAnswered: false,
            },
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

            this.setState({
                ...this.state,
                questions: dbQuestions as IQuestion<AnyQuestionData>[],
                currentQNumber: 0,
                currentQuestion: dbQuestions[0] as IQuestion<AnyQuestionData>,
            });

            this.loadPictures(0);
            this.loadPictures(1);
        });
    }

    render() {
        const question = this.state.currentQuestion;

        return (
            <React.Fragment>
                {this.state.loading &&
                <div className={AppStyles.progress}>
                    <LinearProgress/>
                </div>
                }
                {
                    !this.state.loading &&
                    <React.Fragment>
                        <Typography variant="body2"
                                    className={TestStyles.questionNumberHeader}>
                            Вопрос {this.state.currentQNumber + 1 + '/' + this.state.questions.length}
                        </Typography>
                        <div className={TestStyles.doneTestButton}>
                            <Button variant='contained'
                                    color='primary'
                                    fullWidth={false}
                                    onClick={this.onDone}>
                                Завершить тест
                            </Button>
                        </div>
                        <div className={TestStyles.container}>
                            {
                                !this.state.loading && !this.state.done &&
                                <Paper className={TestStyles.questionPaper}
                                       elevation={10}>
                                    <Typography variant="title"
                                                style={{paddingTop: '3px'}}>
                                        <div className={TestStyles.questionNumberDiv}>
                                            <span
                                                className={TestStyles.questionOrderSpan}>{' ' + question.order + '.'}</span>
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
                                                          onAnswer={(answer) => this.onAnswer(answer)}
                                                          onReset={this.onReset}/>}
                                    {this.state.currentQuestion.type === QuestionType.open_question &&
                                    <OpenQuestion question={question as IQuestion<IOpenQuestionData>}
                                                  mode={'pass'}
                                                  onAnswer={(answer) => this.onAnswer(answer)}/>}
                                    <div className={TestStyles.questionButtonNext}>
                                        <Button variant="contained"
                                                color="primary"
                                                fullWidth={true}
                                                onClick={this.onNext}>
                                            {this.state.currentQuestion.isAnswered ? 'Дальше' : 'Пропустить'}
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
                }
            </React.Fragment>
        );
    }
}

export default withRouter(Test);
