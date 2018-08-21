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
import TextField from '@material-ui/core/TextField';

interface Props {
    user: IUser;
    checkMode: boolean;
    onCheck: any;
}

interface State {
    questions?: IQuestion<AnyQuestionData>[];

    currentQuestion?: IQuestion<AnyQuestionData>;
    currentQNumber?: number;

    done?: boolean;
    loading: boolean;
    isNextPicturesLoaded: boolean;
    isCurrentPicturesLoaded: boolean;

    pointsToAdd?: number;
}

class Test extends React.Component<Props & RouteComponentProps<{}>, State> {
    onDone = () => {
        debugger;
        this.setState({
            loading: true,
        }, () => {
            debugger;
            let pointsSum = 0;
            this.state.questions.map((q: IQuestion<AnyQuestionData>) => {
                let goodBoy = true;
                switch (q.type) {
                    case QuestionType.choose_right:
                        (q.questionData as IChooseRightData).answers.map((a: IChooseAnswer) => {
                            if (a.isAnswered && !a.isRight) goodBoy = false;
                        });
                        if (goodBoy) pointsSum += q.points;
                        q.isChecked = true;
                        break;

                    case QuestionType.match_columns:
                        (q.questionData as IMatchColumnsData).answers.map((a: IMatchAnswer) => {
                            if (a.right !== a.user_answer) goodBoy = false;
                        });
                        if (goodBoy) pointsSum += q.points;
                        q.isChecked = true;
                        break;

                    case QuestionType.open_question:
                        if (q.isChecked) {
                            pointsSum += q.points;
                        }
                }
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
                    if (this.props.checkMode) {
                        this.props.onCheck();
                        return;
                    }
                    this.setState({
                        ...this.state,
                        loading: false,
                        done: true,
                    });
                });
            });
        });
    };
    loadPictures = (qNumber: number) => {
        const isNextQuestion = qNumber !== this.state.currentQNumber;
        //debugger;
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
        const newCurrentQuestion = questions[newCurrentNumber];

        this.setState({
            ...this.state,
            questions: newQuestions,
            currentQuestion: newCurrentQuestion,
            pointsToAdd: newCurrentQuestion.points,
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

    getTestQuestions = () => {
        if (this.props.checkMode) {
            return database.ref(`/passed-questions/${this.props.user.github}`).once('value');
        } else {
            return database.ref('/questions').once('value');
        }
    };

    onPointsToAddChange = (evt) => {
        this.setState({
            ...this.state,
            pointsToAdd: evt.currentTarget.value,
        });
    };

    onPointsAdd = () => {
        const points = this.state.pointsToAdd;

        this.setState({
            ...this.state,
            currentQuestion: {
                ...this.state.currentQuestion,
                isChecked: true,
                points: points,
            },
        });
    };

    componentDidMount() {
        this.getTestQuestions().then(snapshot => {
            const dbQuestions = Object.entries(embedKey(snapshot.val())).map((q) => q[1]);
            const currentQuestion = dbQuestions[0] as IQuestion<AnyQuestionData>;

            this.setState({
                ...this.state,
                questions: dbQuestions as IQuestion<AnyQuestionData>[],
                currentQNumber: 0,
                currentQuestion: currentQuestion,
                pointsToAdd: currentQuestion.points,
            });

            this.loadPictures(0);
            this.loadPictures(1);
        });
    }

    render() {
        const {checkMode} = this.props;
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
                        {!this.state.done && !checkMode &&
                            <Typography variant="body2"
                                        className={TestStyles.questionNumberHeader}>
                                Вопрос {this.state.currentQNumber + 1 + '/' + this.state.questions.length}
                            </Typography>
                        }
                        {!this.state.done &&
                            <div className={TestStyles.doneTestButton}>
                                <Button variant='contained'
                                        color='primary'
                                        fullWidth={false}
                                        onClick={this.onDone}>
                                    {checkMode ? 'Завершить проверку' : 'Завершить тест'}
                                </Button>
                            </div>
                        }
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
                                                         mode={checkMode ? 'check' : 'pass'}
                                                         onAnswer={(answer) => this.onAnswer(answer)}/>}
                                    {this.state.currentQuestion.type === QuestionType.match_columns &&
                                    <MatchColumnsQuestion question={question as IQuestion<IMatchColumnsData>}
                                                          mode={checkMode ? 'check' : 'pass'}
                                                          onAnswer={(answer) => this.onAnswer(answer)}
                                                          onReset={this.onReset}/>}
                                    {this.state.currentQuestion.type === QuestionType.open_question &&
                                    <OpenQuestion question={question as IQuestion<IOpenQuestionData>}
                                                  mode={checkMode ? 'check' : 'pass'}
                                                  onAnswer={(answer) => this.onAnswer(answer)}/>}
                                    <div className={TestStyles.questionButtonNext}>
                                        <Button variant="contained"
                                                color="primary"
                                                fullWidth={true}
                                                onClick={this.onNext}>
                                            {this.state.currentQuestion.isAnswered ? 'Дальше' : 'Пропустить'}
                                        </Button>

                                    </div>
                                    <div className={TestStyles.addPointsDiv}>
                                        <div>
                                            <TextField label='Количество баллов за правильный ответ'
                                                       fullWidth={true}
                                                       margin={'dense'}
                                                       onChange={(evt) => this.onPointsToAddChange(evt)}
                                                       value={this.state.pointsToAdd}
                                            />
                                        </div>
                                        <div>
                                            <Button variant="contained"
                                                    color="primary"
                                                    onClick={this.onPointsAdd}>
                                                Добавить баллы
                                            </Button>
                                        </div>
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
