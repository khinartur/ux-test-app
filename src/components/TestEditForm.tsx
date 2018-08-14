import * as React from 'react';
import {database} from '../modules/firebase';
import Button from '@material-ui/core/Button';
import {AnyQuestion, IQuestion} from '../interfaces/IQuestion';
import QuestionEditForm from './QuestionEditForm';

import '../styles/TestEditForm.scss';
import Typography from '@material-ui/core/Typography';

interface State {
    questions?: IQuestion<AnyQuestion>[];
    showAddQuestionForm: boolean;
    nextQuestionNumber?: number;
}

export default class TestEditForm extends React.Component<{}, State> {
    updateQuestionsList = (questions) => {
        this.setState({
            ...this.state,
            questions: questions,
            nextQuestionNumber: questions ? questions.length + 1 : 1,
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
                                return <div key={index}><span>{question.order + ') '}</span>{question.text}</div>;
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
                        <QuestionEditForm question={null} order={this.state.nextQuestionNumber}/>
                    }
                </div>
            </div>
        );
    }
}
