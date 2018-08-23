import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {EUserTestStatus, IUser} from '../interfaces/IUser';
import {
    AnyQuestionData, EQuestionMode, IChooseAnswer, IChooseRightData, IMatchAnswer, IMatchColumnsData, IOpenQuestionData,
    IQuestion,
    QuestionAnswer,
    QuestionType
} from '../interfaces/IQuestion';
import {database} from '../modules/firebase';
import ChooseRightQuestion from './ChooseRightQuestion';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import MatchColumnsQuestion from './MatchColumnsQuestion';
import OpenQuestion from './OpenQuestion';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import * as TestQuestionStyles from '../styles/TestQuestion.scss';
import * as AppStyles from '../styles/App.scss';
import LinearProgress from '@material-ui/core/LinearProgress';


interface Props {
    question: IQuestion<AnyQuestionData>,
    questionsCount: number;
    pictures: any[],
    mode: EQuestionMode,
    onBack?: () => void,
    onNext?: () => void,
    onAnswer?: (a: QuestionAnswer[] | string, b: boolean) => void,
    onPointsAdd?: (e: any, p: number) => void,
    user?: IUser,
}

interface State {
    isQuestionAnswered: boolean;
    pointsToAdd?: number;
    loading: boolean;
}

class TestQuestion extends React.Component<Props & RouteComponentProps<{}>, State> {

    onAnswerChange = (answer: QuestionAnswer) => {
        const {question, onAnswer} = this.props;

        let answers;
        let newAnswers = [];
        let isAnswered;
        switch (question.type) {
            case QuestionType.choose_right:
                answers = (question.questionData as IChooseRightData).answers;
                answers.map((a: IChooseAnswer) => {
                    if (a.text == (answer as IChooseAnswer).text) {
                        (answer as IChooseAnswer).isAnswered = !(answer as IChooseAnswer).isAnswered;
                        newAnswers.push(answer);
                    } else {
                        newAnswers.push(a);
                    }
                });
                isAnswered = newAnswers.filter((a: IChooseAnswer) => a.isAnswered).length > 0;
                onAnswer(newAnswers, isAnswered);
                break;

            case QuestionType.match_columns:
                answers = (question.questionData as IMatchColumnsData).answers;
                newAnswers = answers.map((a: IMatchAnswer) => {
                    if (a.left === (answer as IMatchAnswer).left) {
                        return answer;
                    }

                    return a;
                });

                //(question as IQuestion<IMatchColumnsData>).questionData.answers = newAnswers;
                isAnswered = newAnswers.some((a: IMatchAnswer) => !!a.user_answer);
                //(question as IQuestion<IMatchColumnsData>).isAnswered = isAnswered;
                debugger;
                onAnswer(newAnswers, isAnswered);
                break;

            case QuestionType.open_question:
                //(question as IQuestion<IOpenQuestionData>).questionData.answer = answer as string;
                isAnswered = !!answer;
                //(question as IQuestion<IOpenQuestionData>).isAnswered = isAnswered;
                onAnswer(answer as string, isAnswered);
                break;
        }
    };

    onAnswerSave = () => {
        const {user, question, onNext} = this.props;

        console.log('[TestQuestion#onAnswerSave]');
        console.dir(question.questionData);

        debugger;
        this.setState({
            ...this.state,
            loading: true,
        });

        database.ref('passed-questions/' + user.github + '/' + question.key).set({
            ...question,
        }).then(() => {
            database.ref('users/' + this.props.user.github).set({
                ...this.props.user,
                test_status: EUserTestStatus.in_progress,
                current_question: question.order + 1,
            }).then(() => {
                onNext();
                this.setState({
                    ...this.state,
                    loading: false,
                });
            });
        });
    };

    onPointsToAddChange = (evt) => {
        const points = evt.currentTarget.textContent;

        this.setState({
            ...this.state,
            pointsToAdd: points,
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            pointsToAdd: this.props.question.points,
            isQuestionAnswered: false,
            loading: false,
        };
    }

    componentDidMount() {

    }

    render() {
        const {question, questionsCount, pictures, mode, onBack} = this.props;

        console.log('[TestQuestion#render]');
        console.dir((question.questionData as any).answers);

        const isPassingMode = mode == EQuestionMode.passing;

        return (
            <React.Fragment>
                {this.state.loading &&
                <div className={AppStyles.progress}>
                    <LinearProgress/>
                </div>
                }
                {isPassingMode &&
                <Typography variant="body2"
                            className={TestQuestionStyles.questionNumberHeader}>
                    Вопрос {question.order + '/' + questionsCount}
                </Typography>
                }
                {isPassingMode &&
                <div className={TestQuestionStyles.toQuestionsButton}>
                    <Button variant='contained'
                            color='primary'
                            fullWidth={false}
                            onClick={onBack}>
                        К списку вопросов
                    </Button>
                </div>
                }
                <div className={TestQuestionStyles.container}>
                    {
                        <Paper className={TestQuestionStyles.questionPaper}
                               elevation={10}>
                            <Typography variant="title"
                                        style={{paddingTop: '3px'}}>
                                <div className={TestQuestionStyles.questionNumberDiv}>
                                            <span
                                                className={TestQuestionStyles.questionOrderSpan}>
                                                {' ' + question.order + '.'}
                                                </span>
                                </div>
                                {question.text}
                            </Typography>
                            <br/>
                            {
                                pictures.length ?
                                    pictures.map((url: string, i: number) => {
                                        return <img key={i}
                                                    src={url}
                                                    style={{
                                                        height: '180px',
                                                        display: 'inline-block',
                                                    }}/>;
                                    }) : null
                            }
                            <br/>
                            {question.type === QuestionType.choose_right &&
                            <ChooseRightQuestion question={question as IQuestion<IChooseRightData>}
                                                 mode={mode}
                                                 onAnswer={(answer) => this.onAnswerChange(answer)}/>}
                            {question.type === QuestionType.match_columns &&
                            <MatchColumnsQuestion question={question as IQuestion<IMatchColumnsData>}
                                                  mode={mode}
                                                  onAnswer={(answer) => this.onAnswerChange(answer)}/>}
                            {question.type === QuestionType.open_question &&
                            <OpenQuestion question={question as IQuestion<IOpenQuestionData>}
                                          mode={mode}
                                          onAnswer={(answer) => this.onAnswerChange(answer)}/>}
                            {isPassingMode &&
                            <div className={TestQuestionStyles.questionSaveButton}>
                                <Button variant="contained"
                                        color="primary"
                                        fullWidth={true}
                                        onClick={this.onAnswerSave}>
                                    Сохранить ответ
                                </Button>
                            </div>
                            }
                            {!isPassingMode &&
                            <div className={TestQuestionStyles.addPointsDiv}>
                                <div>
                                    <TextField label='Добавить баллов'
                                               fullWidth={true}
                                               margin={'dense'}
                                               disabled={!(question.type == QuestionType.open_question)}
                                               onChange={(evt) => this.onPointsToAddChange(evt)}
                                               defaultValue={question.points}
                                    />
                                </div>
                                <div>
                                    <Button variant="contained"
                                            color="primary"
                                            disabled={!(question.type == QuestionType.open_question)}
                                            onClick={(evt) => this.props.onPointsAdd(evt, this.state.pointsToAdd)}>
                                        Добавить баллы
                                    </Button>
                                </div>
                            </div>
                            }
                        </Paper>
                    }
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(TestQuestion);
