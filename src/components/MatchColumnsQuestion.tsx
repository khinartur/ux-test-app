import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import '../styles/ChooseRightQuestion.scss';
import {IQuestion, IMatchAnswer, IMatchColumnsData, QuestionType} from '../interfaces/IQuestion';

interface Props {
    question: IQuestion<IMatchColumnsData>;
}

interface State {
    mode: any;
    question: IQuestion<IMatchColumnsData>;
    addingAnswer: IMatchAnswer;
}

export default class MatchColumnsQuestion extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            mode: null,
            question: {
                text: null,
                order: null,
                type: QuestionType.match_columns,
                questionData: null,
                points: 2,
            },
            addingAnswer: null,
        };
    }

    onAnswerChange = (evt) => {
        this.setState({
            ...this.state,
            addingAnswer: {
                ...this.state.addingAnswer,
                [evt.target.name]: evt.target.value,
            }
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
                               margin={'dense'}>
                        {question ? question.text : null}
                    </TextField>
                    <br/>
                    <div className={'answers'}>
                        {
                            this.state.question.questionData.answers.length &&
                            this.state.question.questionData.answers.map((answer: IMatchAnswer) => {
                                return <Paper>{answer.left + '<=====>' + answer.right}</Paper>;
                            })
                        }
                    </div>
                    <br/>
                    <div className={'answer-variant'}>
                        <div className={'answer-variant__item'}>
                            <TextField className={'answer-variant-left'}
                                       label='Левый столбец'
                                       fullWidth={true}
                                       margin={'dense'}
                                       inputProps={{
                                           name: 'left',
                                       }}
                                       onChange={this.onAnswerChange}/>
                        </div>
                        <div className={'answer-variant__item'}>
                            <TextField className={'answer-variant-right'}
                                       label='Правый столбец'
                                       fullWidth={true}
                                       margin={'dense'}
                                       inputProps={{
                                           name: 'right',
                                       }}
                                       onChange={this.onAnswerChange}/>
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
