import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {IUser} from '../interfaces/IUser';
import {
    AnyQuestionData, IChooseRightData, IMatchColumnsData, IOpenQuestionData, IQuestion,
    QuestionType
} from '../interfaces/IQuestion';
import {database} from '../modules/firebase';
import ChooseRightQuestion from './ChooseRightQuestion';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {embedKey} from '../utils/key-embedding';
import MatchColumnsQuestion from './MatchColumnsQuestion';
import OpenQuestion from './OpenQuestion';

import '../styles/Test.scss';
import Button from '@material-ui/core/Button';

interface Props {
    user: IUser;
}

interface State {
    questions?: IQuestion<AnyQuestionData>[];
    currentQuestion?: IQuestion<AnyQuestionData>;
    currentQNumber?: number;
    done?: boolean;
    loading: boolean;
}

class Test extends React.Component<Props & RouteComponentProps<{}>, State> {
    private passedQuestions: IQuestion<AnyQuestionData>[] = [];

    onDone = () => {
        let pointsSum = 0;
        this.state.questions.map((q: IQuestion<AnyQuestionData>) => {
            pointsSum += q.points;
        });

        let doneQuestions = [];
        new Array(this.state.questions.length).fill(true).map((v: boolean, i: number) => {
            if (i <= this.state.currentQNumber) {
                doneQuestions.push(this.passedQuestions[i]);
            } else {
                doneQuestions.push(this.state.questions[i]);
            }
        });

        database.ref('passed-questions/' + this.props.user.github).set({
            ...doneQuestions,
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

    onQuestionPass = (passedQuestion: IQuestion<AnyQuestionData>) => {
        this.passedQuestions.push(passedQuestion);
        let currentQNumber = this.state.currentQNumber;
        const currentQuestions = this.state.questions;

        if (currentQNumber + 1 > currentQuestions.length) {
            const newQuestions = this.passedQuestions;
            this.passedQuestions = [];
            this.setState({
                ...this.state,
                questions: newQuestions,
                currentQuestion: this.passedQuestions[0],
                currentQNumber: 0,
            });
        } else {
            currentQNumber += 1;
            this.setState({
                ...this.state,
                currentQuestion: this.state.questions[currentQNumber],
                currentQNumber: currentQNumber,
            });
        }
    };

    constructor(props) {
        super(props);

        this.state = {
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
                done: false,
                loading: false,
            });
        });
    }

    render() {
        return (
            <div className={'container'}>
                <Button variant="contained"
                        color="primary"
                        className={'done-test-button'}
                        fullWidth={false}
                        onClick={this.onDone}>
                    Завершить тест
                </Button>
                {
                    !this.state.loading && !this.state.done &&
                    <div>
                        {this.state.currentQuestion.type === QuestionType.choose_right &&
                        <ChooseRightQuestion question={this.state.currentQuestion as IQuestion<IChooseRightData>}
                                             count={this.state.questions.length}
                                             mode={'pass'}
                                             onPass={this.onQuestionPass}/>}
                        {this.state.currentQuestion.type === QuestionType.match_columns &&
                        <MatchColumnsQuestion question={this.state.currentQuestion as IQuestion<IMatchColumnsData>}
                                              count={this.state.questions.length}
                                              mode={'pass'}
                                              onPass={this.onQuestionPass}/>}
                        {this.state.currentQuestion.type === QuestionType.open_question &&
                        <OpenQuestion question={this.state.currentQuestion as IQuestion<IOpenQuestionData>}
                                      count={this.state.questions.length}
                                      mode={'pass'}
                                      onPass={this.onQuestionPass}/>}
                    </div>
                }
                {
                    !this.state.loading && this.state.done &&
                    <Paper className={'test-done-paper'}>
                        <Typography variant="body1" align={'center'}>
                            Тест пройден. Следите за новостями портала.
                        </Typography>
                    </Paper>
                }
            </div>

        );
    }
}

export default withRouter(Test);
