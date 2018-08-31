import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {IUser} from '../interfaces/IUser';
import {
    AnyQuestionData,
    EQuestionMode,
    IChooseRightData,
    IMatchColumnsData,
    IOpenQuestionData,
    IQuestion,
    QuestionType
} from '../interfaces/IQuestion';
import ChooseRightQuestion from './ChooseRightQuestion';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import MatchColumnsQuestion from './MatchColumnsQuestion';
import OpenQuestion from './OpenQuestion';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ChevronDoubleLeft from 'mdi-material-ui/ChevronDoubleLeft';
import ChevronDoubleRight from 'mdi-material-ui/ChevronDoubleRight';

import * as TestQuestionStyles from '../styles/TestQuestion.scss';
import * as AppStyles from '../styles/App.scss';
import LinearProgress from '@material-ui/core/LinearProgress';


interface Props {
    question: IQuestion<AnyQuestionData>,
    questionsCount: number;
    pictures: any[],
    mode: EQuestionMode,
    onList?: () => void,
    onBack?: () => void,
    onNext?: () => void,
    onAnswer?: (a: IQuestion<AnyQuestionData>) => void,
    onAnswerSave?: () => void;
    onPointsAdd?: (e: any, p: number) => void,
    user?: IUser,
}

interface State {
    pointsToAdd?: number;
    loading: boolean;
}

class TestQuestion extends React.Component<Props & RouteComponentProps<{}>, State> {

    onPointsToAddChange = (evt) => {
        const points = evt.currentTarget.value;

        this.setState({
            ...this.state,
            pointsToAdd: points,
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            pointsToAdd: this.props.question.points,
            loading: false,
        };
    }

    render() {
        const {
            question, questionsCount, pictures, mode, onList,
            onBack, onNext, onAnswer, onAnswerSave, onPointsAdd
        } = this.props;
        const {pointsToAdd} = this.state;

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
                            onClick={onList}>
                        К списку вопросов
                    </Button>
                </div>
                }
                <div className={TestQuestionStyles.container1}>
                    <div className={TestQuestionStyles.arrowWrapper}>{isPassingMode &&
                    <div className={TestQuestionStyles.arrow}
                         onClick={onBack}>
                        <div className={TestQuestionStyles.arrowInner}>
                            <ChevronDoubleLeft/>
                        </div>
                    </div>
                    }</div>
                    <div className={TestQuestionStyles.container}>
                        {
                            <Paper className={TestQuestionStyles.questionPaper}
                                   elevation={10}>
                                <Typography variant="title"
                                            style={{lineHeight: '32px'}}>
                                    <div className={TestQuestionStyles.questionNumberDiv}>
                                            <span
                                                className={TestQuestionStyles.questionOrderSpan}>
                                                {question.order}
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
                                                     onAnswer={onAnswer}/>}
                                {question.type === QuestionType.match_columns &&
                                <MatchColumnsQuestion question={question as IQuestion<IMatchColumnsData>}
                                                      mode={mode}
                                                      onAnswer={onAnswer}/>}
                                {question.type === QuestionType.open_question &&
                                <OpenQuestion question={question as IQuestion<IOpenQuestionData>}
                                              mode={mode}
                                              onAnswer={onAnswer}/>}
                                {isPassingMode &&
                                <div className={TestQuestionStyles.questionSaveButton}>
                                    <Button variant="contained"
                                            color="primary"
                                            fullWidth={true}
                                            onClick={onAnswerSave}>
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
                                                   defaultValue={pointsToAdd}/>
                                    </div>
                                    <div>
                                        <Button variant="contained"
                                                color="primary"
                                                disabled={!(question.type == QuestionType.open_question)}
                                                onClick={(evt) => onPointsAdd(evt, pointsToAdd)}>
                                            Добавить баллы
                                        </Button>
                                    </div>
                                </div>
                                }
                            </Paper>
                        }
                    </div>
                    <div className={TestQuestionStyles.arrowWrapper}>{isPassingMode &&
                    <div className={TestQuestionStyles.arrow}
                         onClick={onNext}>
                        <div className={TestQuestionStyles.arrowInner}>
                            <ChevronDoubleRight/>
                        </div>
                    </div>
                    }</div>

                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(TestQuestion);
