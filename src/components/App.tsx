import * as React from 'react';
import {Route, Switch} from 'react-router-dom';
import Sign from './Sign';
import Admin from './Admin';
import StudentsList from './StudentsList';

import TestEditForm from './TestEditForm';
import StudentProfile from './StudentProfile';
import Test from './Test';
import {auth} from '../modules/firebase';

export default class App extends React.Component<{}, {}> {

    onSign = (login: string) => {
        localStorage.setItem('loggedUser', login);
    };

    constructor(props) {
        super(props);

        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('[LOGGED USER]');
                console.dir(user);
            } else {
                props.history.push('/');
            }
        });

    }

    //TODO: what with routing? should user be able to route to any route?
    render() {
        return (
            <Switch>
                <Route exact path="/" render={() => <Sign onSign={this.onSign}/>} />
                <Route exact path="/profile" component={StudentProfile}/>
                <Route exact path="/test" component={Test}/>
                <Route exact path="/admin" component={Admin}/>
                <Route exact path="/admin/students" component={StudentsList}/>
                <Route exact path="/admin/edit/test" component={TestEditForm}/>
            </Switch>
        );
    }
}

