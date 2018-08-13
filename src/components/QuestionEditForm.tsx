import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {IQuestion, questionTypeEnum} from './QuestionView';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';

import '../styles/QuestionEditForm.scss';
import MatchColumnsQuestion from './MatchColumnsQuestion';
import OpenQuestion from './OpenQuestion';
import ChooseRightQuestion from './ChooseRightQuestion';

interface Props {
    question: IQuestion | null;
}

interface State {
    type: questionTypeEnum;
    choose_right_data: any;
}

export default class QuestionEditForm extends React.Component<Props, State> {
    onSelectChange = (evt) => {
        console.log(evt.target.value);
        this.setState({
            ...this.state,
            type: evt.target.value,
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            type: questionTypeEnum.choose_right,
            choose_right_data: {},
        };
    }

    render() {
        const {question} = this.props;

        return (
            <Paper>
                <FormControl>
                    <InputLabel htmlFor="type">Тип вопроса</InputLabel>
                    <Select
                        value={question ? question.type : questionTypeEnum.choose_right}
                        inputProps={{
                            id: 'type',
                        }}
                        onChange={this.onSelectChange}
                    >
                        <MenuItem value={questionTypeEnum.choose_right}>С выбором ответа</MenuItem>
                        <MenuItem value={questionTypeEnum.match_columns}>Сопоставить столбцы</MenuItem>
                        <MenuItem value={questionTypeEnum.open_question}>Открытый вопрос</MenuItem>
                    </Select>
                </FormControl>
                {this.state.type === questionTypeEnum.choose_right && <ChooseRightQuestion question={null}/>}
                {this.state.type === questionTypeEnum.match_columns && <MatchColumnsQuestion question={null}/>}
                {this.state.type === questionTypeEnum.open_question && <OpenQuestion question={null}/>}
            </Paper>
        );
    }
}
