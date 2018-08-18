import * as React from 'react';
import {database} from '../modules/firebase';
import Button from '@material-ui/core/Button';
import {AnyQuestionData, IQuestion} from '../interfaces/IQuestion';
import QuestionEditForm from './QuestionEditForm';

import '../styles/TestEditForm.scss';
import Typography from '@material-ui/core/Typography';
import {embedKey} from '../utils/key-embedding';

interface State {
    questions?: { [key: string]: IQuestion<AnyQuestionData> };
    showAddQuestionForm: boolean;
    questionOrder?: number;
    questionsOrderMap?: { [key: number]: string };
    questionToEdit?: IQuestion<AnyQuestionData>;
    loading: boolean;
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
        evt.target.className = 'question-choose-div__active';
    };

    onQuestionMouseOut = (evt) => {
        if (this.state.showAddQuestionForm) return;
        evt.target.className = 'question-choose-div';
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
            showAddQuestionForm: false,
            loading: true,
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
        console.log("ORDER TO PROPS:", this.state.questionOrder);

        return (

            !this.state.loading &&
            <div className={'test-edit-form'}>
                {
                    <div className={'test-edit-form__item'}>
                        {qCount ? //TODO: replace with generator
                            new Array(qCount).fill(true).map((v: boolean, i: number) => {
                                const q = questions[qMap[i + 1]];
                                return <div key={i}
                                            className={'question-choose-div'}
                                            onClick={(evt) => this.editQuestion(evt, q.order)}
                                            onMouseOver={(evt) => this.onQuestionMouseOver(evt)}
                                            onMouseOut={(evt) => this.onQuestionMouseOut(evt)}
                                >
                                    {/*<Typography variant="body1"*/}
                                    {/*className={'question-choose-typo'}>*/}
                                    {q.order + ') ' + q.text}
                                    {/*</Typography>*/}
                                </div>;
                            })
                            :
                            <Typography variant="body1" gutterBottom>
                                В тесте нет вопросов.
                            </Typography>
                        }
                    </div>
                }
                <div className={'test-edit-form__item'}>
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
                        <QuestionEditForm question={this.state.questionToEdit}
                                          order={qToEdit ? qToEdit.order : this.state.questionOrder}
                                          onSuccess={this.onSuccessQuestionEdit}
                                          onCancel={this.onCancelQuestionEdit}/>
                    }
                </div>
            </div>
        );
    }
}
