import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {IUser} from '../interfaces/IUser';
import {AnyQuestion, IChooseRightData, IPassedQuestion, IQuestion, QuestionType} from '../interfaces/IQuestion';
import {database} from '../modules/firebase';
import ChooseRightQuestion from './ChooseRightQuestion';

interface ITest {
    questions: {[key: number]: IQuestion<AnyQuestion>};
    passedQuestions?: IQuestion<AnyQuestion>[];
    skippedQuestions?: IQuestion<AnyQuestion>[];
    currentPointsSum: number;
}

interface Props {
    user: IUser;
}

interface State {
    test: ITest;
    currentQuestion: IQuestion<AnyQuestion>;
}

class Test extends React.Component<Props & RouteComponentProps<{}>, State> {

    onQuestionPass = (passedQuestion: IPassedQuestion) => {
        const currQ = this.state.currentQuestion;
        const user = this.props.user;

        database.ref('passed-questions/'+currQ.order).set({

        }).then(() => {

        });
    };

    constructor(props) {
        super(props);

        Test.getTestQuestions().then(snapshot => {
            const dbQuestions = snapshot.val();
            this.state = {
                test: {
                    questions: dbQuestions,
                    currentPointsSum: 0,
                },
                currentQuestion: dbQuestions[1],
            };
        });
    }

    static getTestQuestions() {
        return database.ref('/question').once('value');
    }

    render() {
        const {user} = this.props;
        const currentQuestion = this.state.currentQuestion;

        return (
            <div className={'wrapper'}>
                {currentQuestion.type === QuestionType.choose_right &&
                    <ChooseRightQuestion question={currentQuestion as IQuestion<IChooseRightData>}
                                         mode={'pass'}
                                         onPass={this.onQuestionPass}/>}
                {/*{currentQuestion.type === QuestionType.match_columns &&*/}
                    {/*<ChooseRightQuestion question={currentQuestion as IQuestion<IChooseRightData>} order={} onSuccess={} mode={}/>}*/}
                {/*{currentQuestion.type === QuestionType.open_question &&*/}
                    {/*<ChooseRightQuestion question={currentQuestion as IQuestion<IChooseRightData>} order={} onSuccess={} mode={}/>}*/}
                    {/**/}
            </div>
        );
    }
}

export default withRouter(Test);
