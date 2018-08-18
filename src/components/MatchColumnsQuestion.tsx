import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import '../styles/ChooseRightQuestion.scss';
import {
    IQuestion, IMatchAnswer, IMatchColumnsData, QuestionType, IQuestionProps,
    IChooseAnswer, IChooseRightData, IQuestionState
} from '../interfaces/IQuestion';
import {MATCH_COLUMNS_POINTS} from '../constants/points';
import {database, storageRef} from '../modules/firebase';

interface Props extends IQuestionProps<IMatchColumnsData> {
}

interface State extends IQuestionState<IMatchColumnsData, IMatchAnswer> {
    error?: string;
    loading: boolean;
    answerTextLeft?: string;
    answerTextRight?: string;
}

export default class MatchColumnsQuestion extends React.Component<Props, State> {

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
    onQuestionChange = (evt) => {
        this.setState({
            ...this.state,
            question: {
                ...this.state.question,
                text: evt.target.value,
            }
        });
    };
    onPointsChange = (evt) => {
        this.setState({
            ...this.state,
            question: {
                ...this.state.question,
                points: evt.target.value,
            }
        });
    };
    onFilesUpload = (evt) => {
        const files = evt.target.files;

        const filenames = Array.prototype.map.call(files, file => file.name);
        this.setState({
            ...this.state,
            question: {
                ...this.state.question,
                pictures: filenames,
            },
            uploadedFiles: files,
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            question: this.props.question || {
                text: null,
                order: this.props.order,
                type: QuestionType.match_columns,
                questionData: {answers: []},
                points: MATCH_COLUMNS_POINTS,
            },
            uploadedFiles: [],
            downloadedFiles: [],
            passMode: this.props.mode === 'pass' ?
                {isAnswered: false} : null,
            loading: true,
        };
    }

    onFormSubmit = (evt) => {
        evt.preventDefault();
        console.log('SUBMIT');

        const qText = this.state.question.text;
        if (!qText) {
            this.setState({
                ...this.state,
                error: 'Формулировка вопроса не может быть пустой',
            });

            return;
        }

        const qAnswers = this.state.question.questionData.answers;
        if (!qAnswers.length || qAnswers.length == 1) {
            this.setState({
                ...this.state,
                error: 'Необходимо хотя бы 2 пары ответов',
            });

            return;
        }


        const key = this.props.mode === 'create' ?
            database.ref().child('/questions').push().key :
            this.state.question.key;

        //TODO: save without key
        database.ref('questions/' + key).set({
            ...this.state.question,
            order: this.props.order,
        }).then(() => {
            database.ref('questions-order/' + this.state.question.order).set(key).then(() => {
                if (this.state.uploadedFiles && this.state.uploadedFiles.length) {
                    this.uploadFiles(key, 0);
                } else {
                    this.props.onSuccess();
                }
            });
        });
    };

    uploadFiles(key: string, fileIndex: number) {
        const file = this.state.uploadedFiles[fileIndex];
        storageRef.child(`${key}/${file.name}`).put(file).then((snapshot) => {
            if (this.state.uploadedFiles.length == fileIndex + 1) {
                console.log('On success add question');
                this.props.onSuccess();
            } else {
                this.uploadFiles(key, fileIndex + 1);
            }
        });
    };

    render() {
        const {question, mode, count} = this.props;

        const answers = this.state.question.questionData.answers;
        const pictutes = this.state.question.pictures;

        return (
            <div>
                {
                    (mode === 'edit' || mode === 'create') &&
                    <Paper className={'match-columns-edit-paper'}>
                        <Typography
                            variant="title">{mode === 'edit' ? 'Редактирование вопроса' : 'Создание нового вопроса'}</Typography>
                        <br/>
                        <Paper className={'error'}>{this.state.error}</Paper>
                        <form autoComplete="off" onSubmit={this.onFormSubmit}>
                            <TextField label="Формулировка вопроса:"
                                       fullWidth={true}
                                       margin={'dense'}
                                       onChange={this.onQuestionChange}
                                       defaultValue={mode === 'edit' ? question.text : null}>
                            </TextField>
                            <br/>
                            <TextField label="Количество баллов:"
                                       fullWidth={true}
                                       margin={'dense'}
                                       onChange={this.onPointsChange}
                                       defaultValue={mode === 'edit' ? question.points : this.state.question.points}>
                            </TextField>
                            <br/>
                            <div>
                                <input
                                    accept="image/*"
                                    className={'upload-file-button'}
                                    id="raised-button-file"
                                    multiple
                                    type="file"
                                    onChange={(evt) => this.onFilesUpload(evt)}
                                />
                                <label htmlFor="raised-button-file">
                                    <Button variant="contained" color="primary" component="span">
                                        Добавить картинки
                                    </Button>
                                </label>
                            </div>
                            <br/>
                            <div>
                                {
                                    pictutes &&
                                    pictutes.map((name: string, i: number) => {
                                        return <div key={i}>{name}</div>;
                                    })
                                }
                            </div>
                            <br/>
                            <div className={'answers'}>
                                {
                                    answers.length ?
                                        answers.map((answer: IMatchAnswer, index: number) => {
                                            return <Paper key={index}
                                                          className={'match-answer-paper'}>
                                                {answer.left + '   =====>   ' + answer.right}
                                            </Paper>;
                                        })
                                        :
                                        <div>Нет вариантов ответа.</div>
                                }
                            </div>
                            <br/>
                            <div className={'match-answer-variant'}>
                                <div className={'match-answer-variant__item'}>
                                    <TextField className={'match-answer-variant-textfield'}
                                               label='Ответ'
                                               fullWidth={false}
                                               margin={'dense'}
                                               inputProps={{
                                                   name: 'left',
                                               }}
                                               onChange={this.onAnswerChange}
                                               value={this.state.answerTextLeft}
                                    />
                                </div>
                                <div className={'match-answer-variant__item'}>
                                    <TextField className={'match-answer-variant-textfield'}
                                               label='Ответ'
                                               fullWidth={false}
                                               margin={'dense'}
                                               inputProps={{
                                                   name: 'right',
                                               }}
                                               onChange={this.onAnswerChange}
                                               value={this.state.answerTextRight}
                                    />
                                </div>
                                <div className={'match-answer-variant__item'}>
                                    <Button className={'answer-variant-button'}
                                            variant="contained"
                                            color="primary"
                                            onClick={this.onAnswerAdd}>
                                        Сохранить
                                    </Button>
                                </div>
                            </div>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit">
                                {mode === 'edit' ? 'Сохранить' : 'Создать'}
                            </Button>
                        </form>
                    </Paper>
                }
            </div>
        );
    }
}
