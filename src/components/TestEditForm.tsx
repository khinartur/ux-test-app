import * as React from 'react';
import {database, storageRef} from '../modules/firebase';
import Button from '@material-ui/core/Button';
import {
    AnyQuestionData, EQuestionMode, IChooseAnswer, IChooseRightData, IMatchAnswer, IMatchColumnsData, IQuestion,
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
import * as AppStyles from '../styles/App.scss';
import TextField from '@material-ui/core/TextField';
import {CHOOSE_RIGHT_POINTS, MATCH_COLUMNS_POINTS, OPEN_QUESTIONS_POINTS} from '../constants/points';
import LinearProgress from '@material-ui/core/LinearProgress';
import {getNextQuestionKey, getQuestionsOrder, saveQuestion, setQuestionOrder} from '../api/api-database';
import {uploadFile} from '../api/api-storage';

interface State {
    questions?: { [key: string]: IQuestion<AnyQuestionData> };
    currentQuestion?: IQuestion<AnyQuestionData>;
    currentQuestionType: QuestionType;
    currentQuestionOrder?: number;
    isNewQuestion?: boolean;

    isOpenQuestionForm: boolean;
    questionsOrderMap?: { [key: number]: string };

    uploadedFiles?: File[];

    loading: boolean;
    error: string;
}

export default class TestEditForm extends React.Component<{}, State> {

    onFormSubmit = (evt) => {
        const {currentQuestion, uploadedFiles} = this.state;

        this.setState({
            ...this.state,
            loading: true,
        });
        evt.preventDefault();
        const error = this.validateQuestion();
        if (error) {
            this.setState({
                ...this.state,
                error,
            });
            return;
        }

        const key = currentQuestion && currentQuestion.key ? currentQuestion.key : getNextQuestionKey();

        console.log('KEY:', key);
        console.dir(currentQuestion);
        //TODO: save without key
        saveQuestion(currentQuestion, key).then(() => {
            console.log('questions order');
            return setQuestionOrder(currentQuestion.order, key);
        })
            .then(() => {
                if (uploadedFiles && uploadedFiles.length) {
                    this.uploadFiles(key, 0);
                } else {
                    this.onSuccess();
                }
            });
    };
    validateQuestion = () => {
        const {currentQuestion} = this.state;

        if (!currentQuestion.text) {
            return 'Формулировка вопроса не может быть пустой';
        }

        if (currentQuestion.type === QuestionType.choose_right) {
            const q = currentQuestion as IQuestion<IChooseRightData>;
            const answers = q.questionData.answers;
            const rightAnswers = answers.filter((a: IChooseAnswer) => a.isRight);

            if (!rightAnswers.length) return 'Необходим хотя бы один правильный ответ';
        }

        if (currentQuestion.type === QuestionType.match_columns) {
            const q = currentQuestion as IQuestion<IMatchColumnsData>;
            const answers = q.questionData.answers;
            if (answers.length <= 1) return 'Необходимо хотя бы 2 пары ответов';
        }

        return '';
    };
    onAnswerAdd = (answer: IChooseAnswer | IMatchAnswer) => {
        const {currentQuestion} = this.state;

        const currentAnswers = (currentQuestion.questionData as IChooseRightData | IMatchColumnsData).answers;

        this.setState({
            ...this.state,
            currentQuestion: {
                ...currentQuestion,
                questionData: {
                    answers: currentAnswers && currentAnswers.length ? [...currentAnswers, answer] : [answer],
                } as IChooseRightData | IMatchColumnsData,
            },
        });
    };
    onQuestionChange = (evt) => {
        const {currentQuestion} = this.state;

        this.setState({
            ...this.state,
            currentQuestion: {
                ...currentQuestion,
                text: evt.target.value,
            }
        });
    };
    onPointsChange = (evt) => {
        const {currentQuestion} = this.state;

        this.setState({
            ...this.state,
            currentQuestion: {
                ...currentQuestion,
                points: evt.target.value,
            }
        });
    };
    onFilesUpload = (evt) => {
        const {currentQuestion} = this.state;

        const files = evt.target.files;

        const filenames = Array.prototype.map.call(files, file => file.name);
        this.setState({
            ...this.state,
            currentQuestion: {
                ...currentQuestion,
                pictures: filenames,
            },
            uploadedFiles: files,
        });
    };
    onSelectChange = (evt) => {
        const {currentQuestion} = this.state;

        console.log(evt.target.value);
        const type = evt.target.value;

        this.setState({
            ...this.state,
            currentQuestion: {
                ...currentQuestion,
                type: evt.target.value,
                points: this.getPoints(type),
                questionData: this.getDefaultQuestionData(type),
            },
            currentQuestionType: type,
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
        const {questions, currentQuestionType} = this.state;

        const currOrder = questions ? Object.keys(questions).length + 1 : 1;
        const currType = currentQuestionType;

        this.setState({
            ...this.state,
            currentQuestion: {
                text: null,
                points: this.getPoints(currType),
                order: currOrder,
                type: currType,
                questionData: this.getDefaultQuestionData(currType),
            },
            currentQuestionOrder: currOrder,
            isOpenQuestionForm: true,
            isNewQuestion: true,
        });
    };
    editQuestion = (evt: any, order: number) => {
        const {isOpenQuestionForm, questionsOrderMap, questions} = this.state;

        if (isOpenQuestionForm) return;

        const qKey = questionsOrderMap[order];
        const qToEdit = questions[qKey];

        this.setState({
            ...this.state,
            currentQuestion: qToEdit,
            currentQuestionType: qToEdit.type,
            isOpenQuestionForm: true,
        });
    };
    onSuccess = () => {
        this.updateQuestions();

        this.setState({
            ...this.state,
            isOpenQuestionForm: false,
            loading: true,
            error: null,
            isNewQuestion: false,
        });
    };
    onCancel = () => {
        const {questions} = this.state;

        this.setState({
            ...this.state,
            currentQuestion: null,
            currentQuestionOrder: questions ? Object.keys(questions).length + 1 : 1,
            currentQuestionType: QuestionType.choose_right,
            isOpenQuestionForm: false,
            isNewQuestion: false,
        });
    };
    onQuestionMouseOver = (evt) => {
        const {isOpenQuestionForm} = this.state;

        if (isOpenQuestionForm) return;
        evt.target.className = TestEditFormStyles.questionChooseDivActive;
    };
    onQuestionMouseOut = (evt) => {
        const {isOpenQuestionForm} = this.state;

        if (isOpenQuestionForm) return;
        evt.target.className = TestEditFormStyles.questionChooseDiv;
    };
    getPoints = (type) => {
        console.log('GET POINTS:', type);
        switch (type) {
            case QuestionType.choose_right:
                console.log('choose right points');
                return CHOOSE_RIGHT_POINTS;
            case QuestionType.match_columns:
                console.log('match columns points');
                return MATCH_COLUMNS_POINTS;
            case QuestionType.open_question:
                console.log('open question points');
                return OPEN_QUESTIONS_POINTS;
        }
    };
    getDefaultQuestionData = (type) => {
        switch (type) {
            case QuestionType.choose_right:
                return {
                    answers: [],
                };
            case QuestionType.match_columns:
                return {
                    answers: [],
                };
            case QuestionType.open_question:
                return {
                    answer: null,
                };
        }
    };
    updateQuestions = () => {
        //TODO: унести в api
        database.ref('questions/').on('value', (questionsSnapshot) => {
            getQuestionsOrder().then((mapSnapshot) => {
                this.updateQuestionsList(questionsSnapshot.val(), mapSnapshot.val());
            });
        });
    };
    uploadFiles(key: string, fileIndex: number) {
        const {uploadedFiles} = this.state;

        const file = uploadedFiles[fileIndex];
        uploadFile(key, file).then(() => {
            if (uploadedFiles.length == fileIndex + 1) {
                console.log('On success add question');
                this.onSuccess();
            } else {
                this.uploadFiles(key, fileIndex + 1);
            }
        });
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

    componentDidMount() {
        this.updateQuestions();
    }

    render() {
        const {loading, error, questions, isOpenQuestionForm, questionsOrderMap, currentQuestion, isNewQuestion,
            currentQuestionType} = this.state;
        const qCount = questions ? Object.keys(questions).length : 0;

        return (
            <React.Fragment>
                {loading &&
                <div className={AppStyles.progress}>
                    <LinearProgress/>
                </div>
                }
                {
                    !loading &&
                    <div className={TestEditFormStyles.testEditForm}>
                        <div className={TestEditFormStyles.testEditFormItem}>
                            {qCount ? //TODO: replace with generator
                                new Array(qCount).fill(true).map((v: boolean, i: number) => {
                                    const q = questions[questionsOrderMap[i + 1]];
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
                        <div className={TestEditFormStyles.testEditFormItem}>
                            <Button variant="contained"
                                    color="primary"
                                    fullWidth={true}
                                    onClick={this.showAddForm}
                                    disabled={isOpenQuestionForm}>
                                Добавить вопрос
                            </Button>
                            <br/>
                            {
                                isOpenQuestionForm &&
                                <Paper className={TestEditFormStyles.questionEditForm}>
                                    <FormControl>
                                        <InputLabel htmlFor="type">Тип вопроса</InputLabel>
                                        <Select
                                            value={currentQuestion.type}
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
                                    <Paper className={TestEditFormStyles.editPaper}>
                                        <Typography
                                            variant="title">{isNewQuestion ?
                                            'Создание нового вопроса' : 'Редактирование вопроса'}
                                        </Typography>
                                        <br/>
                                        <Paper className={AppStyles.error}>{error}</Paper>
                                        <form autoComplete="off" onSubmit={(evt) => this.onFormSubmit(evt)}>
                                            <TextField label="Формулировка вопроса:"
                                                       fullWidth={true}
                                                       margin={'dense'}
                                                       onChange={this.onQuestionChange}
                                                       defaultValue={currentQuestion.text}>
                                            </TextField>
                                            <br/>
                                            <TextField label="Количество баллов:"
                                                       fullWidth={true}
                                                       margin={'dense'}
                                                       onChange={this.onPointsChange}
                                                       defaultValue={currentQuestion.points}>
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
                                                    currentQuestion && currentQuestion.pictures &&
                                                    currentQuestion.pictures.map((name: string, i: number) => {
                                                        return <div key={i}>{name}</div>;
                                                    })
                                                }
                                            </div>
                                            {
                                                currentQuestionType === QuestionType.choose_right &&
                                                <ChooseRightQuestion
                                                    question={currentQuestion as IQuestion<IChooseRightData>}
                                                    mode={EQuestionMode.editing}
                                                    onAnswerAdd={(answer: IChooseAnswer) => this.onAnswerAdd(answer)}/>
                                            }
                                            {
                                                currentQuestionType === QuestionType.match_columns &&
                                                <MatchColumnsQuestion
                                                    question={currentQuestion as IQuestion<IMatchColumnsData>}
                                                    mode={EQuestionMode.editing}
                                                    onAnswerAdd={(answer: IChooseAnswer) => this.onAnswerAdd(answer)}/>
                                            }
                                            <div>
                                                <Button
                                                    className={TestEditFormStyles.editQuestionButton}
                                                    variant="contained"
                                                    color="primary"
                                                    type="submit">
                                                    {currentQuestion ? 'Сохранить' : 'Создать'}
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
                }
            </React.Fragment>
        );
    }
}
