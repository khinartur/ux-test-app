import * as React from 'react';
import {Route, Switch} from 'react-router-dom';
import Sign from './Sign';
import Admin from './Admin';
import StudentsList from './StudentsList';

import '../styles/App.scss';
import TestEditForm from './TestEditForm';
import StudentProfile from './StudentProfile';
import {IUser} from '../interfaces/IUser';

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

    render() {
        return (
            <Switch>
                <Route exact path="/" render={() => <Sign onSign={this.onSign}/>} />
                <Route exact path="/admin" component={Admin}/>
                <Route exact path="/admin/students" component={StudentsList}/>
                <Route exact path="/admin/edit/test" component={TestEditForm}/>
                <Route exact path="/profile" component={StudentProfile}/>
            </Switch>
        );
    }
}

