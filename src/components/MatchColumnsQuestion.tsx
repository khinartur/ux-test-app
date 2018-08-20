import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import * as AppStyles from '../styles/App.scss';
import * as MatchColumnsQuestionStyles from '../styles/MatchColumnsQuestion.scss';
import * as TestEditFormStyles from '../styles/TestEditForm.scss';
import * as TestStyles from '../styles/Test.scss';

import {
    IMatchAnswer, IMatchColumnsData, QuestionType, IQuestionProps, IQuestionState, IChooseAnswer
} from '../interfaces/IQuestion';
import {MATCH_COLUMNS_POINTS} from '../constants/points';
import {database, storageRef} from '../modules/firebase';
import {shuffle} from '../utils/key-embedding';

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

    onCancelEdit = () => {
        this.props.onCancel();
        this.setState({
            ...this.state,
            addingAnswer: null,
            answerTextLeft: null,
            answerTextRight: null,
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
            downloadedFiles: [],
            passMode: this.props.mode === 'pass' ?
                {isAnswered: false} : null,
            loading: true,
        };
    }


    componentDidMount() {
        if (this.props.mode === 'pass' && this.state.question.pictures) {
            if (this.state.question.pictures) {
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
            }

            let [leftAnswers, rightAnswers] = [[], []];
            this.state.question.questionData.answers.map((answer: IMatchAnswer) => {
                leftAnswers.push(answer.left);
                rightAnswers.push(answer.right);
            });

            this.setState({
                ...this.state,
                passMode: {
                    ...this.state.passMode,
                    leftAnswers: shuffle(leftAnswers),
                    rightAnswers: shuffle(rightAnswers),
                }
            });
        } else {
            this.setState({
                ...this.state,
                loading: false,
            });
        }
    }
    onAnswerClick = (evt) => {
        console.log(evt.target.textContent);
        const answerText = evt.target.textContent;
        const answers = this.state.question.questionData.answers;

        const currentAnswer = this.state.passMode.answer || {};
        switch (evt.target.name) {
            case 'left':
                currentAnswer.left = answerText;
                if (currentAnswer.right) {
                    let dbAnswer = answers.filter((ans: IMatchAnswer) => ans.left == currentAnswer.left)[0];
                    dbAnswer.user_answer = currentAnswer.right;
                    evt.currentTarget.style.display = 'none';
                    this.setState({
                        ...this.state,
                        passMode: {
                            ...this.state.passMode,
                            answer: null,
                        }
                    });
                } else {
                    evt.currentTarget.style.backgroundColor = '#009688';
                }
                break;
            case 'right':
                currentAnswer.right = answerText;
                if (currentAnswer.left) {
                    let dbAnswer = answers.filter((ans: IMatchAnswer) => ans.left == currentAnswer.left)[0];
                    dbAnswer.user_answer = currentAnswer.right;
                    evt.currentTarget.style.display = 'none';
                    this.setState({
                        ...this.state,
                        passMode: {
                            ...this.state.passMode,
                            answer: null,
                        }
                    });
                } else {
                    evt.currentTarget.style.backgroundColor = '#009688';
                }
                break;
        }

        const isQAnswered = answers.filter((ans: IMatchAnswer) => ans.user_answer).length == answers.length;

        console.log('MATCH COLUMNS ANSWERS:');
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

        this.state.passMode.isAnswered ?
            this.props.onPass(question) :
            this.props.onSkip(question);
    };


    render() {
        const {question, mode, count} = this.props;

        const answers = this.state.question.questionData.answers;
        const pictutes = this.state.question.pictures;

        return (
            <div>
                {
                    (mode === 'edit' || mode === 'create') &&
                    <Paper className={MatchColumnsQuestionStyles.matchColumnsEditPaper}>
                            <div>
                                {
                                    answers.length ?
                                        answers.map((answer: IMatchAnswer, index: number) => {
                                            return <Paper key={index}>
                                                {answer.left + '   =====>   ' + answer.right}
                                            </Paper>;
                                        })
                                        :
                                        <div>Нет вариантов ответа.</div>
                                }
                            </div>
                            <br/>
                            <div className={MatchColumnsQuestionStyles.matchAnswerVariant}>
                                <div>
                                    <TextField label='Левый столбец'
                                               fullWidth={true}
                                               margin={'dense'}
                                               inputProps={{
                                                   name: 'left',
                                               }}
                                               onChange={this.onAnswerChange}
                                               value={this.state.answerTextLeft}
                                    />
                                </div>
                                <div>
                                    <TextField label='Правый столбец'
                                               fullWidth={true}
                                               margin={'dense'}
                                               inputProps={{
                                                   name: 'right',
                                               }}
                                               onChange={this.onAnswerChange}
                                               value={this.state.answerTextRight}
                                    />
                                </div>
                                <div>
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
                        new Array(this.state.question.questionData.answers.length).fill(true).map((n: boolean, i: number) => {
                            return (
                                <div key={i} className={MatchColumnsQuestionStyles.matchRow}>
                                    <div>
                                        <Button variant="contained"
                                                color="primary"
                                                fullWidth={true}
                                                name={'left'}
                                                onClick={(evt) => this.onAnswerClick(evt)}>
                                            {this.state.passMode.leftAnswers[i]}
                                        </Button>
                                    </div>
                                    <div>
                                        <Button variant="contained"
                                                color="primary"
                                                fullWidth={true}
                                                name={'right'}
                                                onClick={(evt) => this.onAnswerClick(evt)}>
                                            {this.state.passMode.rightAnswers[i]}
                                        </Button>
                                    </div>
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
