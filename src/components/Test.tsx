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

interface Props {
}

interface State {
    questions?: IQuestion<AnyQuestionData>[];
    currentQuestion?: IQuestion<AnyQuestionData>;

    user: IUser;
    loading: boolean;
    showQuestionsList: boolean;
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

    onDone = () => {
        this.setState({
            ...this.state,
            loading: true,
        });

        database.ref('users/' + this.state.user.github).set({
            test_status: EUserTestStatus.passed,
        }).then(() => {
            this.props.history.push('/profile');
        });
    };

    onNext = () => {
        const questions = this.state.questions;
        const current = this.state.currentQuestion;

        this.setState({
            ...this.state,
            currentQuestion: questions[current.order + 1],
        });
    };
    toList = () => {
        this.setState({
            ...this.state,
            showQuestionsList: true,
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

        if (user.test_status == EUserTestStatus.in_progress) {
            return database.ref(`/passed-questions/${user.github}`).once('value');
        } else {
            return database.ref('/questions').once('value');
        }
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
                            if (this.state.loading) {
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
                if (this.state.loading) {
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
        }
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

        return (
            <React.Fragment>
                {this.state.loading &&
                <div className={AppStyles.progress}>
                    <LinearProgress/>
                </div>
                }
                {
                    !this.state.loading && this.state.showQuestionsList &&
                    <QuestionsList
                        mode={EQuestionsListMode.passing}
                        questions={this.state.questions}
                        onClick={this.onQuestionsListClick}
                    />
                }
                {
                    !this.state.loading && !this.state.showQuestionsList &&
                    <TestQuestion
                        question={this.state.currentQuestion}
                        questionsCount={this.questionsCount}
                        pictures={this.picturesStorage[this.state.currentQuestion.key]}
                        mode={EQuestionMode.passing}
                        onBack={this.toList}
                        onNext={this.onNext}
                        user={this.state.user}
                    />
                }
                <div style={{margin: '25px'}}>
                    <Button variant='contained'
                            color='primary'
                            fullWidth={false}
                            onClick={this.onDone}>
                        Завершить тест
                    </Button>
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(Test);
