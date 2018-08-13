import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';

import '../styles/ChooseRightQuestion.scss';

import {IChooseAnswer, IChooseRightData, IQuestion, QuestionType} from '../interfaces/IQuestion';

interface Props {
    question: IQuestion<IChooseRightData>;
}

interface State {
    mode: any;
    question: IQuestion<IChooseRightData>;
    addingAnswer: IChooseAnswer;
}

export default class ChooseRightQuestion extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            mode: null,
            question: {
                text: null,
                order: null,
                type: QuestionType.choose_right,
                questionData: null,
                is_answered: false,
            },
            addingAnswer: null,
        };
    }

    onQuestionChange = (evt) => {
        this.setState({
            ...this.state,
            question: {
                ...this.state.question,
                text: evt.target.value,
            }
        });
    };

    onAnswerChange = (evt) => {
        this.setState({
            ...this.state,
            addingAnswer: {
                ...this.state.addingAnswer,
                text: evt.target.value,
            },
        });
    };

    onCheckboxChange = (evt) => {
        this.setState({
            ...this.state,
            addingAnswer: {
                ...this.state.addingAnswer,
                isRight: evt.target.checked,
            },
        });
    };

    onAnswerAdd = () => {
        this.state.question.questionData.answers.push(this.state.addingAnswer);
        this.setState({
            ...this.state,
            addingAnswer: null,
        });
    };

    render() {
        const {question} = this.props;

        return (
            <Paper>
                <Typography
                    variant="title">{question ? 'Редактирование вопроса' : 'Создание нового вопроса'}</Typography>
                <br/>
                <form autoComplete="off">
                    <TextField label="Формулировка вопроса:"
                               fullWidth={true}
                               margin={'dense'}
                               onChange={this.onQuestionChange}>
                        {question ? question.text : null}
                    </TextField>
                    <br/>
                    <div className={'answers'}>
                        {
                            this.state.question.questionData.answers.length &&
                            this.state.question.questionData.answers.map((answer: IChooseAnswer) => {
                                return <Paper>{answer.text}</Paper>;
                            })
                        }
                    </div>
                    <br/>
                    <div className={'answer-variant'}>
                        <div className={'answer-variant__item'}>
                            <TextField className={'answer-variant-textfield'}
                                       label='Ответ'
                                       fullWidth={true}
                                       margin={'dense'}
                                       onChange={this.onAnswerChange}
                            />
                        </div>
                        <div className={'answer-variant__item'}>
                            <FormGroup className={'answer-variant-checkbox'}
                                       row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            color="primary"
                                            onChange={this.onCheckboxChange}
                                        />
                                    }
                                    label="Правильный ответ"
                                />
                            </FormGroup>
                        </div>
                        <div className={'answer-variant__item'}>
                            <Button className={'answer-variant-button'}
                                    variant="contained"
                                    color="primary"
                                    onSubmit={this.onAnswerAdd}>
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </form>
            </Paper>
        );
    }
}
