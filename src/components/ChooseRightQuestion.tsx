import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import CheckCircle from 'mdi-material-ui/CheckCircle';

import * as AppStyles from '../styles/App.scss';
import * as TestEditFormStyles from '../styles/TestEditForm.scss';
import * as ChooseRightQuestionStyles from '../styles/ChooseRightQuestion.scss';
import * as TestStyles from '../styles/Test.scss';

import {
    IChooseAnswer, IChooseRightData, IQuestionProps, IQuestionState,
    QuestionType
} from '../interfaces/IQuestion';
import {database, storageRef} from '../modules/firebase';
import {CHOOSE_RIGHT_POINTS} from '../constants/points';

interface Props extends IQuestionProps<IChooseRightData> {
}

//TODO: how to include IError interface?
interface State extends IQuestionState<IChooseRightData, IChooseAnswer> {
    error?: string;
    loading: boolean;
    answerVariantText?: string;
    answerVariantChecked?: boolean;
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
            answerVariantChecked: evt.target.checked,
        });
    };
    onAnswerAdd = () => {
        const oldAnswers = this.state.question.questionData.answers;
        const newAnswer = this.state.addingAnswer;
        this.setState({
            ...this.state,
            question: {
                ...this.state.question,
                questionData: {
                    answers: [...oldAnswers, newAnswer],
                },
            },
            addingAnswer: null,
            answerVariantText: '',
            answerVariantChecked: false,
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
                if (this.state.uploadedFiles && this.state.uploadedFiles.length) {
                    this.uploadFiles(key, 0);
                } else {
                    this.props.onSuccess();
                }
            });
        });
    };
    onAnswerClick = (evt) => {
        console.log(evt.target.textContent);


        let userAnswer = evt.target.textContent;
        let answers = this.state.question.questionData.answers;
        answers.map((ans: IChooseAnswer) => {
            if (ans.text == userAnswer) {
                if (ans.isAnswered) {
                    ans.isAnswered = false;
                    evt.currentTarget.style.backgroundColor = '#000000';
                } else {
                    ans.isAnswered = true;
                    evt.currentTarget.style.backgroundColor = '#009688';
                }
            }
        });

        const isQAnswered = !!(answers.filter((ans: IChooseAnswer) => ans.isAnswered));

        console.dir(answers);

        this.setState({
            ...this.state,
            question: {
                ...this.state.question,
                questionData: {
                    answers: answers,
                },
            },
            passMode: {
                isAnswered: isQAnswered,
            },
        });
    };
    onNextQuestion = () => {
        const question = this.state.question;

        this.props.onPass(question);
    };
    onCancelEdit = () => {
        this.props.onCancel();
        this.setState({
            ...this.state,
            addingAnswer: null,
            answerVariantText: '',
            answerVariantChecked: false,
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            question: this.props.question || {
                text: null,
                order: this.props.order,
                type: QuestionType.choose_right,
                questionData: {answers: []},
                points: CHOOSE_RIGHT_POINTS,
            },
            uploadedFiles: [],
            downloadedFiles: [],
            passMode: this.props.mode === 'pass' ?
                {isAnswered: false} : null,
            loading: true,
        };

        this.loadPictures();
    }

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

    loadPictures = () => {
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
    };

    render() {
        const {question, mode, count} = this.props;

        return (
            <div>
                { //TODO: вынести общее в QuestionEditForm (заголовок, формулировку, количество баллов, картинки)
                    (mode === 'edit' || mode === 'create') &&
                    <Paper className={ChooseRightQuestionStyles.chooseRightEditPaper}>
                        <Typography
                            variant="title">{mode === 'edit' ? 'Редактирование вопроса' : 'Создание нового вопроса'}</Typography>
                        <br/>
                        <Paper className={AppStyles.error}>{this.state.error}</Paper>
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
                                    className={TestEditFormStyles.uploadFileButton}
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
                            <div>
                                {
                                    this.state.question.questionData.answers.length ?
                                        this.state.question.questionData.answers.map((answer: IChooseAnswer, index: number) => {
                                            return <Paper key={index}
                                                          className={ChooseRightQuestionStyles.answerPaper}>
                                                {answer.text} {answer.isRight && <CheckCircle color={'secondary'}/>}
                                                </Paper>;
                                        })
                                        :
                                        <div>Нет вариантов ответа.</div>
                                }
                            </div>
                            <br/>
                            <div className={ChooseRightQuestionStyles.answerVariant}>
                                <div
                                //    className={ChooseRightQuestionStyles.answerVariantItem}
                                >
                                    <TextField label='Ответ'
                                               fullWidth={true}
                                               margin={'dense'}
                                               onChange={this.onAnswerChange}
                                               value={this.state.answerVariantText}
                                    />
                                </div>
                                <div
                                //    className={ChooseRightQuestionStyles.answerVariantItem}
                                >
                                    <FormGroup row>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    color="primary"
                                                    onChange={this.onCheckboxChange}
                                                    checked={!!this.state.answerVariantChecked}
                                                />
                                            }
                                            label='Правильный ответ'
                                        />
                                    </FormGroup>
                                </div>
                                <div
                                //    className={ChooseRightQuestionStyles.answerVariantItem}
                                >
                                    <Button variant="contained"
                                            color="primary"
                                            onClick={this.onAnswerAdd}>
                                        Сохранить
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Button
                                    className={TestEditFormStyles.editQuestionButton}
                                    variant="contained"
                                    color="primary"
                                    type="submit">
                                    {mode === 'edit' ? 'Сохранить' : 'Создать'}
                                </Button>
                                <Button
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
                <Paper className={TestStyles.questionPaper}
                       elevation={10}>
                    <Typography variant="title"
                                style={{paddingTop: '3px'}}>
                        <div className={AppStyles.questionNumberDiv}>
                            <span className={TestStyles.questionOrderSpan}>{' ' + question.order + '.'}</span>
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
                    {
                        question.questionData.answers.map((answer: IChooseAnswer, i: number) => {
                            return (
                                <div key={i} className={TestStyles.questionButton}>
                                    <Button variant="contained"
                                            color="primary"
                                            fullWidth={true}
                                            onClick={(evt) => this.onAnswerClick(evt)}>
                                        {answer.text}
                                    </Button>
                                </div>
                            );
                        })
                    }
                    <div className={TestStyles.questionButtonNext}>
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
        );
    }
}
