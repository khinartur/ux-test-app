import * as React from 'react';
import {database} from '../modules/firebase';
import Button from '@material-ui/core/Button';
import {IQuestion} from './Question';
import QuestionEditForm from './QuestionEditForm';

import '../styles/TestEditForm.scss';

interface State {
    questions: IQuestion[];
    showAddQuestionForm: boolean;
}

export default class TestEditForm extends React.Component<{}, State> {
    updateQuestionsList = (questions) => {
        this.setState({
            ...this.state,
            questions: questions,
        });
    };
    showAddForm = () => {
        this.setState({
            ...this.state,
            showAddQuestionForm: true,
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            questions: [],
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

                            this.state.questions.map(question => {
                                return <div><span>{question.order + ') '}</span>{question.question}</div>;
                            })
                            :
                            <div>В тесте нет вопросов.</div>
                        }
                    </div>
                }
                <div className={'test-edit-form__item'}>
                    <Button onClick={this.showAddForm}>Добавить вопрос</Button>
                    <br/>
                    {
                        this.state.showAddQuestionForm && <QuestionEditForm question={null}/>
                    }
                </div>
            </div>
        );
    }
}
