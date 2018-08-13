import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {IQuestion, questionTypeEnum} from './Question';
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

import '../styles/ChooseRightQuestion.scss';
import {IChooseAnswer, IMatchColumnsData} from '../interfaces/IQuestion';

interface Props {
    question: IQuestion<IMatchColumnsData>;
}

interface State {
    mode: any;
    question: IQuestion<IChooseRightData>;
    addingAnswer: IChooseAnswer;
}

export default class MatchColumnsQuestion extends React.Component<Props, State> {

    constructor(props) {
        super(props);

        this.state = {

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
                    <div className={'answer-variant'}>
                        <div className={'answer-variant__item'}>
                            <TextField className={'answer-variant-textfield'}
                                       label='Ответ'
                                       fullWidth={true}
                                       margin={'dense'}/>
                        </div>
                        <div className={'answer-variant__item'}>
                            <FormGroup className={'answer-variant-checkbox'}
                                       row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            color="primary"
                                        />
                                    }
                                    label="Правильный ответ"
                                />
                            </FormGroup>
                        </div>
                        <div className={'answer-variant__item'}>
                            <Button className={'answer-variant-button'}
                                    variant="contained"
                                    color="primary">
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </form>
            </Paper>
        );
    }
}
