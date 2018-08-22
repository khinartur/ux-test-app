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
    IMatchAnswer, IMatchColumnsData, QuestionType, IQuestionProps, IQuestionState, IChooseAnswer, EQuestionMode
} from '../interfaces/IQuestion';
import {MATCH_COLUMNS_POINTS} from '../constants/points';
import {database, storageRef} from '../modules/firebase';
import {shuffle} from '../utils/key-embedding';
import {Req} from 'awesome-typescript-loader/dist/checker/protocol';

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
    onReset = () => {
        this.allAnswersButtons.map((ref: any) => {
            ref.current.style.backgroundColor = '#000000';
        });

        let resetAnswers = [];
        this.state.answers.map((answer: IMatchAnswer) => {
            resetAnswers.push({
                ...answer,
                user_answer: '',
                color: '#000000',
            });
        });

        this.setState({
            ...this.state,
            answers: resetAnswers,
        });

        this.props.onReset();
    };
    onAnswer = (evt) => {
        console.log(evt.target.textContent);
        const answerText = evt.target.textContent;
        const answers = this.state.answers;

        const currentAnswer = this.state.passMode.answer || {};

        switch (evt.currentTarget.name) {
            case 'left':
                this.state.passMode.leftAnswers.map((a: any) => {
                    if (a.text !== answerText) return;
                    a.color = this.materialColors[this.answerNumber];
                });
                if (currentAnswer.right) {
                    let dbAnswer = answers.filter((ans: IMatchAnswer) => ans.left == currentAnswer.left)[0];
                    dbAnswer.user_answer = currentAnswer.right;
                    dbAnswer.color = this.materialColors[this.answerNumber];
                    evt.currentTarget.style.backgroundColor = this.materialColors[this.answerNumber];
                    this.answerNumber += 1;
                    this.setState({
                        ...this.state,
                        passMode: {
                            ...this.state.passMode,
                            answer: null,
                        }
                    });
                    this.props.onAnswer(dbAnswer);
                } else {
                    if (this.previousAnswerButton) {
                        this.previousAnswerButton.style.backgroundColor = '#000000';
                        this.previousAnswerButton = evt.currentTarget;
                    }
                    evt.currentTarget.style.backgroundColor = this.materialColors[this.answerNumber];
                    this.setState({
                        ...this.state,
                        passMode: {
                            ...this.state.passMode,
                            answer: {
                                left: answerText,
                                color: this.materialColors[this.answerNumber],
                            },
                        }
                    });
                }
                break;
            case 'right':
                this.state.passMode.rightAnswers.map((a: any) => {
                    if (a.text !== answerText) return;
                    a.color = this.materialColors[this.answerNumber];
                });
                if (currentAnswer.left) {
                    let dbAnswer = answers.filter((ans: IMatchAnswer) => ans.left == currentAnswer.left)[0];
                    dbAnswer.user_answer = answerText;
                    dbAnswer.color = this.materialColors[this.answerNumber];
                    evt.currentTarget.style.backgroundColor = this.materialColors[this.answerNumber];
                    this.answerNumber += 1;
                    this.setState({
                        ...this.state,
                        passMode: {
                            ...this.state.passMode,
                            answer: null,
                        }
                    });
                    this.props.onAnswer(dbAnswer);
                } else {
                    if (this.previousAnswerButton) {
                        this.previousAnswerButton.style.backgroundColor = '#000000';
                        this.previousAnswerButton = evt.currentTarget;
                    }
                    evt.currentTarget.style.backgroundColor = this.materialColors[this.answerNumber];
                    this.setState({
                        ...this.state,
                        passMode: {
                            ...this.state.passMode,
                            answer: {
                                right: answerText,
                                color: this.materialColors[this.answerNumber],
                            },
                        }
                    });
                }
                break;
        }


        console.log('MATCH COLUMNS ANSWERS:');
        console.dir(answers);
    };
    private answerNumber = 0;
    private materialColors = ['#aa2e25', '#2c387e', '#00695f', '#1769aa', '#357a38', '#482880', '#8f9a27',
        '#b23c17', '#b26a00'];
    private previousAnswerButton;
    private allAnswersButtons = [];

    constructor(props) {
        super(props);

        this.state = {
            answers: this.props.question ? this.props.question.questionData.answers : null,
        };
    }

    componentWillMount() {
        if (this.props.mode === EQuestionMode.passing) {
            let [leftAnswers, rightAnswers] = [[], []];
            this.state.answers.map((answer: IMatchAnswer) => {
                leftAnswers.push({text: answer.left, bgColor: answer.color});
                rightAnswers.push({text: answer.right, bgColor: answer.color});
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
        this.allAnswersButtons = [];

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
                    (mode === EQuestionMode.passing || mode == EQuestionMode.checking) &&
                    <div>
                        {
                            this.state.answers.map((a: IMatchAnswer, i: number) => {
                                const ref1 = React.createRef();
                                const ref2 = React.createRef();
                                this.allAnswersButtons.push(ref1, ref2);
                                return (
                                    <div key={i} className={MatchColumnsQuestionStyles.matchRow}>
                                        <div className={MatchColumnsQuestionStyles.answerButton}>
                                            <Button variant="contained"
                                                    color="primary"
                                                    style={{
                                                        backgroundColor: this.state.passMode.rightAnswers[i].bgColor,
                                                    }}
                                                    buttonRef={ref1}
                                                    fullWidth={true}
                                                    name={'left'}
                                                    disabled={mode == EQuestionMode.checking}
                                                    onClick={(evt) => this.onAnswer(evt)}>
                                                {this.state.passMode.leftAnswers[i].text}
                                            </Button>
                                        </div>
                                        <div className={MatchColumnsQuestionStyles.answerButton}>
                                            <Button variant="contained"
                                                    color="primary"
                                                    style={{
                                                        backgroundColor: this.state.passMode.rightAnswers[i].bgColor,
                                                    }}
                                                    buttonRef={ref2}
                                                    fullWidth={true}
                                                    name={'right'}
                                                    disabled={mode == EQuestionMode.checking}
                                                    onClick={(evt) => this.onAnswer(evt)}>
                                                {this.state.passMode.rightAnswers[i].text}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        }
                        {mode !== EQuestionMode.checking &&
                        <div className={MatchColumnsQuestionStyles.resetButton}>
                            <Button variant="contained"
                                    color="primary"
                                    fullWidth={true}
                                    name={'left'}
                                    onClick={this.onReset}>
                                Сбросить
                            </Button>
                        </div>
                        }
                    </div>
                }
            </div>
        );
    }
}
