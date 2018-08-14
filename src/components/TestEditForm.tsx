import * as React from 'react';
import {database} from '../modules/firebase';
import Button from '@material-ui/core/Button';
import {AnyQuestion, IQuestion} from '../interfaces/IQuestion';
import QuestionEditForm from './QuestionEditForm';

import '../styles/TestEditForm.scss';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

interface State {
    questions?: IQuestion<AnyQuestion>[];
    showAddQuestionForm: boolean;
    questionOrder?: number;
    questionToEdit?: IQuestion<AnyQuestion>;
}

export default class TestEditForm extends React.Component<{}, State> {
    updateQuestionsList = (questions) => {
        this.setState({
            ...this.state,
            questions: questions,
            questionOrder: questions ? questions.length + 1 : 1,
        });
    };

    showAddForm = () => {
        this.setState({
            ...this.state,
            showAddQuestionForm: true,
        });
    };

    editQuestion = (evt: any, order: number) => {
        console.log('edit question');
        debugger;
        const qToEdit = this.state.questions.filter((q) => q.order === order)[0];

        this.setState({
            ...this.state,
            questionToEdit: qToEdit,
            showAddQuestionForm: true,
        })
    };

    onSuccessQuestionEdit = () => {
        this.setState({
            ...this.state,
            showAddQuestionForm: false,
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            showAddQuestionForm: false,
        };
    }

    componentDidMount() {
        const questionsRef = database.ref('question/');
        questionsRef.on('value', function (snapshot) {
            this.updateQuestionsList(snapshot.val());
        }.bind(this));
    }

    render() {
        return (
            <div className={'test-edit-form'}>
                {
                    <div className={'test-edit-form__item'}>
                        {this.state.questions && this.state.questions.length ?

                            this.state.questions.map((question: IQuestion<AnyQuestion>, index: number) => {
                                return <Paper key={index}
                                              data-qorder={question.order}
                                              onClick={(evt) => this.editQuestion(evt, question.order)}
                                        >
                                            <span>{question.order + ') '}</span>{question.text}
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
                                          order={this.state.questionOrder}
                                          onSuccess={this.onSuccessQuestionEdit}/>
                    }
                </div>
            </div>
        );
    }
}
