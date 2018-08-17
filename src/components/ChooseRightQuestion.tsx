import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';

import '../styles/App.scss';
import '../styles/TestEditForm.scss';
import '../styles/ChooseRightQuestion.scss';
import '../styles/Test.scss';

import {IChooseAnswer, IChooseRightData, IQuestion, QuestionType} from '../interfaces/IQuestion';
import {database, storageRef} from '../modules/firebase';

interface Props {
    question: IQuestion<IChooseRightData>;
    order?: number;
    onSuccess?: any;
    onPass?: any;
    onSkip?: any;
    mode: string;
}

interface State {
    question: IQuestion<IChooseRightData>;
    addingAnswer: IChooseAnswer;
    error?: string;
    answerVariantText?: string;
    answerVariantChecked?: boolean;
    uploadedFiles: File[];
    downloadedFiles: string[];
}

export default class ChooseRightQuestion extends React.Component<Props, State> {

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
    onAnswerChange = (evt) => {
        this.setState({
            ...this.state,
            answerVariantText: evt.target.value,
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
            answerVariantText: '',
            answerVariantChecked: false,
        });
    };
    onFilesUpload = (evt) => {
        const files = evt.target.files;

        const filenames = Array.prototype.map.call(files,file => file.name);
        this.setState({
            ...this.state,
            question: {
                ...this.state.question,
                pictures: filenames,
            },
            uploadedFiles: files,
        });
    };
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
        const rightAnswers = qAnswers.filter((a: IChooseAnswer) => a.isRight);
        if (!rightAnswers.length) {
            this.setState({
                ...this.state,
                error: 'Необходим хотя бы один правильный ответ',
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
                this.uploadFiles(key, 0);
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
    }

    constructor(props) {
        super(props);
        console.log('choose right constructor');
        console.dir(this.props.question);

        this.state = {
            question: this.props.question || {
                text: null,
                order: this.props.order,
                type: QuestionType.choose_right,
                questionData: {answers: []},
                points: 2,
            },
            addingAnswer: null,
            uploadedFiles: [],
            downloadedFiles: [],
        };
    }

    componentDidMount() {
        if (this.props.mode === 'show' && this.state.question.pictures) {
            this.state.question.pictures.map((filename: string) => {
                storageRef.child(`${this.state.question.key}/${filename}`).getDownloadURL().then(url => {
                    this.setState({
                        ...this.state,
                        downloadedFiles: [...this.state.downloadedFiles, url],
                    });
                });
            });
        }
    }

    render() {
        const {question, mode} = this.props;

        return (
            <div>
                {
                    (mode === 'edit' || mode === 'create') &&
                    <Paper>
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
                                       defaultValue={mode === 'edit' ? question.points : 2}>
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
                                    this.state.question.pictures &&
                                        this.state.question.pictures.map((name: string, i: number) => {
                                            return <div key={i}>{name}</div>;
                                        })
                                }
                            </div>
                            <br/>
                            <div className={'answers'}>
                                {
                                    this.state.question.questionData.answers.length ?
                                        this.state.question.questionData.answers.map((answer: IChooseAnswer, index: number) => {
                                            return <Paper key={index}>{answer.text}</Paper>;
                                        })
                                        :
                                        <div>Нет вариантов ответа.</div>
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
                                               value={this.state.answerVariantText}
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
                                                    checked={this.state.answerVariantChecked}
                                                />
                                            }
                                            label='Правильный ответ'
                                        />
                                    </FormGroup>
                                </div>
                                <div className={'answer-variant__item'}>
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

                {mode === 'show' &&
                    <Paper className={'question-paper'}
                           elevation={10}>
                        <Typography variant="title">
                            <div className={'question-number-div'}>{' ' + question.order + '.'}</div>
                            {question.text}
                        </Typography>
                        <br/>
                        {
                            this.state.downloadedFiles &&
                            this.state.downloadedFiles.map((url: string, i: number) => {
                                    return <img key={i} src={url} height="300px"/>;
                                })
                        }
                        <br/>
                        {
                            question.questionData.answers.map((answer: IChooseAnswer, i: number) => {
                                return (
                                    <div key={i} className={'question-button'}>
                                        <Button variant="contained"
                                                color="primary"
                                                fullWidth={true}>
                                            {answer.text}
                                        </Button>
                                    </div>
                                );
                            })
                        }
                        <div className={'question-button__next'}>
                            <Button variant="contained"
                                    color="primary"
                                    fullWidth={true}>
                                Дальше
                            </Button>
                        </div>
                    </Paper>
                }
            </div>
        );
    }
}
