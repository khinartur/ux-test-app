import * as React from 'react';
import {Route, Switch} from 'react-router-dom';
import Sign from './Sign';
import Admin from './Admin';
import StudentsList from './StudentsList';

import * as AppStyles from '../styles/App.scss';
import TestEditForm from './TestEditForm';
import StudentProfile from './StudentProfile';
import {IUser} from '../interfaces/IUser';
import Test from './Test';

interface State {
    loggedUser?: IUser;
}

export default class App extends React.Component<{}, State> {

    onSign = (user: IUser) => {
        this.setState({
            ...this.state,
            loggedUser: user,
        });
    };

    //TODO: what with routing? should user be able to route to any route?
    render() {
        return (
            <Switch>
                <Route exact path="/" render={() => <Sign onSign={this.onSign}/>} />
                <Route exact path="/profile" render={() => <StudentProfile user={this.state.loggedUser}/>} />
                {/*<Route exact path="/test" render={() => <Test user={this.state.loggedUser}/>} />*/}
                <Route exact path="/test" component={Test}/>
                <Route exact path="/admin" component={Admin}/>
                <Route exact path="/admin/students" component={StudentsList}/>
                <Route exact path="/admin/edit/test" component={TestEditForm}/>
            </Switch>
        );
    }
}

