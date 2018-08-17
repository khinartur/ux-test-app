import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import '../styles/QuestionEditForm.scss';
import MatchColumnsQuestion from './MatchColumnsQuestion';
import OpenQuestion from './OpenQuestion';
import ChooseRightQuestion from './ChooseRightQuestion';
import {
    AnyQuestion, IChooseRightData, IQuestion,
    QuestionType
} from '../interfaces/IQuestion';

//TODO: разобраться с типом функций
interface Props {
    question: IQuestion<AnyQuestion>;
    order?: number;
    onSuccess: any;
}

interface State {
    type: QuestionType;
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
            type: this.props.question && this.props.question.type || QuestionType.choose_right,
        };
    }

    render() {
        const {question, order} = this.props;

        return (
            <Paper className={'question-edit-form'}>
                <FormControl>
                    <InputLabel htmlFor="type">Тип вопроса</InputLabel>
                    <Select
                        value={this.state.type}
                        inputProps={{
                            id: 'type',
                        }}
                        onChange={this.onSelectChange}
                    >
                        <MenuItem value={QuestionType.choose_right}>С выбором ответа</MenuItem>
                        <MenuItem value={QuestionType.match_columns}>Сопоставить столбцы</MenuItem>
                        <MenuItem value={QuestionType.open_question}>Открытый вопрос</MenuItem>
                    </Select>
                </FormControl>
                {
                    this.state.type === QuestionType.choose_right &&
                    <ChooseRightQuestion question={question as IQuestion<IChooseRightData>}
                                         order={order}
                                         mode={question ? 'edit' : 'create'}
                                         onSuccess={this.props.onSuccess}/>
                }
                {this.state.type === QuestionType.match_columns && <MatchColumnsQuestion question={null}/>}
                {this.state.type === QuestionType.open_question && <OpenQuestion question={null}/>}
            </Paper>
        );
    }
}
