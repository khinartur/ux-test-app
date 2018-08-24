import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import CheckCircle from 'mdi-material-ui/CheckCircle';

import * as ChooseRightQuestionStyles from '../styles/ChooseRightQuestion.scss';

import {
    EQuestionMode,
    IChooseAnswer, IChooseRightData, IQuestion, IQuestionProps, IQuestionState,
} from '../interfaces/IQuestion';

interface Props extends IQuestionProps<IChooseRightData> {
}

//TODO: how to include IError interface?
interface State extends IQuestionState<IChooseAnswer> {
    error?: string;
    answerVariantText?: string;
    answerVariantChecked?: boolean;
    //isAnswered: boolean;
}

export default class ChooseRightQuestion extends React.Component<Props, State> {

    onAnswerChange = (evt) => {
        this.setState({
            ...this.state,
            answerVariantText: evt.target.value,
        });
    };
    onCheckboxChange = (evt) => {
        this.setState({
            ...this.state,
            answerVariantChecked: evt.target.checked,
        });
    };
    onAnswerAdd = () => {
        console.dir(this.state);

        if (!this.state.answerVariantText) {
            this.setState({
                ...this.state,
                error: 'Ответ не должен быть пустым',
            });
        }

        const newAnswer = {
            text: this.state.answerVariantText,
            isRight: this.state.answerVariantChecked,
            isAnswered: false,
        };

        this.props.onAnswerAdd(newAnswer);

        const currentAnswers = this.state.answers;
        this.setState({
            ...this.state,
            answers: currentAnswers && currentAnswers.length ? [...currentAnswers, newAnswer] : [newAnswer],
            answerVariantText: '',
            answerVariantChecked: false,
        });
    };
    onAnswerClick = (evt) => {
        const {question} = this.props;
        const {answers} = this.state;
        console.log(evt.target.value);

        let userAnswer = evt.target.value;

        let newAnswers = answers.map((ans: IChooseAnswer) => {
            if (ans.text == userAnswer) {
                return {
                    ...ans,
                    isAnswered: !ans.isAnswered,
                } as IChooseAnswer;
            }

            return ans;
        });
        //const isAnswered = newAnswers.some((a: IChooseAnswer) => a.isAnswered);

        this.setState({
            ...this.state,
            answers: newAnswers,
            //isAnswered,
        });

        this.props.onAnswer({
            ...question,
            //isAnswered,
            questionData: {
                ...question.questionData,
                answers: newAnswers,
            }
        } as IQuestion<IChooseRightData>);
    };

    constructor(props) {
        super(props);

        this.state = {
            answers: props.question ? props.question.questionData.answers : null,
            answerVariantChecked: false,
            //isAnswered: props.question ? props.question.isAnswered : false,
        };
    }

    render() {
        const {mode} = this.props;
        const {answers} = this.state;

        return (
            <div>
                {
                    mode === EQuestionMode.editing &&
                    <Paper className={ChooseRightQuestionStyles.chooseRightEditPaper}>
                        <div>
                            {
                                answers && this.state.answers.length ?
                                    answers.map((answer: IChooseAnswer, index: number) => {
                                        return <Paper key={index}
                                                      className={ChooseRightQuestionStyles.answerPaper}>
                                            {answer.text} {answer.isRight && <CheckCircle color={'secondary'}/>}
                                        </Paper>;
                                    })
                                    :
                                    <div>Нет вариантов ответа.</div>
                            }
                        </div>
                        <br/>
                        <div className={ChooseRightQuestionStyles.answerVariant}>
                            <div>
                                <TextField label='Ответ'
                                           fullWidth={true}
                                           margin={'dense'}
                                           onChange={this.onAnswerChange}
                                           value={this.state.answerVariantText}
                                />
                            </div>
                            <div>
                                <FormGroup row>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                color="primary"
                                                onChange={this.onCheckboxChange}
                                                checked={!!this.state.answerVariantChecked}
                                            />
                                        }
                                        label='Правильный ответ'
                                    />
                                </FormGroup>
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
                            answers.map((answer: IChooseAnswer, i: number) => {
                                return (
                                    <FormGroup row key={i}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    color="primary"
                                                    onChange={(evt) => this.onAnswerClick(evt)}
                                                    value={answer.text}
                                                    checked={answer.isAnswered}
                                                    disabled={mode === EQuestionMode.checking}
                                                />
                                            }
                                            label={answer.text}
                                        />
                                    </FormGroup>
                                );
                            })
                        }
                    </div>
                }
            </div>
        );
    }
}
