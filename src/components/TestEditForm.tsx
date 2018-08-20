import * as React from 'react';
import {database, storageRef} from '../modules/firebase';
import Button from '@material-ui/core/Button';
import {
    AnyQuestionData, IChooseAnswer, IChooseRightData, IMatchColumnsData, IOpenQuestionData, IQuestion, QuestionAnswer,
    QuestionType
} from '../interfaces/IQuestion';

import * as TestEditFormStyles from '../styles/TestEditForm.scss';
import Typography from '@material-ui/core/Typography';
import {embedKey} from '../utils/key-embedding';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ChooseRightQuestion from './ChooseRightQuestion';
import MatchColumnsQuestion from './MatchColumnsQuestion';
import OpenQuestion from './OpenQuestion';
import * as AppStyles from '../styles/App.scss';
import TextField from '@material-ui/core/TextField';
import {CHOOSE_RIGHT_POINTS, MATCH_COLUMNS_POINTS, OPEN_QUESTIONS_POINTS} from '../constants/points';

interface State {
    questions?: { [key: string]: IQuestion<AnyQuestionData> };
    currentQuestion?: IQuestion<AnyQuestionData>;
    currentQuestionType: QuestionType;
    currentQuestionOrder?: number;
    currentQuestionAnswers?: QuestionAnswer[];

    isOpenQuestionForm: boolean;
    questionsOrderMap?: { [key: number]: string };

    uploadedFiles?: File[];

    loading: boolean;
    error: string;
}

export default class TestEditForm extends React.Component<{}, State> {
    onFormSubmit = () => {
        const error = this.validateQuestion();
        if (error) {
            this.setState({
                ...this.state,
                error,
            });
        }

        const key = this.state.currentQuestion ?
            this.state.currentQuestion.key :
            database.ref().child('/questions').push().key;


        // //TODO: save without key
        // database.ref('questions/' + key).set({
        //     ...this.state.currentQuestion,
        //     order: this.state.currentQuestion.order,
        // }).then(() => {
        //     database.ref('questions-order/' + this.state.currentQuestion.order).set(key).then(() => {
        //         if (this.state.uploadedFiles && this.state.uploadedFiles.length) {
        //             this.uploadFiles(key, 0);
        //         } else {
        //             this.props.onSuccess();
        //         }
        //     });
        // });
    };
    validateQuestion = () => {
        if (!this.state.currentQuestion.text) {
            return 'Формулировка вопроса не может быть пустой';
        }

        if (this.state.currentQuestionType == QuestionType.choose_right) {
            const q = this.state.currentQuestion as IQuestion<IChooseRightData>;
            const answers = q.questionData.answers;
            const rightAnswers = answers.filter((a: IChooseAnswer) => a.isRight);

            if (!rightAnswers.length) return 'Необходим хотя бы один правильный ответ';
        }

        return '';
    };
    onAnswerAdd = (answer: QuestionAnswer) => {
        const currentAnswers = this.state.currentQuestionAnswers;

        this.setState({
            ...this.state,
            currentQuestionAnswers: currentAnswers ? [answer] : [...currentAnswers, answer],
        });
    };
    onQuestionChange = (evt) => {
        this.setState({
            ...this.state,
            currentQuestion: {
                ...this.state.currentQuestion,
                text: evt.target.value,
            }
        });
    };
    onPointsChange = (evt) => {
        this.setState({
            ...this.state,
            currentQuestion: {
                ...this.state.currentQuestion,
                points: evt.target.value,
            }
        });
    };
    onFilesUpload = (evt) => {
        const files = evt.target.files;

        const filenames = Array.prototype.map.call(files, file => file.name);
        this.setState({
            ...this.state,
            currentQuestion: {
                ...this.state.currentQuestion,
                pictures: filenames,
            },
            uploadedFiles: files,
        });
    };
    onSelectChange = (evt) => {
        console.log(evt.target.value);
        this.setState({
            ...this.state,
            currentQuestionType: evt.target.value,
        });
    };

    updateQuestionsList = (questions, map) => {
        this.setState({
            ...this.state,
            questions: embedKey(questions),
            questionsOrderMap: map,
            loading: false,
        });
    };

    showAddForm = () => {
        const questions = this.state.questions;

        this.setState({
            ...this.state,
            currentQuestion: null,
            currentQuestionOrder: questions ? Object.keys(questions).length + 1 : 1,
            isOpenQuestionForm: true,
        });
    };

    editQuestion = (evt: any, order: number) => {
        if (this.state.isOpenQuestionForm) return;

        const qKey = this.state.questionsOrderMap[order];
        const qToEdit = this.state.questions[qKey];

        this.setState({
            ...this.state,
            currentQuestion: qToEdit,
            isOpenQuestionForm: true,
        });
    };

    // onSuccess = () => {
    //     this.updateQuestions();
	//
    //     this.setState({
    //         ...this.state,
    //         isOpenQuestionForm: false,
    //         loading: true,
    //     });
    // };

    onCancel = () => {
        const questions = this.state.questions;

        this.setState({
            ...this.state,
            currentQuestion: null,
            currentQuestionOrder: questions ? Object.keys(questions).length + 1 : 1,
            currentQuestionType: QuestionType.choose_right,
            isOpenQuestionForm: false,
        });
    };

    onQuestionMouseOver = (evt) => {
        if (this.state.isOpenQuestionForm) return;
        evt.target.className = TestEditFormStyles.questionChooseDivActive;
    };
    onQuestionMouseOut = (evt) => {
        if (this.state.isOpenQuestionForm) return;
        evt.target.className = TestEditFormStyles.questionChooseDiv;
    };
    getPoints = () => {
        switch (this.state.currentQuestionType) {
            case QuestionType.choose_right:
                return CHOOSE_RIGHT_POINTS;
            case QuestionType.match_columns:
                return MATCH_COLUMNS_POINTS;
            case QuestionType.open_question:
                return OPEN_QUESTIONS_POINTS;
        }
    };
    updateQuestions = () => {
        database.ref('questions/').on('value', function (questionsSnapshot) {
            database.ref('questions-order/').once('value').then(function (mapSnapshot) {
                this.updateQuestionsList(questionsSnapshot.val(), mapSnapshot.val());
            }.bind(this));
        }.bind(this));
    };

    constructor(props) {
        super(props);

        this.state = {
            isOpenQuestionForm: false,
            currentQuestionType: QuestionType.choose_right,
            loading: true,
            error: '',
        };
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

    componentDidMount() {
        this.updateQuestions();
    }

    render() {
        const questions = this.state.questions;
        const qMap = this.state.questionsOrderMap;
        const qToEdit = this.state.currentQuestion;
        const qCount = questions ? Object.keys(questions).length : 0;
        const isEditFormShown = this.state.isOpenQuestionForm;
        console.log('ORDER TO PROPS:', this.state.currentQuestionOrder);

        return (
            !this.state.loading &&
            <div className={TestEditFormStyles.testEditForm}>
                {
                    <div className={TestEditFormStyles.testEditFormItem}>
                        {qCount ? //TODO: replace with generator
                            new Array(qCount).fill(true).map((v: boolean, i: number) => {
                                const q = questions[qMap[i + 1]];
                                return <div key={i}
                                            className={TestEditFormStyles.questionChooseDiv}
                                            onClick={(evt) => this.editQuestion(evt, q.order)}
                                            onMouseOver={(evt) => this.onQuestionMouseOver(evt)}
                                            onMouseOut={(evt) => this.onQuestionMouseOut(evt)}
                                >
                                    {q.order + ') ' + q.text}
                                </div>;
                            })
                            :
                            <Typography variant="body1" gutterBottom>
                                В тесте нет вопросов.
                            </Typography>
                        }
                    </div>
                }
                <div className={TestEditFormStyles.testEditFormItem}>
                    <Button variant="contained"
                            color="primary"
                            fullWidth={true}
                            onClick={this.showAddForm}
                            disabled={isEditFormShown}>
                        Добавить вопрос
                    </Button>
                    <br/>
                    {
                        this.state.isOpenQuestionForm &&
                        <Paper className={TestEditFormStyles.questionEditForm}>
                            <FormControl>
                                <InputLabel htmlFor="type">Тип вопроса</InputLabel>
                                <Select
                                    value={this.state.currentQuestionType}
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
                            <Paper className={TestEditFormStyles.chooseRightEditPaper}>
                                <Typography
                                    variant="title">{this.state.currentQuestion ?
                                    'Редактирование вопроса' : 'Создание нового вопроса'}
                                </Typography>
                                <br/>
                                <Paper className={AppStyles.error}>{this.state.error}</Paper>
                                <form autoComplete="off" onSubmit={this.onFormSubmit}>
                                    <TextField label="Формулировка вопроса:"
                                               fullWidth={true}
                                               margin={'dense'}
                                               onChange={this.onQuestionChange}
                                               defaultValue={this.state.currentQuestion ? this.state.currentQuestion.text : null}>
                                    </TextField>
                                    <br/>
                                    <TextField label="Количество баллов:"
                                               fullWidth={true}
                                               margin={'dense'}
                                               onChange={this.onPointsChange}
                                               defaultValue={this.state.currentQuestion ? this.state.currentQuestion.points : this.getPoints()}>
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
                                            this.state.currentQuestion.pictures &&
                                            this.state.currentQuestion.pictures.map((name: string, i: number) => {
                                                return <div key={i}>{name}</div>;
                                            })
                                        }
                                    </div>
                                    {
                                        this.state.currentQuestionType === QuestionType.choose_right &&
                                        <ChooseRightQuestion
                                            question={this.state.currentQuestion as IQuestion<IChooseRightData>}
                                            mode={'edit'}
                                            onAnswerAdd={(answer: IChooseAnswer) => this.onAnswerAdd(answer)}/>
                                    }
                                    {
                                        this.state.currentQuestionType === QuestionType.match_columns &&
                                        <MatchColumnsQuestion
                                            question={this.state.currentQuestion as IQuestion<IMatchColumnsData>}
                                            mode={'edit'}
                                            onAnswerAdd={(answer: IChooseAnswer) => this.onAnswerAdd(answer)}/>
                                    }
                                    <div>
                                        <Button
                                            className={TestEditFormStyles.editQuestionButton}
                                            variant="contained"
                                            color="primary"
                                            type="submit">
                                            {this.state.currentQuestion ? 'Сохранить' : 'Создать'}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            style={{
                                                backgroundColor: '#b2102f',
                                                marginLeft: '10px',
                                                color: 'white',
                                            }}
                                            onClick={this.onCancel}>
                                            Отмена
                                        </Button>
                                    </div>
                                </form>
                            </Paper>
                        </Paper>
                    }
                </div>
            </div>
        );
    }
}
