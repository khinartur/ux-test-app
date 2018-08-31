import * as React from 'react';
import {Route, Switch} from 'react-router-dom';
import Sign from './Sign';
import Admin from './Admin';
import StudentsList from './StudentsList';
import TestEditForm from './TestEditForm';
import StudentProfile from './StudentProfile';
import Test from './Test';
import {auth} from '../modules/firebase';
import {Redirect, RouteComponentProps, withRouter} from 'react-router';
import AdminLogin from './AdminLogin';
import Button from '@material-ui/core/Button';
import * as AppStyles from '../styles/App.scss';

interface AuthButtonProps {
    auth: EAuth;
    onSignOut: any;
}

type T = AuthButtonProps & RouteComponentProps<{}>;

const AuthButton: React.ComponentClass<AuthButtonProps> = withRouter<T>((props: T) => {
    return (
        props.auth === EAuth.admin || props.auth === EAuth.student ? (
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


const ProtectedRoute = ({auth, component: Component, ...rest}) => (
    <Route {...rest} render={(props) => (
        auth === EAuth.student
            ? <Component {...props} />
            : <Redirect to={{
                pathname: '/login',
                state: {from: props.location}
            }}/>
    )}/>
);

const PrivateRoute = ({auth, component: Component, ...rest}) => (
    <Route {...rest} render={(props) => (
        auth === EAuth.admin
            ? <Component {...props} />
            : <Redirect to={{
                pathname: '/admin/login',
                state: {from: props.location}
            }}/>
    )}/>
);

export enum EAuth {
    none = 'none',
    student = 'student',
    admin = 'admin',
}

interface AppState {
    auth: EAuth;
    loading: boolean;
}

export default class App extends React.Component<{}, AppState> {

    onSign = (auth: EAuth, login: string) => {
        if (auth === EAuth.admin) {
            sessionStorage.setItem('loggedAdmin', login);
        }

        this.setState({
            ...this.state,
            auth,
        });
    };

    onSignOut = () => {
        const {auth: a} = this.state;

        if (a === EAuth.admin) {
            sessionStorage.removeItem('loggedAdmin');
        }

        auth.signOut().then(() => {
            this.setState({
                ...this.state,
                auth: EAuth.none,
            });
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            auth: EAuth.none,
            loading: true,
        };

        auth.onAuthStateChanged((user) => {
            if (user) {
                this.setState({
                    ...this.state,
                    auth: EAuth.student,
                    loading: false,
                });
            } else {
                this.setState({
                    ...this.state,
                    auth: EAuth.none,
                    loading: false,
                });
            }
        });
    }

    //TODO: remove
    componentWillMount() {
        const {auth} = this.state;
        debugger;

        if (auth === EAuth.none && sessionStorage.getItem('loggedAdmin')) {
            this.setState({
                ...this.state,
                auth: EAuth.admin,
            });
        }
    }

    render() {
        const {auth, loading} = this.state;
        debugger;
        return (
            !loading &&
            <React.Fragment>
                <AuthButton auth={auth} onSignOut={this.onSignOut}/>
                <Switch>
                    <Route exact path="/" render={() => <Redirect to={{pathname: '/login'}}/>}/>
                    <Route path="/login" render={() => <Sign auth={auth} onSign={this.onSign}/>}/>
                    <ProtectedRoute auth={auth} exact path="/profile" component={StudentProfile}/>
                    <ProtectedRoute auth={auth} exact path="/test" component={Test}/>
                    <ProtectedRoute auth={auth} exact path="/test/:key" component={Test}/>
                    <Route exact path="/admin/login" render={() => <AdminLogin auth={auth} onSign={this.onSign}/>}/>
                    <PrivateRoute auth={auth} exact path="/admin" component={Admin}/>
                    <PrivateRoute auth={auth} exact path="/admin/students" component={StudentsList}/>
                    <PrivateRoute auth={auth} exact path="/admin/edit/test" component={TestEditForm}/>
                </Switch>
            </React.Fragment>
        );
    }
}
