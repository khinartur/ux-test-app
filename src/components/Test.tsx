import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {IUser} from '../interfaces/IUser';
import {AnyQuestion, IQuestion} from '../interfaces/IQuestion';
import {database} from '../modules/firebase';

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
}

class Test extends React.Component<Props & RouteComponentProps<{}>, State> {

    constructor(props) {
        super(props);

        Test.getTestQuestions().then(snapshot => {
            this.state = {
                test: {
                    questions: snapshot.val(),
                    currentPointsSum: 0,
                },
            };
        });
    }

    static getTestQuestions() {
        return database.ref('/question').once('value');
    }

    render() {
        const {user} = this.props;

        return (
            <div className={'wrapper'}>

            </div>
        );
    }
}

export default withRouter(Test);
