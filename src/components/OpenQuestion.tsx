import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import {
    EQuestionMode,
    IOpenQuestionData, IQuestionProps, IQuestionState,
    QuestionType
} from '../interfaces/IQuestion';
import {OPEN_QUESTIONS_POINTS} from '../constants/points';
import Button from '@material-ui/core/Button';
import {database, storageRef} from '../modules/firebase';

import * as OpenQuestionStyles from '../styles/OpenQuestion.scss';
import * as TestEditFormStyles from '../styles/TestEditForm.scss';
import * as TestStyles from '../styles/Test.scss';
import * as AppStyles from '../styles/App.scss';

interface Props extends IQuestionProps<IOpenQuestionData> {
}

interface State extends IQuestionState<string> {
    error?: string;
}

export default class OpenQuestion extends React.Component<Props, State> {

    onAnswerTextareaChange = (evt) => {
        console.log(evt.target.value);
        let userAnswer = evt.target.value;

        this.setState({
            ...this.state,
            passMode: {
                answer: userAnswer,
            },
        });

        this.props.onAnswer(userAnswer);
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {mode} = this.props;

        return (
            (mode == EQuestionMode.passing || mode == EQuestionMode.checking) &&
            <div>
                <TextField label="Ответ:"
                           fullWidth={true}
                           multiline={true}
                           rows={8}
                           rowsMax={8}
                           margin={'dense'}
                           disabled={mode == EQuestionMode.checking}
                           onChange={(evt) => this.onAnswerTextareaChange(evt)}
                            defaultValue={this.props.question.questionData ? this.props.question.questionData.answer : ''}>
                </TextField>
            </div>
        );
    }
}
