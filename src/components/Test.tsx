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
import * as TestQuestionStyles from '../styles/TestQuestion.scss';
import {checkModeContaiter} from '../styles/Test.scss';

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

        const userPoints = +user.points;
        database.ref('passed-questions/' + user.github + '/' + currentQuestion.key).set({
            ...newCurrent,
        }).then(() => {
            database.ref('users/' + user.github).set({
                ...user,
                points: userPoints + +points,
            }).then(() => {
                this.updateQuestionsList();
            });
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
        const {history, checkMode} = this.props;
        const {questions, currentQuestion} = this.state;
        const toStart = currentQuestion.order == questions.length;
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
        const {questions, currentQuestion} = this.state;
        const toEnd = currentQuestion.order == 1;
        const newCurrent = questions[toEnd ? questions.length - 1 : currentQuestion.order - 2];
        this.props.history.replace(`/test/${newCurrent.order}`);

        this.setState({
            ...this.state,
            currentQuestion: newCurrent,
        });
    };
    toList = () => {
        this.props.history.replace('/test');

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

        const isChecked = currentQuestion.type === QuestionType.choose_right ||
            currentQuestion.type === QuestionType.match_columns;

        database.ref('passed-questions/' + user.github + '/' + currentQuestion.key).set({
            ...currentQuestion,
            isAnswered: true,
            isChecked,
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
        const {loading, questions} = this.state;

        this.picturesStorage = new Array(questions.length);
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
                            if (this.picturesStorage[q.key]) {
                                this.picturesStorage[q.key].push(objectURL);
                            } else {
                                this.picturesStorage[q.key] = [objectURL];
                            }
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
        const userLogin = checkMode ? user.github : this.state.userLogin;

        database.ref(`/users/${userLogin}`).once('value')
            .then((snapshot) => {
                this.setState({
                    ...this.state,
                    user: snapshot.val(),
                }, () => {
                    this.getTestQuestions().then((snapshot) => {
                        const {user} = this.state;
                        const questions = snapshot.val();
                        if (user.test_status == EUserTestStatus.not_passed) {
                            database.ref('passed-questions/' + user.github).set(questions).then(() => {
                                database.ref('users/' + user.github).set({
                                    ...user,
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
        const {loading, showQuestionsList, questions, currentQuestion, user, showDoneTestDialog} = this.state;
        const {checkMode, toStudentList} = this.props;

        return (
            <React.Fragment>
                {loading &&
                <div className={AppStyles.progress}>
                    <LinearProgress/>
                </div>
                }
                {
                    !checkMode && !loading &&
                    <React.Fragment>

                        {
                            showQuestionsList &&
                            <QuestionsList
                                mode={EQuestionsListMode.passing}
                                questions={questions}
                                onClick={this.onQuestionsListClick}
                            />
                        }
                        {
                            !showQuestionsList &&
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
                        {
                            showQuestionsList &&
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
                    !loading && checkMode &&
                    <React.Fragment>
                        <div className={TestQuestionStyles.toQuestionsButton}>
                            <Button variant='contained'
                                    color='primary'
                                    fullWidth={false}
                                    onClick={toStudentList}>
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
