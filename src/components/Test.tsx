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

    user: IUser;
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
        this.setState({
            ...this.state,
            loading: true,
        });

        database.ref('users/' + this.state.user.github).set({
            ...this.state.user,
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
        const questions = this.state.questions;
        const current = this.state.currentQuestion;
        const toStart = current.order == questions.length;

        this.setState({
            ...this.state,
            currentQuestion: questions[toStart ? 0 : current.order],
        });
    };
    toList = () => {
        this.setState({
            ...this.state,
            showQuestionsList: true,
        });
    };
    onAnswer = (a: QuestionAnswer[] | string, isAnswered: boolean) => {
        const currentQuestion = this.state.currentQuestion;

        switch (this.state.currentQuestion.type) {
            case QuestionType.choose_right:
                this.setState({
                    ...this.state,
                    currentQuestion: {
                        ...currentQuestion,
                        questionData: {
                            ...currentQuestion.questionData,
                            answers: a,
                        },
                        isAnswered,
                    } as IQuestion<IChooseRightData>,
                }, () => this.updateQuestionsList());
                break;
            case QuestionType.match_columns:
                const newCurrent = {
                    ...currentQuestion,
                    questionData: {
                        ...currentQuestion.questionData,
                        answers: a,
                    },
                    isAnswered,
                } as IQuestion<IMatchColumnsData>;
                debugger;
                this.setState({
                    ...this.state,
                    currentQuestion: newCurrent,
                }, () => this.updateQuestionsList());
                break;
            case QuestionType.open_question:
                this.setState({
                    ...this.state,
                    currentQuestion: {
                        ...currentQuestion,
                        questionData: {
                            answer: a,
                        },
                        isAnswered,
                    } as IQuestion<IOpenQuestionData>,
                }, () => this.updateQuestionsList());
                break;
        }
    };
    updateQuestionsList = () => {
        const currentQuestion = this.state.currentQuestion;
        let modifiedQuestions = this.state.questions.map((q: IQuestion<AnyQuestionData>) => {
            if (q.key == currentQuestion.key) {
                return currentQuestion;
            }

            return q;
        });

        debugger;
        this.setState({
            ...this.state,
            questions: modifiedQuestions,
        });
    };
    onQuestionsListClick = (evt, index) => {
        const questions = this.state.questions;

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
        //     debugger;
        //     this.state = {
        //         user: null,
        //         loading: true,
        //         showQuestionsList: true,
        //     };
        // } else {
        //     debugger;
        //     this.props.history.push('/');
        // }

        this.state = {
            user: {
                name: 'Arthur',
                surname: 'Khineltsev',
                github: 'khinartur',
                test_status: EUserTestStatus.not_passed,
                test_is_checked: false,
                current_question: 0,
                points: 0,
            } as IUser,
            loading: true,
            showQuestionsList: true,
            showDoneTestDialog: false,
        };
    }

    static compareQuestions(a, b: any) {
        return a.order - b.order;
    }

    componentDidMount() {
        const {user} = this.state;

        this.getTestQuestions().then((snapshot) => {
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
    }

    render() {
        const {checkMode} = this.props;

        try {
            console.log('[Test#render]');
            console.dir((this.state.currentQuestion.questionData as any).answers);
        } catch {
            // ignore
        }

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
                                onBack={this.toList}
                                onNext={this.onNext}
                                onAnswer={this.onAnswer}
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
