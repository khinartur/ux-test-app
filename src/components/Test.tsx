import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {EUserTestStatus, IUser} from '../interfaces/IUser';
import {
    AnyQuestionData, EQuestionMode, IChooseAnswer, IChooseRightData, IMatchAnswer, IMatchColumnsData, IOpenQuestionData,
    IQuestion,
    QuestionAnswer,
    QuestionType
} from '../interfaces/IQuestion';
import {database, storageRef} from '../modules/firebase';
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
    user: IUser;
}

interface State {
    questions?: IQuestion<AnyQuestionData>[];
    currentQuestion?: IQuestion<AnyQuestionData>;

    loading: boolean;
    showQuestionsList: boolean;
}

class Test extends React.Component<Props & RouteComponentProps<{}>, State> {
    // onDone = () => {
    //     debugger;
    //     this.setState({
    //         loading: true,
    //     }, () => {
    //         debugger;
    //         let pointsSum = 0;
    //         this.state.questions.map((q: IQuestion<AnyQuestionData>) => {
    //             let goodBoy = true;
    //             switch (q.type) {
    //                 case QuestionType.choose_right:
    //                     (q.questionData as IChooseRightData).answers.map((a: IChooseAnswer) => {
    //                         if (a.isAnswered && !a.isRight) goodBoy = false;
    //                     });
    //                     if (goodBoy) pointsSum += q.points;
    //                     q.isChecked = true;
    //                     break;
	//
    //                 case QuestionType.match_columns:
    //                     (q.questionData as IMatchColumnsData).answers.map((a: IMatchAnswer) => {
    //                         if (a.right !== a.user_answer) goodBoy = false;
    //                     });
    //                     if (goodBoy) pointsSum += q.points;
    //                     q.isChecked = true;
    //                     break;
	//
    //                 case QuestionType.open_question:
    //                     if (q.isChecked) {
    //                         pointsSum += q.points;
    //                     }
    //             }
    //         });
	//
    //         database.ref('passed-questions/' + this.props.user.github).set({
    //             ...ejectKey(this.state.questions),
    //         }).then(() => {
    //             database.ref('users/' + this.props.user.github).set({
    //                 ...this.props.user,
    //                 points: pointsSum,
    //                 test_passed: true,
    //                 test_is_checked: false,
    //             }).then(() => {
    //                 if (this.props.checkMode) {
    //                     this.props.onCheck();
    //                     return;
    //                 }
    //                 this.setState({
    //                     ...this.state,
    //                     loading: false,
    //                 });
    //             });
    //         });
    //     });
    // };
    // onAnswer = (answer: QuestionAnswer) => {
    //     const question = this.state.currentQuestion;
    //     switch (question.type) {
    //         case QuestionType.choose_right:
    //             const chData = question.questionData as IChooseRightData;
    //             const answeredChAnswers = chData.answers.filter((v: IChooseAnswer) => v.isAnswered);
    //             this.setState({
    //                 ...this.state,
    //                 currentQuestion: {
    //                     ...this.state.currentQuestion,
    //                     isAnswered: !!answeredChAnswers.length,
    //                 },
    //             });
    //             break;
	//
    //         case QuestionType.match_columns:
    //             const mData = question.questionData as IMatchColumnsData;
    //             //const m = mData.answers.filter((v: IMatchAnswer) => v.left == (answer as IMatchAnswer).left)[0];
    //             const answeredMAnswers = mData.answers.filter((v: IMatchAnswer) => v.user_answer);
    //             this.setState({
    //                 ...this.state,
    //                 currentQuestion: {
    //                     ...this.state.currentQuestion,
    //                     isAnswered: answeredMAnswers.length == mData.answers.length,
    //                 },
    //             });
    //             break;
	//
    //         case QuestionType.open_question:
    //             this.setState({
    //                 ...this.state,
    //                 currentQuestion: {
    //                     ...this.state.currentQuestion,
    //                     questionData: {
    //                         ...this.state.currentQuestion,
    //                         answer: answer,
    //                     } as IOpenQuestionData,
    //                     isAnswered: !!answer,
    //                 },
    //             });
    //     }
    // };
    //
    // onReset = () => {
	//
    //     // let resetAnswers;
    //     //
    //     // switch(this.state.currentQuestion.type) {
    //     //     case QuestionType.match_columns:
    //     //         resetAnswers = (this.state.currentQuestion.questionData as any)
    //     //             .answers.map((a: any) => {
    //     //                 return {...a, user_answer: ''};
    //     //             });
    //     // }
	//
    //     this.setState({
    //         ...this.state,
    //         currentQuestion: {
    //             ...this.state.currentQuestion,
    //             // questionData: {
    //             //     ...this.state.currentQuestion.questionData,
    //             //     answers: resetAnswers,
    //             // },
    //             isAnswered: false,
    //         },
    //     });
    // };
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
        });
    };
    getTestQuestions = () => {
        const {user} = this.props;

        if (user.test_status == EUserTestStatus.in_progress) {
            return database.ref(`/passed-questions/${user.github}`).once('value');
        } else {
            return database.ref('/questions').once('value');
        }
    };
    loadPictures = () => {
        this.picturesStorage = new Array(this.state.questions.length);
        this.state.questions.map((q: IQuestion<AnyQuestionData>, i: number) => {
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
                                this.localStorage[q.key].push(objectURL);
                            } else {
                                this.localStorage[q.key] = [objectURL];
                            }

                            if (this.state.loading && i == 1) {
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
                if (this.state.loading && i == 1) {
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

    static compareQuestions(a, b: any) {
        return a.order - b.order;
    }

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            showQuestionsList: true,
        };
    }

    componentDidMount() {
        const {user} = this.props;

        this.getTestQuestions().then((snapshot) => {
            const questions = snapshot.val();
            if (user.test_status == EUserTestStatus.not_passed) {
                database.ref('passed-questions/' + user.github).set(questions).then(() => {
                    database.ref('users/' + this.props.user.github).set({
                        ...this.props.user,
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
                        user={this.props.user}
                    />
                }
            </React.Fragment>
        );
    }
}

export default withRouter(Test);
