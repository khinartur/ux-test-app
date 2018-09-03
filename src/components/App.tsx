import * as React from 'react';
import {Route, Switch} from 'react-router-dom';
import Sign from './Sign';
import Admin from './Admin';
import StudentsList from './StudentsList';
import TestEditForm from './TestEditForm';
import StudentProfile from './StudentProfile';
import Test from './Test';
import {auth, firebaseApp} from '../modules/firebase';
import {Redirect, RouteComponentProps, withRouter} from 'react-router';
import AdminLogin from './AdminLogin';
import Button from '@material-ui/core/Button';
import * as AppStyles from '../styles/App.scss';

interface AuthButtonProps {
    onSignOut: any;
}

type T = AuthButtonProps & RouteComponentProps<{}>;

const AuthButton: React.ComponentClass<AuthButtonProps> = withRouter<T>((props: T) => {
    return (
        auth.currentUser ? (
            <div className={AppStyles.signOutButton}>
                <Button variant='contained'
                        color='primary'
                        fullWidth={false}
                        onClick={(evt) => props.onSignOut(evt)}>
                    Выйти
                </Button>
            </div>
        ) : (<p></p>)
    );
});

const ProtectedRoute = ({component: Component, ...rest}) => (
    <Route {...rest} render={(props) => (
        auth.currentUser ?
            auth.currentUser.providerData[0].providerId === 'github.com' ?
                <Component {...props} />
                :
                <Redirect to={{
                    pathname: '/admin',
                }}/>
            :
            <Redirect to={{
                pathname: '/login',
                state: {from: props.location}
            }}/>
    )}/>
);

const PrivateRoute = ({component: Component, ...rest}) => (
    <Route {...rest} render={(props) => (
        auth.currentUser ?
            auth.currentUser.providerData[0].providerId === 'password' ?
                <Component {...props} />
                :
                <Redirect to={{
                    pathname: '/profile',
                }}/>
            :
            <Redirect to={{
                pathname: '/admin/login',
                state: {from: props.location}
            }}/>
    )}/>
);

interface AppState {
    loading: boolean;
}

export default class App extends React.Component<{}, AppState> {

    onSignOut = () => {
        this.setState({
            ...this.state,
            loading: true,
        });

        auth.signOut().then(() => {
            localStorage.removeItem('user');

            this.setState({
                ...this.state,
                loading: false,
            });
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
        };
    }

    render() {
        const {loading} = this.state;

        return (
            !loading &&
            <React.Fragment>
                <Switch>
                    <Route exact path="/" render={() => <Redirect to={{pathname: '/login'}}/>}/>
                    <Route path="/login" component={Sign}/>
                    <ProtectedRoute exact path="/profile" component={StudentProfile}/>
                    <ProtectedRoute exact path="/test" component={Test}/>
                    <ProtectedRoute exact path="/test/:key" component={Test}/>
                    <Route exact path="/admin/login" component={AdminLogin}/>
                    <PrivateRoute exact path="/admin" component={Admin}/>
                    <PrivateRoute exact path="/admin/students" component={StudentsList}/>
                    <PrivateRoute exact path="/admin/edit/test" component={TestEditForm}/>
                </Switch>
                <AuthButton onSignOut={this.onSignOut}/>
            </React.Fragment>
        );
    }
}
