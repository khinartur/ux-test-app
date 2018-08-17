import * as React from 'react';
import {database} from '../modules/firebase';
import Button from '@material-ui/core/Button';
import {AnyQuestion, IQuestion} from '../interfaces/IQuestion';
import QuestionEditForm from './QuestionEditForm';

import '../styles/TestEditForm.scss';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import embedKey from '../utils/key-embedding';

interface State {
    questions?: { [key: string]: IQuestion<AnyQuestion> };
    showAddQuestionForm: boolean;
    questionOrder?: number;
    questionsOrderMap?: { [key: number]: string };
    questionToEdit?: IQuestion<AnyQuestion>;
    loading: boolean;
    qPaper: { [key: string]: string };
}

export default class TestEditForm extends React.Component<{}, State> {
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
            questionOrder: questions ? Object.keys(questions).length : 1,
            showAddQuestionForm: true,
        });
    };

    editQuestion = (evt: any, order: number) => {
        const qKey = this.state.questionsOrderMap[order];
        const qToEdit = this.state.questions[qKey];

        this.setState({
            ...this.state,
            questionToEdit: qToEdit,
            showAddQuestionForm: true,
        });
    };

    onSuccessQuestionEdit = () => {
        this.setState({
            ...this.state,
            questionOrder: this.state.questionOrder + 1,
            showAddQuestionForm: false,
        });
    };

    onQuestionMouseOver = () => {
        this.setState({
            ...this.state,
            qPaper: {
                bgColor: 'grey',
                textColor: 'white',
            },
        });
    };

    onQuestionMouseOut = () => {
        this.setState({
            ...this.state,
            qPaper: {
                bgColor: 'white',
                textColor: 'black',
            },
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            showAddQuestionForm: false,
            loading: true,
            qPaper: {
                bgColor: 'white',
            },
        };
    }

    componentDidMount() {
        database.ref('questions/').on('value', function (questionsSnapshot) {
            database.ref('questions-order/').once('value').then(function (mapSnapshot) {
                this.updateQuestionsList(questionsSnapshot.val(), mapSnapshot.val());
            }.bind(this));
        }.bind(this));
    }

    render() {
        const questions = this.state.questions;
        const qMap = this.state.questionsOrderMap;
        const qToEdit = this.state.questionToEdit;
        const qCount = questions ? Object.keys(questions).length : 0;

        return (

            !this.state.loading &&
            <div className={'test-edit-form'}>
                {
                    <div className={'test-edit-form__item'}>
                        {qCount ? //TODO: replace with generator
                            new Array(qCount).fill(true).map((v: boolean, i: number) => {
                                const q = questions[qMap[i+1]];
                                return <Paper key={i}
                                              className={'question-choose-paper'}
                                              onClick={(evt) => this.editQuestion(evt, q.order)}
                                              onMouseOver={this.onQuestionMouseOver}
                                              onMouseOut={this.onQuestionMouseOut}
                                              style={{
                                                  backgroundColor: this.state.qPaper.bgColor,
                                              }}
                                >
                                    <Typography variant="body1"
                                                style={{color: this.state.qPaper.textColor}}>
                                        {q.order + ') ' + q.text}
                                    </Typography>
                                </Paper>;
                            })
                            :
                            <Typography variant="body1" gutterBottom>
                                В тесте нет вопросов.
                            </Typography>
                        }
                    </div>
                }
                <div className={'test-edit-form__item'}>
                    <Button variant="contained" color="primary" fullWidth={true} onClick={this.showAddForm}>
                        Добавить вопрос
                    </Button>
                    <br/>
                    {
                        this.state.showAddQuestionForm &&
                        <QuestionEditForm question={this.state.questionToEdit}
                                          order={qToEdit ? qToEdit.order : this.state.questionOrder}
                                          onSuccess={this.onSuccessQuestionEdit}/>
                    }
                </div>
            </div>
        );
    }
}
