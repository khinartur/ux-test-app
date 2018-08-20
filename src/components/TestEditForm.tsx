import * as React from 'react';
import {database, storageRef} from '../modules/firebase';
import Button from '@material-ui/core/Button';
import {
    AnyQuestionData, IChooseAnswer, IChooseRightData, IMatchColumnsData, IOpenQuestionData, IQuestion,
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

interface State {
    questions?: { [key: string]: IQuestion<AnyQuestionData> };
    showAddQuestionForm: boolean;
    questionOrder?: number;
    questionsOrderMap?: { [key: number]: string };
    questionToEdit?: IQuestion<AnyQuestionData>;
    questionToEditType: QuestionType;
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

        const key = this.state.questionToEdit ?
            this.state.questionToEdit.key :
            database.ref().child('/questions').push().key;


        // //TODO: save without key
        // database.ref('questions/' + key).set({
        //     ...this.state.questionToEdit,
        //     order: this.state.questionToEdit.order,
        // }).then(() => {
        //     database.ref('questions-order/' + this.state.questionToEdit.order).set(key).then(() => {
        //         if (this.state.uploadedFiles && this.state.uploadedFiles.length) {
        //             this.uploadFiles(key, 0);
        //         } else {
        //             this.props.onSuccess();
        //         }
        //     });
        // });
    };
    validateQuestion = () => {
        if (!this.state.questionToEdit.text) {
            return 'Формулировка вопроса не может быть пустой';
        }

        if (this.state.questionToEditType == QuestionType.choose_right) {
            const q = this.state.questionToEdit as IQuestion<IChooseRightData>;
            const answers = q.questionData.answers;
            const rightAnswers = answers.filter((a: IChooseAnswer) => a.isRight);

            if (!rightAnswers.length) return 'Необходим хотя бы один правильный ответ';
        }

        return '';
    };

    onQuestionChange = (evt) => {
        this.setState({
            ...this.state,
            questionToEdit: {
                ...this.state.questionToEdit,
                text: evt.target.value,
            }
        });
    };
    onPointsChange = (evt) => {
        this.setState({
            ...this.state,
            questionToEdit: {
                ...this.state.questionToEdit,
                points: evt.target.value,
            }
        });
    };

    onFilesUpload = (evt) => {
        const files = evt.target.files;

        const filenames = Array.prototype.map.call(files, file => file.name);
        this.setState({
            ...this.state,
            questionToEdit: {
                ...this.state.questionToEdit,
                pictures: filenames,
            },
            uploadedFiles: files,
        });
    };

    onSelectChange = (evt) => {
        console.log(evt.target.value);
        this.setState({
            ...this.state,
            questionToEditType: evt.target.value,
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
            questionToEdit: null,
            questionOrder: questions ? Object.keys(questions).length + 1 : 1,
            showAddQuestionForm: true,
        });
    };

    editQuestion = (evt: any, order: number) => {
        if (this.state.showAddQuestionForm) return;

        const qKey = this.state.questionsOrderMap[order];
        const qToEdit = this.state.questions[qKey];

        this.setState({
            ...this.state,
            questionToEdit: qToEdit,
            showAddQuestionForm: true,
        });
    };

    onSuccessQuestionEdit = () => {
        this.updateQuestions();

        this.setState({
            ...this.state,
            showAddQuestionForm: false,
            loading: true,
        });
    };

    onCancelQuestionEdit = () => {
        this.setState({
            ...this.state,
            showAddQuestionForm: false,
        });
    };

    onQuestionMouseOver = (evt) => {
        if (this.state.showAddQuestionForm) return;
        evt.target.className = TestEditFormStyles.questionChooseDivActive;
    };

    onQuestionMouseOut = (evt) => {
        if (this.state.showAddQuestionForm) return;
        evt.target.className = TestEditFormStyles.questionChooseDiv;
    };
    updateQuestions = () => {
        database.ref('questions/').on('value', function (questionsSnapshot) {
            database.ref('questions-order/').once('value').then(function (mapSnapshot) {
                this.updateQuestionsList(questionsSnapshot.val(), mapSnapshot.val());
            }.bind(this));
        }.bind(this));
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

    constructor(props) {
        super(props);

        this.state = {
            showAddQuestionForm: false,
            loading: true,
            questionToEditType: QuestionType.choose_right,
            error: '',
        };
    }

    componentDidMount() {
        this.updateQuestions();
    }

    render() {
        const questions = this.state.questions;
        const qMap = this.state.questionsOrderMap;
        const qToEdit = this.state.questionToEdit;
        const qCount = questions ? Object.keys(questions).length : 0;
        const isEditFormShown = this.state.showAddQuestionForm;
        console.log('ORDER TO PROPS:', this.state.questionOrder);

        return (

            !this.state.loading &&
            <div className={TestEditFormStyles.testEditForm}>
                {
                    <div
                        className={TestEditFormStyles.testEditFormItem}
                    >
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
                <div
                    className={TestEditFormStyles.testEditFormItem}
                >
                    <Button variant="contained"
                            color="primary"
                            fullWidth={true}
                            onClick={this.showAddForm}
                            disabled={isEditFormShown}>
                        Добавить вопрос
                    </Button>
                    <br/>
                    {
                        this.state.showAddQuestionForm &&
                        <Paper className={TestEditFormStyles.questionEditForm}>
                            <FormControl>
                                <InputLabel htmlFor="type">Тип вопроса</InputLabel>
                                <Select
                                    value={this.state.questionToEditType}
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
                                    variant="title">{this.state.questionToEdit ?
                                    'Редактирование вопроса' : 'Создание нового вопроса'}
                                </Typography>
                                <br/>
                                <Paper className={AppStyles.error}>{this.state.error}</Paper>
                                <form autoComplete="off" onSubmit={this.onFormSubmit}>
                                    <TextField label="Формулировка вопроса:"
                                               fullWidth={true}
                                               margin={'dense'}
                                               onChange={this.onQuestionChange}
                                               defaultValue={this.state.questionToEdit ? this.state.questionToEdit.text : null}>
                                    </TextField>
                                    <br/>
                                    <TextField label="Количество баллов:"
                                               fullWidth={true}
                                               margin={'dense'}
                                               onChange={this.onPointsChange}
                                               defaultValue={this.state.questionToEdit ? this.state.questionToEdit.points : 2}>
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
                                            this.state.questionToEdit.pictures &&
                                            this.state.questionToEdit.pictures.map((name: string, i: number) => {
                                                return <div key={i}>{name}</div>;
                                            })
                                        }
                                    </div>
                                </form>
                            </Paper>

                            {
                                this.state.questionToEditType === QuestionType.choose_right &&
                                <ChooseRightQuestion question={this.state.questionToEdit as IQuestion<IChooseRightData>}
                                                     order={qToEdit ? qToEdit.order : this.state.questionOrder}
                                                     mode={this.state.questionToEdit ? 'edit' : 'create'}
                                                     onSuccess={this.onSuccessQuestionEdit}
                                                     onCancel={this.onCancelQuestionEdit}/>
                            }
                            {
                                this.state.questionToEditType === QuestionType.match_columns &&
                                <MatchColumnsQuestion
                                    question={this.state.questionToEdit as IQuestion<IMatchColumnsData>}
                                    order={qToEdit ? qToEdit.order : this.state.questionOrder}
                                    mode={this.state.questionToEdit ? 'edit' : 'create'}
                                    onSuccess={this.onSuccessQuestionEdit}
                                    onCancel={this.onCancelQuestionEdit}/>
                            }
                            {
                                this.state.questionToEditType === QuestionType.open_question &&
                                <OpenQuestion question={this.state.questionToEdit as IQuestion<IOpenQuestionData>}
                                              order={qToEdit ? qToEdit.order : this.state.questionOrder}
                                              mode={this.state.questionToEdit ? 'edit' : 'create'}
                                              onSuccess={this.onSuccessQuestionEdit}
                                              onCancel={this.onCancelQuestionEdit}/>
                            }
                        </Paper>
                    }
                </div>
            </div>
        );
    }
}
