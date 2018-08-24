import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {EUserTestStatus, IUser} from '../interfaces/IUser';
import {
    AnyQuestionData, EQuestionMode, IChooseAnswer, IChooseRightData, IMatchAnswer, IMatchColumnsData, IOpenQuestionData,
    IQuestion,
    QuestionAnswer,
    QuestionType
} from '../interfaces/IQuestion';
import {auth, database, storageRef} from '../modules/firebase';
import ChooseRightQuestion from './ChooseRightQuestion';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {ejectKey, embedKey} from '../utils/key-embedding';
import MatchColumnsQuestion from './MatchColumnsQuestion';
import OpenQuestion from './OpenQuestion';

import * as TestStyles from '../styles/Test.scss';
import Button from '@material-ui/core/Button';
import * as AppStyles from '../styles/App.scss';
import LinearProgress from '@material-ui/core/LinearProgress';
import TextField from '@material-ui/core/TextField';
import QuestionsList, {EQuestionsListMode} from './QuestionsList';
import TestQuestion from './TestQuestion';
import DoneTestDialog from './DoneTestDialog';

interface Props {
    checkMode?: boolean;
    onCheck?: () => void;
}

interface State {
    questions?: IQuestion<AnyQuestionData>[];
    currentQuestion?: IQuestion<AnyQuestionData>;

    user?: IUser;
    loading: boolean;
    showQuestionsList: boolean;
    showDoneTestDialog: boolean;
}

class Test extends React.Component<Props & RouteComponentProps<{}>, State> {
    //
    // onPointsToAddChange = (evt) => {
    //     this.setState({
    //         ...this.state,
    //         pointsToAdd: evt.currentTarget.value,
    //     });
    // };
    // onPointsAdd = () => {
    //     const points = this.state.pointsToAdd;
    //
    //     this.setState({
    //         ...this.state,
    //         currentQuestion: {
    //             ...this.state.currentQuestion,
    //             isChecked: true,
    //             points: points,
    //         },
    //     });
    // };
    closeDoneTestDialog = () => {
        this.setState({
            ...this.state,
            showDoneTestDialog: false,
        });
    };
    onDialogSubmit = () => {
        const {questions} = this.state;

        this.setState({
            ...this.state,
            loading: true,
        });

        let points = 0;
        questions.forEach((q: IQuestion<AnyQuestionData>) => {
            if (!q.isAnswered) return;
            let answers;
            let goodboy = true;
            switch (q.type) {
                case QuestionType.choose_right:
                    answers = (q as IQuestion<IChooseRightData>).questionData.answers;
                    answers.forEach((a: IChooseAnswer) => {
                        if (a.isAnswered && !a.isRight || !a.isAnswered && a.isRight) goodboy = false;
                    });
                    if (goodboy) points += q.points;
                    break;

                case QuestionType.match_columns:
                    answers = (q as IQuestion<IMatchColumnsData>).questionData.answers;
                    answers.forEach((a: IMatchAnswer) => {
                        if (a.right !== a.user_answer) goodboy = false;
                    });
                    if (goodboy) points += q.points;
                    break;

                case QuestionType.open_question:
                    return;
            }
        });

        database.ref('users/' + this.state.user.github).set({
            ...this.state.user,
            points,
            test_status: EUserTestStatus.passed,
        }).then(() => {
            this.props.history.push('/profile');
        });
    };
    onDone = () => {
        let isAllAnswered = true;
        this.state.questions.map((q: IQuestion<AnyQuestionData>) => {
            if (!q.isAnswered) isAllAnswered = false;
        });

        if (!isAllAnswered) {
            this.setState({
                ...this.state,
                showDoneTestDialog: true,
            });
        } else {
            this.onDialogSubmit();
        }
    };
    onNext = () => {
        debugger;
        const questions = this.state.questions;
        const current = this.state.currentQuestion;
        const toStart = current.order == questions.length;

        this.setState({
            ...this.state,
            currentQuestion: questions[toStart ? 0 : current.order],
            loading: false,
        });
    };
    onBack = () => {
        debugger;
        const questions = this.state.questions;
        const current = this.state.currentQuestion;
        const toEnd = current.order == 1;

        this.setState({
            ...this.state,
            currentQuestion: questions[toEnd ? questions.length - 1 : current.order - 2],
        });
    };
    toList = () => {
        this.setState({
            ...this.state,
            showQuestionsList: true,
        });
    };
    onAnswer = (newCurrent: IQuestion<AnyQuestionData>) => {
        debugger;
        this.setState({
            ...this.state,
            currentQuestion: newCurrent,
        });
    };
    onAnswerSave = () => {
        const {user, currentQuestion} = this.state;
        debugger;

        this.setState({
            ...this.state,
            loading: true,
        });

        database.ref('passed-questions/' + user.github + '/' + currentQuestion.key).set({
            ...currentQuestion,
            isAnswered: true,
        }).then(() => {
            database.ref('users/' + user.github).set({
                ...user,
                test_status: EUserTestStatus.in_progress,
                current_question: currentQuestion.order + 1,
            }).then(() => {
                this.updateQuestionsList();
            });
        });
    };
    updateQuestionsList = () => {
        const {currentQuestion} = this.state;
        let modifiedQuestions = this.state.questions.map((q: IQuestion<AnyQuestionData>) => {
            if (q.key == currentQuestion.key) {
                return {
                    ...currentQuestion,
                    isAnswered: true,
                };
            }

            return q;
        });

        this.setState({
            ...this.state,
            questions: modifiedQuestions,
        }, () => this.onNext());
    };
    onQuestionsListClick = (evt, index) => {
        const questions = this.state.questions;
        debugger;

        this.setState({
            ...this.state,
            currentQuestion: questions[index],
            showQuestionsList: false,
        });
    };
    getTestQuestions = () => {
        const {user} = this.state;

        if (user.test_status == EUserTestStatus.in_progress || user.test_status == EUserTestStatus.passed) {
            return database.ref(`/passed-questions/${user.github}`).once('value');
        } else {
            return database.ref('/questions').once('value');
        }
    };
    isPicturesLoaded = () => {
        return !!this.picturesStorage[this.state.currentQuestion.key];
    };
    loadPictures = () => {
        this.picturesStorage = new Array(this.state.questions.length);
        this.state.questions.map((q: IQuestion<AnyQuestionData>) => {
            const pictures = q.pictures;

            if (pictures) {
                pictures.map((filename: string) => {
                    storageRef.child(`${q.key}/${filename}`).getDownloadURL().then(url => {
                        let xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob';
                        xhr.onload = function () {
                            const blob = xhr.response;
                            const objectURL = URL.createObjectURL(blob);
                            if (this.picturesStorage[q.key]) {
                                this.picturesStorage[q.key].push(objectURL);
                            } else {
                                this.picturesStorage[q.key] = [objectURL];
                            }
                            if (this.state.loading && this.isPicturesLoaded()) {
                                this.setState({
                                    ...this.state,
                                    loading: false,
                                });
                            }
                        }.bind(this);
                        xhr.open('GET', url);
                        xhr.send();
                    });
                });
            } else {
                this.picturesStorage[q.key] = [];
                if (this.state.loading && this.isPicturesLoaded()) {
                    this.setState({
                        ...this.state,
                        loading: false,
                    });
                }
            }
        });
    };
    initState = (questions) => {
        const dbQuestions = Object.entries(embedKey(questions)).map((q) => q[1]).sort(Test.compareQuestions);
        this.questionsCount = dbQuestions.length;
        const currentQuestion = dbQuestions[0] as IQuestion<AnyQuestionData>;
        debugger;

        this.setState({
            ...this.state,
            questions: dbQuestions as IQuestion<AnyQuestionData>[],
            currentQuestion: currentQuestion,
        }, () => {
            this.loadPictures();
        });
    };
    private picturesStorage: any;
    private questionsCount: number;

    constructor(props) {
        super(props);

        // if (auth.currentUser) {
        //
        //     this.state = {
        //         user: null,
        //         loading: true,
        //         showQuestionsList: true,
        //     };
        // } else {
        //
        //     this.props.history.push('/');
        // }

        this.state = {
            loading: true,
            showQuestionsList: true,
            showDoneTestDialog: false,
        };
    }

    static compareQuestions(a, b: any) {
        return a.order - b.order;
    }

    componentDidMount() {
        database.ref('/users/khinartur').once('value')
            .then((snapshot) => {
                this.setState({
                    ...this.state,
                    user: snapshot.val(),
                }, () => {
                    this.getTestQuestions().then((snapshot) => {
                        const questions = snapshot.val();
                        if (this.state.user.test_status == EUserTestStatus.not_passed) {
                            database.ref('passed-questions/' + this.state.user.github).set(questions).then(() => {
                                database.ref('users/' + this.state.user.github).set({
                                    ...this.state.user,
                                    test_status: EUserTestStatus.in_progress,
                                    current_question: 1,
                                }).then(() => {
                                    this.initState(questions);
                                });
                            });
                        } else {
                            this.initState(questions);
                        }
                    });
                });
            });
    }

    render() {
        const {checkMode} = this.props;

        debugger;

        return (
            <React.Fragment>
                {this.state.loading &&
                <div className={AppStyles.progress}>
                    <LinearProgress/>
                </div>
                }
                {
                    !checkMode && !this.state.loading &&
                    <React.Fragment>

                        {
                            this.state.showQuestionsList &&
                            <QuestionsList
                                mode={EQuestionsListMode.passing}
                                questions={this.state.questions}
                                onClick={this.onQuestionsListClick}
                            />
                        }
                        {
                            !this.state.showQuestionsList &&
                            <TestQuestion
                                question={this.state.currentQuestion}
                                questionsCount={this.questionsCount}
                                pictures={this.picturesStorage[this.state.currentQuestion.key]}
                                mode={EQuestionMode.passing}
                                onList={this.toList}
                                onBack={this.onBack}
                                onNext={this.onNext}
                                onAnswer={this.onAnswer}
                                onAnswerSave={this.onAnswerSave}
                                user={this.state.user}
                            />
                        }
                        {
                            this.state.showQuestionsList &&
                            <div style={{margin: '25px'}}>
                                <Button variant='contained'
                                        color='primary'
                                        fullWidth={false}
                                        onClick={this.onDone}>
                                    Завершить тест
                                </Button>
                            </div>
                        }
                    </React.Fragment>
                }
                {
                    !this.state.loading && checkMode &&
                    <React.Fragment>
                        <div className={TestStyles.checkModeContaiter}>
                            <div className={TestStyles.checkModeContaiterItem}>
                                <QuestionsList
                                    mode={EQuestionsListMode.checking}
                                    questions={this.state.questions}
                                    onClick={this.onQuestionsListClick}
                                />
                            </div>
                            <div className={TestStyles.checkModeContaiterItem}>
                                <TestQuestion
                                    question={this.state.currentQuestion}
                                    questionsCount={this.questionsCount}
                                    pictures={this.picturesStorage[this.state.currentQuestion.key]}
                                    mode={EQuestionMode.checking}
                                />
                            </div>
                        </div>
                    </React.Fragment>
                }
                <DoneTestDialog open={this.state.showDoneTestDialog}
                                onClose={this.closeDoneTestDialog}
                                onSubmit={this.onDialogSubmit}/>
            </React.Fragment>
        );
    }
}

export default withRouter(Test);
