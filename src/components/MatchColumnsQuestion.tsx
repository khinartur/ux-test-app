import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import * as AppStyles from '../styles/App.scss';
import * as MatchColumnsQuestionStyles from '../styles/MatchColumnsQuestion.scss';
import * as TestEditFormStyles from '../styles/TestEditForm.scss';
import * as TestStyles from '../styles/Test.scss';

import {
    IMatchAnswer, IMatchColumnsData, QuestionType, IQuestionProps, IQuestionState, IChooseAnswer
} from '../interfaces/IQuestion';
import {MATCH_COLUMNS_POINTS} from '../constants/points';
import {database, storageRef} from '../modules/firebase';
import {shuffle} from '../utils/key-embedding';

interface Props extends IQuestionProps<IMatchColumnsData> {
}

interface State extends IQuestionState<IMatchAnswer> {
    error?: string;
    answerTextLeft?: string;
    answerTextRight?: string;
}

export default class MatchColumnsQuestion extends React.Component<Props, State> {

    onAnswerChange = (evt) => {
        this.setState({
            ...this.state,
            [evt.target.name]: evt.target.value,
        });
    };
    onAnswerAdd = () => {
        if (!this.state.answerTextLeft || !this.state.answerTextRight) {
            this.setState({
                ...this.state,
                error: 'Ответ ни в каком из стобцов не должен быть пустым',
            });
        }

        const newAnswer = {
            left: this.state.answerTextLeft,
            right: this.state.answerTextRight,
            user_answer: null,
        };

        this.props.onAnswerAdd(newAnswer);

        this.setState({
            ...this.state,
            answers: this.state.answers ? [...this.state.answers, newAnswer] : [newAnswer],
            answerTextLeft: null,
            answerTextRight: null,
        });
    };

    onAnswer = (evt) => {
        console.log(evt.target.textContent);
        const answerText = evt.target.textContent;
        const answers = this.state.answers;

        // const currentAnswer = this.state.passMode.answer || {};
        // switch (evt.target.name) {
        //     case 'left':
        //         currentAnswer.left = answerText;
        //         if (currentAnswer.right) {
        //             let dbAnswer = answers.filter((ans: IMatchAnswer) => ans.left == currentAnswer.left)[0];
        //             dbAnswer.user_answer = currentAnswer.right;
        //             evt.currentTarget.style.display = 'none';
        //             this.setState({
        //                 ...this.state,
        //                 passMode: {
        //                     ...this.state.passMode,
        //                     answer: null,
        //                 }
        //             });
        //         } else {
        //             evt.currentTarget.style.backgroundColor = '#009688';
        //         }
        //         break;
        //     case 'right':
        //         currentAnswer.right = answerText;
        //         if (currentAnswer.left) {
        //             let dbAnswer = answers.filter((ans: IMatchAnswer) => ans.left == currentAnswer.left)[0];
        //             dbAnswer.user_answer = currentAnswer.right;
        //             evt.currentTarget.style.display = 'none';
        //             this.setState({
        //                 ...this.state,
        //                 passMode: {
        //                     ...this.state.passMode,
        //                     answer: null,
        //                 }
        //             });
        //         } else {
        //             evt.currentTarget.style.backgroundColor = '#009688';
        //         }
        //         break;
        // }
		//
		//
        // console.log('MATCH COLUMNS ANSWERS:');
        // console.dir(answers);
    };

    constructor(props) {
        super(props);

        this.state = {
            answers: this.props.question ? this.props.question.questionData.answers : null,
        };
    }

    componentDidMount() {
        if (this.props.mode === 'pass') {
            let [leftAnswers, rightAnswers] = [[], []];
            this.state.answers.map((answer: IMatchAnswer) => {
                leftAnswers.push(answer.left);
                rightAnswers.push(answer.right);
            });

            this.setState({
                ...this.state,
                passMode: {
                    ...this.state.passMode,
                    leftAnswers: shuffle(leftAnswers),
                    rightAnswers: shuffle(rightAnswers),
                }
            });
        }
    }

    render() {
        const {mode} = this.props;

        return (
            <div>
                {
                    mode === 'edit' &&
                    <Paper className={MatchColumnsQuestionStyles.matchColumnsEditPaper}>
                        <div>
                            {
                                this.state.answers && this.state.answers.length ?
                                    this.state.answers.map((answer: IMatchAnswer, index: number) => {
                                        return <Paper key={index}>
                                            {answer.left + '   =====>   ' + answer.right}
                                        </Paper>;
                                    })
                                    :
                                    <div>Нет вариантов ответа.</div>
                            }
                        </div>
                        <br/>
                        <div className={MatchColumnsQuestionStyles.matchAnswerVariant}>
                            <div>
                                <TextField label='Левый столбец'
                                           fullWidth={true}
                                           margin={'dense'}
                                           inputProps={{
                                               name: 'left',
                                           }}
                                           onChange={this.onAnswerChange}
                                           value={this.state.answerTextLeft}
                                />
                            </div>
                            <div>
                                <TextField label='Правый столбец'
                                           fullWidth={true}
                                           margin={'dense'}
                                           inputProps={{
                                               name: 'right',
                                           }}
                                           onChange={this.onAnswerChange}
                                           value={this.state.answerTextRight}
                                />
                            </div>
                            <div>
                                <Button variant="contained"
                                        color="primary"
                                        onClick={this.onAnswerAdd}>
                                    Сохранить
                                </Button>
                            </div>
                        </div>
                    </Paper>
                }
                {
                    mode === 'pass' &&
                    <div>
                        {
                            new Array(this.state.answers.length).fill(true).map((n: boolean, i: number) => {
                                return (
                                    <div key={i} className={MatchColumnsQuestionStyles.matchRow}>
                                        <div>
                                            <Button variant="contained"
                                                    color="primary"
                                                    fullWidth={true}
                                                    name={'left'}
                                                    onClick={(evt) => this.onAnswer(evt)}>
                                                {this.state.passMode.leftAnswers[i]}
                                            </Button>
                                        </div>
                                        <div>
                                            <Button variant="contained"
                                                    color="primary"
                                                    fullWidth={true}
                                                    name={'right'}
                                                    onClick={(evt) => this.onAnswer(evt)}>
                                                {this.state.passMode.rightAnswers[i]}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                }
            </div>
        );
    }
}
