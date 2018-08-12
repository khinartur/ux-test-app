import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {IQuestion, questionTypeEnum} from './Question';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

interface Props {
    question: IQuestion;
}

export default class QuestionEditForm extends React.Component<Props> {
    constructor(props) {
        super(props);

    }

    render() {
        const {question} = this.props;

        return (
            <Paper>
                <Typography variant="title">{question ? "Редактирование вопроса" : "Создание нового вопроса"}</Typography>
                <br/>
                <form autoComplete="off">
                    <FormControl>
                        <InputLabel htmlFor="type">Age</InputLabel>
                        <Select
                            value={question ? question.type : null}
                            inputProps={{
                                id: 'type',
                            }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value={questionTypeEnum.choose_right}>С выбором ответа</MenuItem>
                            <MenuItem value={questionTypeEnum.match_columns}>Сопоставить столбцы</MenuItem>
                            <MenuItem value={questionTypeEnum.open_question}>Открытый вопрос</MenuItem>
                        </Select>
                    </FormControl>
                </form>
                <TextField label="Формулировка вопроса:">{question ? question.question : null}</TextField>
            </Paper>
        );
    }
}
