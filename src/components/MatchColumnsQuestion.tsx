import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import MenuUp from 'mdi-material-ui/MenuUp';
import MenuDown from 'mdi-material-ui/MenuDown';

import * as MatchColumnsQuestionStyles from '../styles/MatchColumnsQuestion.scss';
import {
    IMatchAnswer, IMatchColumnsData, IQuestionProps, IQuestionState, EQuestionMode, IChooseAnswer, IQuestion
} from '../interfaces/IQuestion';

import {shuffle} from '../utils/key-embedding';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

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
            return;
        }

        const newAnswer = {
            left: this.state.answerTextLeft,
            right: this.state.answerTextRight,
            user_answer: '',
            color: '#000000',
        };

        this.props.onAnswerAdd(newAnswer);

        this.setState({
            ...this.state,
            answers: this.state.answers ? [...this.state.answers, newAnswer] : [newAnswer],
            answerTextLeft: '',
            answerTextRight: '',
        });
    };

    onAnswer = (evt, dir, index) => {
        const {answers} = this.state;
        const {rightAnswers} = this.state.passMode;
        const {question, onAnswer} = this.props;

        const down = dir == 'down';
        if (down && index == this.state.answers.length - 1 ||
            !down && index == 0) return;

        const bIndex = down ? index + 1 : index - 1;

        const [a, b] = [rightAnswers[index], rightAnswers[bIndex]];
        [rightAnswers[index], rightAnswers[bIndex]] = [b, a];

        let newAnswers = [];

        newAnswers.push(
            {
                ...answers[index],
                user_answer: b,
            } as IMatchAnswer,
            {
                ...answers[bIndex],
                user_answer: a,
            } as IMatchAnswer
        );

        answers.forEach((a: IMatchAnswer, i: number) => {
            if (i !== index && i !== bIndex) {
                const an = rightAnswers[i];
                newAnswers.push({
                    ...a,
                    user_answer: an,
                } as IMatchAnswer);
            }
        });

        onAnswer({
            ...question,
            questionData: {
                ...question.questionData,
                answers: newAnswers,
            },
        } as IQuestion<IMatchColumnsData>);


        this.setState({
            ...this.state,
            passMode: {
                ...this.state.passMode,
                rightAnswers: rightAnswers,
            }
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            answers: this.props.question ? this.props.question.questionData.answers : null,
        };
    }

    componentWillMount() {
        const {question, mode, onAnswer} = this.props;

        if (mode === EQuestionMode.passing) {
            let [leftAnswers, rightAnswers] = [[], []];
            question.questionData.answers.map((answer: IMatchAnswer) => {
                leftAnswers.push(answer.left);
                rightAnswers.push(answer.right);
            });

            this.setState({
                ...this.state,
                passMode: {
                    ...this.state.passMode,
                    leftAnswers: leftAnswers,
                    rightAnswers: shuffle(rightAnswers),
                }
            }, () => {
                let newAnswers = question.questionData.answers.map((a: IMatchAnswer, i: number) => {
                    const an = rightAnswers[i];
                    return {
                        ...a,
                        user_answer: an,
                    } as IMatchAnswer;
                });
                onAnswer({
                    ...question,
                    questionData: {
                        ...question.questionData,
                        answers: newAnswers,
                    },
                } as IQuestion<IMatchColumnsData>);
            });
        }
    }

    render() {
        const {question, mode} = this.props;

        return (
            <div>
                {
                    mode === EQuestionMode.editing &&
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
                                               name: 'answerTextLeft',
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
                                               name: 'answerTextRight',
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
                    mode == EQuestionMode.passing &&
                    <div>
                        {
                            question.questionData.answers.map((a: IMatchAnswer, i: number) => {
                                return (
                                    <div key={i} className={MatchColumnsQuestionStyles.matchRow}>
                                        <Paper className={MatchColumnsQuestionStyles.answerPaper}>
                                            <div className={MatchColumnsQuestionStyles.matchTypography}>
                                                <Typography variant="body2">
                                                    {this.state.passMode.leftAnswers[i]}
                                                </Typography>
                                            </div>
                                        </Paper>
                                        <Paper className={MatchColumnsQuestionStyles.answerPaper}>
                                            <div className={MatchColumnsQuestionStyles.matchTypography}>
                                                <Typography variant="body2"
                                                            className={MatchColumnsQuestionStyles.matchTypography}>
                                                    {this.state.passMode.rightAnswers[i]}
                                                </Typography>
                                            </div>
                                            <IconButton aria-label="Dows"
                                                        onClick={(evt) => this.onAnswer(evt, 'down', i)}
                                                        style={{float: 'right'}}>
                                                <MenuDown/>
                                            </IconButton>
                                            <IconButton aria-label="Up"
                                                        onClick={(evt) => this.onAnswer(evt, 'up', i)}
                                                        style={{float: 'right'}}>
                                                <MenuUp/>
                                            </IconButton>
                                        </Paper>
                                    </div>
                                );
                            })
                        }
                    </div>
                }
                {
                    mode == EQuestionMode.checking &&
                    <div>
                        {
                            question.questionData.answers.map((a: IMatchAnswer, i: number) => {
                                return (
                                    <div key={i} className={MatchColumnsQuestionStyles.matchRow}>
                                        <Paper className={MatchColumnsQuestionStyles.answerPaper}>
                                            <div className={MatchColumnsQuestionStyles.matchTypography}>
                                                <Typography variant="body2">
                                                    {a.left}
                                                </Typography>
                                            </div>
                                        </Paper>
                                        <Paper className={MatchColumnsQuestionStyles.answerPaper}>
                                            <div className={MatchColumnsQuestionStyles.matchTypography}>
                                                <Typography variant="body2"
                                                            className={MatchColumnsQuestionStyles.matchTypography}>
                                                    {a.user_answer || a.right}
                                                </Typography>
                                            </div>
                                        </Paper>
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
