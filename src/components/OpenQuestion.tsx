import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import '../styles/ChooseRightQuestion.scss';
import {IOpenQuestionData, IQuestion, QuestionType} from '../interfaces/IQuestion';

interface Props {
    question: IQuestion<IOpenQuestionData>;
}

interface State {
    mode: any;
    question: IQuestion<IOpenQuestionData>;
    addingAnswer: IOpenQuestionData;
}

export default class OpenQuestion extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {
            mode: null,
            question: {
                text: null,
                order: null,
                type: QuestionType.open_question,
                questionData: null,
            },
            addingAnswer: null,
        };
    }

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
                </form>
            </Paper>
        );
    }
}
