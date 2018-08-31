import * as React from 'react';
import {Route, Switch} from 'react-router-dom';
import Sign from './Sign';
import Admin from './Admin';
import StudentsList from './StudentsList';

import TestEditForm from './TestEditForm';
import StudentProfile from './StudentProfile';
import Test from './Test';
import {auth} from '../modules/firebase';
import {RouteComponentProps, withRouter} from 'react-router';

interface AuthButtonProps {
    isAuthenticated?: boolean;
}

type T = AuthButtonProps & RouteComponentProps<{}>;

const AuthButton: React.ComponentClass<AuthButtonProps> = withRouter<T>((props: T) => {
    return (
        props.isAuthenticated ? (
            <p>
                Welcome! <button onClick={() => props.history.push('/')}>Sign out</button>
            </p>
        ) : (
            <p>You are not logged in.</p>
        )
    );
});

export default class App extends React.Component<{}, {}> {

    onSign= () => {

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

    render() {
        return (
            <Switch>
                {/*<AuthButton isAuthenticated={}/>*/}
                <Route exact path="/" render={() => <Sign onSign={this.onSign}/>}/>
                <Route exact path="/profile" component={StudentProfile}/>
                <Route exact path="/test" component={Test}/>
                <Route exact path="/test/:key" component={Test}/>
                <Route exact path="/admin" component={Admin}/>
                <Route exact path="/admin/students" component={StudentsList}/>
                <Route exact path="/admin/edit/test" component={TestEditForm}/>
            </Switch>
        );
    }
}
