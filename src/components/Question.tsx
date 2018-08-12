import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

export enum questionTypeEnum {
    choose_right,
    match_columns,
    open_question,
}

export interface IQuestion {
    question: string;
    order: number;
    type: questionTypeEnum;
    data: any;
}

interface State {
    admin_access: boolean;
    user_answered: string;
    IQuestion;
}

export default class Question extends React.Component<{}, State> {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <Paper>
                {
                    this.state.admin_access ?
                        (
                            <TextField>{this.state.IQuestion.question}</TextField>
                        )
                        :
                        (
                            <Typography variant="title">{this.state.IQuestion.question}</Typography>
                        )
                }
            </Paper>
        );
    }
}
