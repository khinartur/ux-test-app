import * as React from 'react';
import {database} from '../modules/firebase';
import Button from '@material-ui/core/Button';
import {
    AnyQuestionData,
    EQuestionMode,
    IChooseAnswer,
    IChooseRightData,
    IMatchAnswer,
    IMatchColumnsData,
    IQuestion,
    QuestionListItem,
    QuestionType
} from '../interfaces/IQuestion';

import * as TestEditFormStyles from '../styles/TestEditForm.scss';
import Typography from '@material-ui/core/Typography';
import {embedKey} from '../utils/utils';
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
import {
    getNextQuestionKey,
    getQuestions,
    getQuestionsOrder,
    saveQuestion,
    setQuestionOrder,
    setQuestions,
    setQuestionsOrder,
    updateDatabase
} from '../api/api-database';
import {uploadFile} from '../api/api-storage';
import DeleteQuestionDialog from './DeleteQuestionDialog';
import QuestionItem from './QuestionItem';
import * as DraggableList from 'react-draggable-list';

interface State {
    questions?: { [key: string]: IQuestion<AnyQuestionData> };
    currentQuestion?: IQuestion<AnyQuestionData>;
    currentQuestionType: QuestionType;
    currentQuestionOrder?: number;
    isNewQuestion?: boolean;
    deleteQuestionDialogShow: boolean;

    questionFormShow: boolean;
    questionsOrderMap?: { [key: number]: string };
    questionsList?: QuestionListItem[];

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
        const newQuestionsList = Object.values(questions || {})
            .map(({text, order}: IQuestion<AnyQuestionData>) => ({text, order}))
            .sort((a, b) => a.order - b.order);

        this.setState({
            ...this.state,
            questions: embedKey(questions),
            questionsOrderMap: map,
            loading: false,
            questionsList: newQuestionsList,
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
            questionFormShow: true,
            isNewQuestion: true,
        });
    };
    editQuestion = (evt: any, order: number) => {
        const {questionFormShow, questionsOrderMap, questions} = this.state;

        if (questionFormShow) {
            return;
        }

        const qKey = questionsOrderMap[order];
        const qToEdit = questions[qKey];

        this.setState({
            ...this.state,
            currentQuestion: qToEdit,
            currentQuestionOrder: order,
            currentQuestionType: qToEdit.type,
            questionFormShow: true,
        });
    };
    onSuccess = () => {
        this.updateQuestions();

        this.setState({
            ...this.state,
            questionFormShow: false,
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
            questionFormShow: false,
            isNewQuestion: false,
        });
    };
    onQuestionMouseOver = (evt) => {
        const {questionFormShow} = this.state;

        if (questionFormShow) return;
        evt.target.className = TestEditFormStyles.questionChooseDivActive;
    };
    onQuestionMouseOut = (evt) => {
        const {questionFormShow} = this.state;

        if (questionFormShow) return;
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
    closeDeleteQuestionDialog = () => {
        this.setState({
            ...this.state,
            deleteQuestionDialogShow: false,
        });
    };
    onDeleteButtonClick = () => {
        this.setState({
            ...this.state,
            deleteQuestionDialogShow: true,
        });
    };
    onDeleteQuestion = () => {
        const {currentQuestion, currentQuestionOrder} = this.state;

        this.setState({
            ...this.state,
            loading: true,
        });

        let newQuestions = {};
        getQuestions()
            .then((snapshot) => {
                const oldQuestions = embedKey(snapshot.val());
                //TODO: hmmm

                Object.entries(oldQuestions).forEach((o) => {
                    const q = o[1] as IQuestion<AnyQuestionData>; //q - question
                    if (q.order === currentQuestionOrder) {
                        return;
                    }
                    newQuestions[q.key] = q.order < currentQuestion.order ? q : {...q, order: q.order - 1};
                });
                return setQuestions(newQuestions);
            })
            .then(() => {
                let newOrsersMap = {};
                Object.entries(newQuestions).forEach((o) => {
                    const q = o[1] as IQuestion<AnyQuestionData>; //q - question
                    newOrsersMap[q.order] = q.key;
                });

                return setQuestionsOrder(newOrsersMap);
            })
            .then(() => {
                this.setState({
                    ...this.state,
                    deleteQuestionDialogShow: false,
                    questionFormShow: false,
                    loading: false,
                });
            });
    };
    onListChange = (newList: QuestionListItem[], movedItem: QuestionListItem, oldIndex: number, newIndex: number) => {
        console.log('[NEW LIST ]');
        console.dir(newList);


        const {questions, questionsOrderMap} = this.state;

        this.setState({
            ...this.state,
            loading: true,
        });

        let updates = {};

        const [oldI, newI] = [oldIndex + 1, newIndex + 1];
        let questionsToState = Object.keys(questions).map(k => questions[k])
            .filter(q => q.order === oldI || q.order === newI);

        let oldQ, newQ;
        if (questionsToState[0].order === oldI) {
            [oldQ, newQ] = [questionsToState[0], questionsToState[1]];
        } else {
            [oldQ, newQ] = [questionsToState[1], questionsToState[0]];
        }

        [oldQ.order, newQ.order] = [newI, oldI];
        updates[`/questions/${oldQ.key}`] = oldQ;
        updates[`/questions/${newQ.key}`] = newQ;

        updates[`/questions-order/${oldI}`] = newQ.key;
        updates[`/questions-order/${newI}`] = oldQ.key;

        // let updatedList = newList.map(o => {
        //     if (o.order === oldI) {
        //         return {...o, order: newI};
        //     }
        //
        //     if (o.order === newI) {
        //         return {...o, order: oldI};
        //     }
        //
        //     return o;
        // });

        updateDatabase(updates).then(() => {
            this.setState({
                ...this.state,
                questions: {
                    ...this.state.questions,
                    [oldQ.key]: oldQ,
                    [newQ.key]: newQ,
                },
                questionsOrderMap: {
                    ...this.state.questionsOrderMap,
                    [oldI]: newQ.key,
                    [newI]: oldQ.key,
                },
                questionsList: newList,
                loading: false,
            });
        });
    };


    constructor(props) {
        super(props);

        this.state = {
            questionFormShow: false,
            currentQuestionType: QuestionType.choose_right,
            loading: true,
            deleteQuestionDialogShow: false,
            error: '',
        };
    }

    componentDidMount() {
        getQuestions()
            .then((snapshot) => {
                const questions = snapshot.val();

                let newQuestionsList = [];

                if (questions) {
                    newQuestionsList = Object.values(questions).map((q: IQuestion<AnyQuestionData>) => {
                        return {
                            text: q.text,
                            order: q.order,
                        };
                    })
                        .sort((a, b) => a.order - b.order);
                }

                this.setState({
                    ...this.state,
                    questionsList: newQuestionsList,
                }, () => {
                    this.updateQuestions();
                });
            });
    }

    uploadFiles(key: string, fileIndex: number) {
        const {uploadedFiles} = this.state;

        const file = uploadedFiles[fileIndex];
        uploadFile(key, file).then(() => {
            if (uploadedFiles.length === fileIndex + 1) {
                console.log('On success add question');
                this.onSuccess();
            } else {
                this.uploadFiles(key, fileIndex + 1);
            }
        });
    };

    render() {
        const {
            loading, error, questions, questionFormShow, currentQuestion, isNewQuestion,
            currentQuestionType, deleteQuestionDialogShow, questionsList
        } = this.state;
        const qCount = questions ? Object.keys(questions).length : 0;

        return (
            <React.Fragment>
                {loading &&
                <div className={AppStyles.progress}>
                    <LinearProgress/>
                </div>
                }
                <div className={TestEditFormStyles.testEditForm}>
                    <div className={TestEditFormStyles.testEditFormItem}>
                        {qCount ? //TODO: replace with generator
                            <DraggableList itemKey="order"
                                           template={QuestionItem}
                                           list={questionsList}
                                           onMoveEnd={
                                               (newList, movedItem, oldIndex, newIndex) =>
                                                   this.onListChange(newList, movedItem, oldIndex, newIndex)
                                           }
                                           container={() => {
                                               return document.body;
                                           }}
                                           commonProps={{
                                               onClick: this.editQuestion
                                           }}
                            />
                            :
                            <Typography variant="body1" gutterBottom>
                                В тесте нет вопросов.
                            </Typography>
                        }
                    </div>
                    <div className={TestEditFormStyles.testEditFormItem}>
                        <DeleteQuestionDialog open={deleteQuestionDialogShow}
                                              onClose={this.closeDeleteQuestionDialog}
                                              onSubmit={this.onDeleteQuestion}/>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth={true}
                            onClick={this.showAddForm}
                            disabled={questionFormShow}
                        >
                            Добавить вопрос
                        </Button>
                        <br/>
                        {
                            questionFormShow &&
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
                                    <form autoComplete="off" onSubmit={this.onFormSubmit}>
                                        <TextField label="Формулировка вопроса:"
                                                   fullWidth={true}
                                                   margin={'dense'}
                                                   onChange={this.onQuestionChange}
                                                   defaultValue={currentQuestion.text}>
                                        </TextField>
                                        <br/>
                                        {!(currentQuestionType === QuestionType.open_question) &&
                                        <TextField label="Количество баллов:"
                                                   fullWidth={true}
                                                   margin={'dense'}
                                                   onChange={this.onPointsChange}
                                                   defaultValue={currentQuestion.points}>
                                        </TextField>
                                        }
                                        <br/>
                                        <div>
                                            <input
                                                accept="image/*"
                                                className={TestEditFormStyles.uploadFileButton}
                                                id="raised-button-file"
                                                multiple
                                                type="file"
                                                onChange={evt => this.onFilesUpload(evt)}
                                            />
                                            <label htmlFor="raised-button-file">
                                                <Button variant="contained" color="primary" component="span">
                                                    Добавить картинку
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
                                            {!isNewQuestion &&
                                            <Button
                                                variant="contained"
                                                style={{
                                                    marginRight: '10px',
                                                    float: 'right',
                                                }}
                                                onClick={this.onDeleteButtonClick}>
                                                Удалить
                                            </Button>
                                            }
                                        </div>
                                    </form>
                                </Paper>
                            </Paper>
                        }
                    </div>
                </div>
            </React.Fragment>
        );
    }

    extracted(qCount: number, questions: { [p: string]: IQuestion<AnyQuestionData> }, questionsOrderMap: { [p: number]: string }) {
        return (
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
        );
    }
}
