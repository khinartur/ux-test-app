import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import {
    IOpenQuestionData, IQuestionProps, IQuestionState,
    QuestionType
} from '../interfaces/IQuestion';
import {OPEN_QUESTIONS_POINTS} from '../constants/points';
import Button from '@material-ui/core/Button';
import {database, storageRef} from '../modules/firebase';

import '../styles/OpenQuestion.scss';
import '../styles/TestEditForm.scss';
import '../styles/Test.scss';

interface Props extends IQuestionProps<IOpenQuestionData> {
}

interface State extends IQuestionState<IOpenQuestionData, string> {
    error?: string;
    loading: boolean;
}

export default class OpenQuestion extends React.Component<Props, State> {

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
    onCancelEdit = () => {
        this.props.onCancel();
        this.setState({
            ...this.state,
            addingAnswer: null,
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            question: this.props.question || {
                text: null,
                order: this.props.order,
                type: QuestionType.open_question,
                questionData: {answer: null},
                points: OPEN_QUESTIONS_POINTS,
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

    componentDidMount() {
        if (this.props.mode === 'pass' && this.state.question.pictures) {
            this.state.question.pictures.map((filename: string) => {
                storageRef.child(`${this.state.question.key}/${filename}`).getDownloadURL().then(url => {
                    const downloadedCount = this.state.downloadedFiles.length;
                    this.setState({
                        ...this.state,
                        downloadedFiles: [...this.state.downloadedFiles, url],
                        loading: this.state.question.pictures.length !== downloadedCount + 1,
                    });
                });
            });
        } else {
            this.setState({
                ...this.state,
                loading: false,
            });
        }
    }

    onAnswerTextareaChange = (evt) => {
        console.log(evt.target.textContent);

        let userAnswer = evt.target.textContent;
        const isQAnswered = !!userAnswer;

        this.setState({
            ...this.state,
            question: {
                ...this.state.question,
                questionData: {
                    answer: userAnswer,
                },
            },
            passMode: {
                isAnswered: isQAnswered,
            },
        });
    };

    onNextQuestion = () => {
        const question = this.state.question;

        this.state.passMode.isAnswered ?
            this.props.onPass(question) :
            this.props.onSkip(question);
    };

    render() {
        const {question, mode, count} = this.props;

        const pictutes = this.state.question.pictures;

        return (
            <div>
                {
                    (mode === 'edit' || mode === 'create') &&
                    <Paper className={'open-question-edit-paper'}>
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
                            <div>
                                <Button
                                    className={'edit-question-button'}
                                    variant="contained"
                                    color="primary"
                                    type="submit">
                                    {mode === 'edit' ? 'Сохранить' : 'Создать'}
                                </Button>
                                <Button
                                    className={'cancel-edit-question-button'}
                                    variant="contained"
                                    style={{
                                        backgroundColor: '#b2102f',
                                        marginLeft: '10px',
                                        color: 'white',
                                    }}
                                    onClick={this.onCancelEdit}>
                                    Отмена
                                </Button>
                            </div>
                        </form>
                    </Paper>
                }
                {mode === 'pass' && !this.state.loading &&
                <Paper className={'question-paper'}
                       elevation={10}>
                    <Typography variant="title"
                                style={{paddingTop: '3px'}}>
                        <div className={'question-number-div'}>
                            <span className={'question-order-span'}>{' ' + question.order + '.'}</span>
                        </div>
                        {question.text}
                    </Typography>
                    <br/>
                    {
                        this.state.downloadedFiles &&
                        this.state.downloadedFiles.map((url: string, i: number) => {
                            return <img key={i}
                                        src={url}
                                        style={{
                                            height: '180px',
                                            display: 'inline-block',
                                        }}/>;
                        })
                    }
                    <br/>
                    <TextField label="Ответ:"
                               fullWidth={true}
                               multiline={true}
                               rows={8}
                               rowsMax={8}
                               margin={'dense'}
                               onChange={(evt) => this.onAnswerTextareaChange(evt)}>
                    </TextField>
                    <br/>
                    <div className={'question-button__next'}>
                        <Button variant="contained"
                                color="primary"
                                fullWidth={true}
                                onClick={this.onNextQuestion}>
                            {this.state.passMode.isAnswered ? 'Ответить' : 'Дальше'}
                        </Button>
                    </div>
                </Paper>
                }
            </div>
        )
    }
}
