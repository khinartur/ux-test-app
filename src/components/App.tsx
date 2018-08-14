import * as React from 'react';
import {Route, Switch} from 'react-router-dom';
import Sign from './Sign';
import Admin from './Admin';
import StudentsList from './StudentsList';

import '../styles/App.scss';
import TestEditForm from './TestEditForm';

export default class App extends React.Component {

    render() {
        return (
            <Switch>
                <Route exact path="/" component={Sign}/>
                <Route exact path="/admin" component={Admin}/>
                <Route exact path="/admin/students" component={StudentsList}/>
                <Route exact path="/admin/edit/test" component={TestEditForm}/>
            </Switch>
        );
    }
}

