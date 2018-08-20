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
            downloadedFiles: [],
            passMode: this.props.mode === 'pass' ?
                {isAnswered: false} : null,
            loading: true,
        };

        this.loadPictures();
    }

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
                {
                    (mode === 'edit' || mode === 'create') &&
                    <Paper className={ChooseRightQuestionStyles.chooseRightEditPaper}>
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
                                <div>
                                    <TextField label='Ответ'
                                               fullWidth={true}
                                               margin={'dense'}
                                               onChange={this.onAnswerChange}
                                               value={this.state.answerVariantText}
                                    />
                                </div>
                                <div>
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
