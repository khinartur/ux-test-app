import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {database} from '../modules/firebase';
import Button from '@material-ui/core/Button';
import {IQuestion} from './Question';


interface State {
    questions: IQuestion[];
}

export default class TestEditForm extends React.Component<{}, State> {
    constructor(props) {
        super(props);

        this.state = {
            questions: [],
        };
    }

    updateQuestionsList = (questions) => {
        this.setState({
            ...this.state,
            questions: questions,
        });
    };

    showAddForm = () => {

    };

    componentDidMount() {
        const questionsRef = database.ref('question/');
        questionsRef.on('value', function(snapshot) {
            this.updateQuestionsList(snapshot.val());
        }.bind(this));
    }

    render() {
        return (
            <div>
                {
                    this.state.questions.length ?
                    this.state.questions.map(question => {
                        return <div><span>{question.order + ') '}</span>{question.question}</div>
                    })
                        :
                        <div>В тесте нет вопросов.</div>
                }
                <br/>
                <Button onClick={this.showAddForm}>Добавить вопрос</Button>
            </div>
        );
    }
}
