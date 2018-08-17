import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {IUser} from '../interfaces/IUser';
import {AnyQuestion, IChooseRightData, IPassedQuestion, IQuestion, QuestionType} from '../interfaces/IQuestion';
import {database} from '../modules/firebase';
import ChooseRightQuestion from './ChooseRightQuestion';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import '../styles/Test.scss';
import embedKey from '../utils/key-embedding';

interface ITest {
    questions: IQuestion<AnyQuestion>[];
    count: number;
    passedQuestions?: IQuestion<AnyQuestion>[];
    skippedQuestions?: IQuestion<AnyQuestion>[];
    currentPointsSum: number;
}

interface Props {
    user: IUser;
}

interface State {
    test?: ITest;
    currentQuestion?: IQuestion<AnyQuestion>;
    currentQNumber?: number;
    done?: boolean;
    loading: boolean;
}

class Test extends React.Component<Props & RouteComponentProps<{}>, State> {

    saveUserResult = () => {
        database.ref('users/'+this.props.user.github).set({
            ...this.props.user,
            points: this.state.test.currentPointsSum,
            test_passed: true,
            test_is_checked: false,
        }).then(() => {
            this.setState({
                ...this.state,
                done: true,
            });
        });
    };

    onQuestionPass = (passedQuestion: IPassedQuestion) => {
        const currQ = this.state.currentQuestion;

        database.ref('passed-questions/'+this.props.user.github+'/'+currQ.key).set({
            ...passedQuestion,
        }).then(() => {
            const nextQNumber = this.state.currentQNumber + 1;
            const passedQuestions = this.state.test.passedQuestions;
            const currentPointsSum = this.state.test.currentPointsSum + currQ.points;
            let nextQuestion = this.state.test.questions[nextQNumber];

            if (!nextQuestion) {
                const skipped = this.state.test.skippedQuestions;
                if (skipped.length) {
                    this.setState({
                        ...this.state,
                        test: {
                            ...this.state.test,
                            questions: skipped,
                            passedQuestions: [...passedQuestions, currQ],
                            currentPointsSum: currentPointsSum,
                        },
                        currentQuestion: skipped[1],
                        currentQNumber: 1,
                    });
                } else {
                    this.saveUserResult();
                    this.setState({
                        ...this.state,
                        test: {
                            ...this.state.test,
                            passedQuestions: [...passedQuestions, currQ],
                            currentPointsSum: currentPointsSum,
                        },
                    });
                }
            } else {
                this.setState({
                    ...this.state,
                    test: {
                        ...this.state.test,
                        passedQuestions: [...passedQuestions, currQ],
                        currentPointsSum: currentPointsSum,
                    },
                    currentQuestion: nextQuestion,
                    currentQNumber: nextQNumber,
                });
            }
        });
    };

    onQuestionSkip = (skippedQuestion: IQuestion<AnyQuestion>) => {
        this.state.test.skippedQuestions.push(skippedQuestion);
    };

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        Test.getTestQuestions().then(snapshot => {
            const dbQuestions = Object.entries(embedKey(snapshot.val())).map((q) => q[1]);
            this.setState({
                ...this.state,
                test: {
                    questions: dbQuestions as IQuestion<AnyQuestion>[],
                    count: dbQuestions.length,
                    skippedQuestions: [],
                    passedQuestions: [],
                    currentPointsSum: 0,
                },
                currentQNumber: 0,
                currentQuestion: dbQuestions[0] as IQuestion<AnyQuestion>,
                done: false,
                loading: false,
            });
        });
    }

    static getTestQuestions() {
        return database.ref('/questions').once('value');
    }

    render() {

        return (
            <div className={'container'}>
                {
                    !this.state.loading && !this.state.done &&
                    <div>
                        {this.state.currentQuestion.type === QuestionType.choose_right &&
                        <ChooseRightQuestion question={this.state.currentQuestion as IQuestion<IChooseRightData>}
                                             count={this.state.test.count}
                                             mode={'pass'}
                                             onPass={this.onQuestionPass}
                                             onSkip={this.onQuestionSkip}/>}
                        {/*{currentQuestion.type === QuestionType.match_columns &&*/}
                        {/*<ChooseRightQuestion question={currentQuestion as IQuestion<IChooseRightData>} order={} onSuccess={} mode={}/>}*/}
                        {/*{currentQuestion.type === QuestionType.open_question &&*/}
                        {/*<ChooseRightQuestion question={currentQuestion as IQuestion<IChooseRightData>} order={} onSuccess={} mode={}/>}*/}
                        {/**/}
                    </div>
                }
                {
                    !this.state.loading && this.state.done &&
                        <Paper className={'test-done-paper'}>
                            <Typography variant="body1" align={'center'}>
                                Тест пройден. Следите за своими баллами в профиле.
                            </Typography>
                            <br/>
                            <Button variant="contained"
                                    color="primary"
                                    className={'profile-button'}
                                    onClick={() => this.props.history.push('/profile')}>
                                Профиль
                            </Button>
                        </Paper>
                }
            </div>

        );
    }
}

export default withRouter(Test);
