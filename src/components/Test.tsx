import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {EUserTestStatus, IUser} from '../interfaces/IUser';
import {
    AnyQuestionData,
    EQuestionMode,
    IChooseAnswer,
    IChooseRightData,
    IMatchAnswer,
    IMatchColumnsData,
    IQuestion,
    QuestionType
} from '../interfaces/IQuestion';
import {storageRef} from '../modules/firebase';
import {embedKey} from '../utils/utils';
import * as TestStyles from '../styles/Test.scss';
import Button from '@material-ui/core/Button';
import * as AppStyles from '../styles/App.scss';
import LinearProgress from '@material-ui/core/LinearProgress';
import QuestionsList, {EQuestionsListMode} from './QuestionsList';
import TestQuestion from './TestQuestion';
import DoneTestDialog from './DoneTestDialog';
import * as TestQuestionStyles from '../styles/TestQuestion.scss';
import {
    getPassedQuestions,
    getQuestions,
    getUser,
    savePassedQuestion,
    setPassedQuestions,
    updateUser
} from '../api/api-database';
import {updateUserModel} from '../model/UserModel';

interface Props {
    checkMode?: boolean;
    onCheck?: () => void;
    toStudentList?: () => void;
    user?: IUser;
}

interface State {
    questions?: IQuestion<AnyQuestionData>[];
    currentQuestion?: IQuestion<AnyQuestionData>;
    locationNumber?: number;

    userLogin?: string;
    user?: IUser;
    loading: boolean;
    showQuestionsList: boolean;
    showDoneTestDialog: boolean;
}

class Test extends React.Component<Props & RouteComponentProps<{}>, State> {

    onPointsAdd = (evt, points: number) => {
        const {user, currentQuestion} = this.state;

        this.setState({
            ...this.state,
            loading: true,
        });

        const newCurrent = {
            ...currentQuestion,
            points: +points,
            isChecked: true,
        } as IQuestion<AnyQuestionData>;


        savePassedQuestion(user.github, currentQuestion.key, newCurrent)
            .then(() => {
                const userPoints = (user.points | 0) + (points | 0);
                return updateUser(user, {points: userPoints});
            })
            .then(() => {
                this.updateQuestionsList();
            });

        this.setState({
            ...this.state,
            currentQuestion: {
                ...newCurrent
            },
        });
    };
    closeDoneTestDialog = () => {
        this.setState({
            ...this.state,
            showDoneTestDialog: false,
        });
    };
    onDialogSubmit = () => {
        const {history} = this.props;
        const {user, questions} = this.state;

        this.setState({
            ...this.state,
            loading: true,
        });

        const saveQuestionsPromises = [];
        let points = 0;
        questions.forEach((q: IQuestion<AnyQuestionData>) => {
            let answers;
            let goodboy = true;
            switch (q.type) {
                case QuestionType.choose_right:
                    answers = (q as IQuestion<IChooseRightData>).questionData.answers;
                    answers.forEach((a: IChooseAnswer) => {
                        if (a.isAnswered && !a.isRight || !a.isAnswered && a.isRight) {
                            goodboy = false;
                        }
                    });
                    break;

                case QuestionType.match_columns:
                    answers = (q as IQuestion<IMatchColumnsData>).questionData.answers;
                    answers.forEach((a: IMatchAnswer) => {
                        if (a.right !== a.user_answer) {
                            goodboy = false;
                        }
                    });
                    break;

                case QuestionType.open_question:
                    return;
            }

            if (goodboy) {
                points += q.points;
            }
            saveQuestionsPromises.push(
                savePassedQuestion(user.github, q.key, q, {
                    points: goodboy ? q.points : 0,
                    isChecked: true,
                })
            );
        });

        Promise.all(saveQuestionsPromises)
            .then(() => {
                    updateUser(user, {points, test_status: EUserTestStatus.passed})
                        .then(() => {
                            updateUserModel({...user, test_status: EUserTestStatus.passed});
                            history.push('/profile');
                        });
                }
            );
    };
    onDone = () => {
        const {questions} = this.state;

        let isAllAnswered = true;
        questions.map((q: IQuestion<AnyQuestionData>) => {
            if (!q.isAnswered) {
                isAllAnswered = false;
            }
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
        const {history, checkMode} = this.props;
        const {questions, currentQuestion} = this.state;
        const toStart = currentQuestion.order === questions.length;
        const newCurrent = questions[toStart ? 0 : currentQuestion.order];

        if (!checkMode) {
            history.replace(`/test/${newCurrent.order}`);
        }

        this.setState({
            ...this.state,
            currentQuestion: newCurrent,
            loading: false,
        });
    };
    onBack = () => {
        const {history} = this.props;
        const {questions, currentQuestion} = this.state;

        const toEnd = currentQuestion.order === 1;
        const newCurrent = questions[toEnd ? questions.length - 1 : currentQuestion.order - 2];
        history.replace(`/test/${newCurrent.order}`);

        this.setState({
            ...this.state,
            currentQuestion: newCurrent,
        });
    };
    toList = () => {
        const {history} = this.props;

        history.replace('/test');

        this.setState({
            ...this.state,
            showQuestionsList: true,
        });
    };
    onAnswer = (newCurrent: IQuestion<AnyQuestionData>) => {
        this.setState({
            ...this.state,
            currentQuestion: newCurrent,
        });
    };
    onAnswerSave = () => {
        const {user, currentQuestion} = this.state;

        this.setState({
            ...this.state,
            loading: true,
        });

        const isChecked = [QuestionType.choose_right, QuestionType.match_columns].includes(currentQuestion.type);

        savePassedQuestion(user.github, currentQuestion.key, currentQuestion, {
            isAnswered: true,
            isChecked,
        })
            .then(() => {
                updateUser(user, {
                    test_status: EUserTestStatus.in_progress,
                    current_question: currentQuestion.order + 1,
                });
            })
            .then(() => {
                this.updateQuestionsList();
            });
    };
    updateQuestionsList = () => {
        const {questions, currentQuestion} = this.state;

        let modifiedQuestions = questions.map((q: IQuestion<AnyQuestionData>) => {
            if (q.key === currentQuestion.key) {
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
        const {history, checkMode} = this.props;
        const {questions} = this.state;
        const newCurrent = questions[index];

        if (!checkMode) {
            history.replace(`/test/${newCurrent.order}`);
        }

        this.setState({
            ...this.state,
            currentQuestion: newCurrent,
            showQuestionsList: false,
        });
    };
    getTestQuestions = () => {
        const {user} = this.state;

        if (user.test_status === EUserTestStatus.in_progress || user.test_status === EUserTestStatus.passed) {
            return getPassedQuestions(user.github);
        } else {
            return getQuestions();
        }
    };
    isPicturesLoaded = () => {
        return !!this.picturesStorage[this.state.currentQuestion.key];
    };
    loadPictures = () => {
        const {loading, questions} = this.state;

        this.picturesStorage = [];
        questions.map((q: IQuestion<AnyQuestionData>) => {
            const pictures = q.pictures;

            if (pictures) {
                pictures.map((filename: string) => {
                    storageRef.child(`${q.key}/${filename}`).getDownloadURL().then(url => {
                        let xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob';
                        xhr.onload = function () {
                            const blob = xhr.response;
                            const objectURL = URL.createObjectURL(blob);
                            this.picturesStorage[q.key] = this.picturesStorage[q.key] || [];
                            this.picturesStorage[q.key].push(objectURL);
                            if (loading && this.isPicturesLoaded()) {
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
                if (loading && this.isPicturesLoaded()) {
                    this.setState({
                        ...this.state,
                        loading: false,
                    });
                }
            }
        });
    };
    toStudentList = () => {
        const {toStudentList} = this.props;
        const {user, questions} = this.state;

        this.setState({
            ...this.state,
            loading: true,
        });

        let isAllChecked = true;

        questions.forEach((q: IQuestion<AnyQuestionData>) => {
            if (!q.isChecked) {
                isAllChecked = false;
            }
        });


        if (isAllChecked) {
            updateUser(user, {test_is_checked: true})
                .then(() => {
                    this.setState({
                        ...this.state,
                        loading: false,
                    }, () => toStudentList());
                });
        } else {
            this.setState({
                ...this.state,
                loading: false,
            }, () => toStudentList());
        }
    };
    initState = (questions) => {
        const {locationNumber} = this.state;

        const dbQuestions = Object.entries(embedKey(questions)).map((q) => q[1]).sort(Test.compareQuestions);
        const currentQuestion = dbQuestions[locationNumber - 1 || 0] as IQuestion<AnyQuestionData>;

        this.setState({
            ...this.state,
            questions: dbQuestions as IQuestion<AnyQuestionData>[],
            currentQuestion: currentQuestion,
        }, () => {
            this.loadPictures();
        });
    };
    private picturesStorage: any;

    constructor(props) {
        super(props);

        const login = localStorage.getItem('loggedUser');
        if (login) {
            const locationNumber = props.match.params.key;

            this.state = {
                userLogin: login,
                loading: true,
                showQuestionsList: !(!!locationNumber),
                showDoneTestDialog: false,
                locationNumber,
            };

        } else {
            props.history.push('/');
        }
    }

    static compareQuestions(a, b: any) {
        return a.order - b.order;
    }

    componentDidMount() {
        const {user, checkMode} = this.props;
        const {userLogin} = this.state;
        const login = checkMode ? user.github : userLogin;

        getUser(login)
            .then((snapshot) => {
                const user = snapshot.val();
                this.setState({
                    ...this.state,
                    user: user,
                });
                //TODO: what to do if user won't be stated
                return this.getTestQuestions();
            })
            .then((snapshot) => {
                const {user} = this.state;
                const questions = snapshot.val();
                if (user.test_status === EUserTestStatus.not_passed) {
                    setPassedQuestions(user.github, questions)
                        .then(() => {
                            return updateUser(user, {
                                test_status: EUserTestStatus.in_progress,
                                current_question: 1,
                            });
                        })
                        .then(() => {
                            this.initState(questions);
                        });
                } else {
                    this.initState(questions);
                }
            });
    }

    render() {
        const {loading, showQuestionsList, questions, currentQuestion, user, showDoneTestDialog} = this.state;
        const {checkMode} = this.props;

        return (
            <React.Fragment>
                {loading &&
                <div className={AppStyles.progress}>
                    <LinearProgress/>
                </div>
                }
                {!checkMode && !loading &&
                <React.Fragment>
                    {showQuestionsList &&
                    <QuestionsList
                        mode={EQuestionsListMode.passing}
                        questions={questions}
                        onClick={this.onQuestionsListClick}
                    />
                    }
                    {!showQuestionsList &&
                    <TestQuestion
                        question={currentQuestion}
                        questionsCount={questions.length}
                        pictures={this.picturesStorage[currentQuestion.key]}
                        mode={EQuestionMode.passing}
                        onList={this.toList}
                        onBack={this.onBack}
                        onNext={this.onNext}
                        onAnswer={this.onAnswer}
                        onAnswerSave={this.onAnswerSave}
                        onPointsAdd={this.onPointsAdd}
                        user={user}
                    />
                    }
                    {showQuestionsList &&
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
                {!loading && checkMode &&
                <React.Fragment>
                    <div className={TestQuestionStyles.toQuestionsButton}>
                        <Button variant='contained'
                                color='primary'
                                fullWidth={false}
                                onClick={this.toStudentList}>
                            Назад
                        </Button>
                    </div>
                    <div className={TestStyles.checkModeContaiter}>
                        <div className={TestStyles.checkModeContaiterItem}>
                            <QuestionsList
                                mode={EQuestionsListMode.checking}
                                questions={questions}
                                onClick={this.onQuestionsListClick}
                            />
                        </div>
                        <div className={TestStyles.checkModeContaiterItem}>
                            <TestQuestion
                                question={currentQuestion}
                                questionsCount={questions.length}
                                pictures={this.picturesStorage[currentQuestion.key]}
                                mode={EQuestionMode.checking}
                                onPointsAdd={this.onPointsAdd}
                            />
                        </div>
                    </div>
                </React.Fragment>
                }
                <DoneTestDialog open={showDoneTestDialog}
                                onClose={this.closeDoneTestDialog}
                                onSubmit={this.onDialogSubmit}/>
            </React.Fragment>
        );
    }
}

export default withRouter(Test);
