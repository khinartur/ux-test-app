import * as React from 'react';
import {Route, Switch} from 'react-router-dom';
import Sign from './Sign';
import Admin from './Admin';
import StudentsList from './StudentsList';

import '../styles/App.scss';

export default class App extends React.Component {

    render() {
        return (
            <div>
                <Switch>
                    <Route exact path="/" component={Sign}/>
                    <Route exact path="/admin" component={Admin}/>
                    <Route path="/admin/students" component={StudentsList}/>
                </Switch>
            </div>
        );
    }
}

