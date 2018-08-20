import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import CheckCircle from 'mdi-material-ui/CheckCircle';

import * as AppStyles from '../styles/App.scss';
import * as TestEditFormStyles from '../styles/TestEditForm.scss';
import * as ChooseRightQuestionStyles from '../styles/ChooseRightQuestion.scss';
import * as TestStyles from '../styles/Test.scss';

import {
    IChooseAnswer, IChooseRightData, IQuestionProps, IQuestionState,
    QuestionType
} from '../interfaces/IQuestion';
import {database, storageRef} from '../modules/firebase';
import {CHOOSE_RIGHT_POINTS} from '../constants/points';

interface Props extends IQuestionProps<IChooseRightData> {
}

//TODO: how to include IError interface?
interface State extends IQuestionState<IChooseAnswer> {
    error?: string;
    answerVariantText?: string;
    answerVariantChecked?: boolean;
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

        this.setState({
            ...this.state,
            answers: this.state.answers ? [...this.state.answers, newAnswer] : [newAnswer],
            answerVariantText: '',
            answerVariantChecked: false,
        });
    };


    onAnswerClick = (evt) => {
        console.log(evt.target.textContent);

        let userAnswer = evt.target.textContent;
        let answers = this.state.answers;
        answers.map((ans: IChooseAnswer) => {
            if (ans.text == userAnswer) {
                if (ans.isAnswered) {
                    ans.isAnswered = false;
                    evt.currentTarget.style.backgroundColor = '#000000';
                } else {
                    ans.isAnswered = true;
                    evt.currentTarget.style.backgroundColor = '#009688';
                }
            }
        });

        this.props.onAnswer({
            text: userAnswer,
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            answers: this.props.question.questionData.answers,
        };
    }

    render() {
        const {mode} = this.props;

        return (
            <div>
                {
                    mode === 'edit' &&
                    <Paper className={ChooseRightQuestionStyles.chooseRightEditPaper}>
                        <div>
                            {
                                this.state.answers.length ?
                                    this.state.answers.map((answer: IChooseAnswer, index: number) => {
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
                    mode === 'pass' &&
                    <div>
                        {
                            this.state.answers.map((answer: IChooseAnswer, i: number) => {
                                return (
                                    <div key={i} className={TestStyles.questionButton}>
                                        <Button variant="contained"
                                                color="primary"
                                                fullWidth={true}
                                                onClick={(evt) => this.onAnswerClick(evt)}>
                                            {answer.text}
                                        </Button>
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
