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

import * as OpenQuestionStyles from '../styles/OpenQuestion.scss';
import * as TestEditFormStyles from '../styles/TestEditForm.scss';
import * as TestStyles from '../styles/Test.scss';
import * as AppStyles from '../styles/App.scss';

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
            downloadedFiles: [],
            passMode: this.props.mode === 'pass' ?
                {isAnswered: false} : null,
            loading: true,
        };
    }

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
                    <Paper className={OpenQuestionStyles.openQuestionEditPaper}>
                            <br/>
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
                    <TextField label="Ответ:"
                               fullWidth={true}
                               multiline={true}
                               rows={8}
                               rowsMax={8}
                               margin={'dense'}
                               onChange={(evt) => this.onAnswerTextareaChange(evt)}>
                    </TextField>
                    <br/>
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
        )
    }
}
