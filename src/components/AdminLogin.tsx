import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {getAdminsList} from '../api/api-database';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {IError} from '../interfaces/IError';
import * as AppStyles from '../styles/App.scss';
import * as base64 from 'base-64';
import {EAuth} from './App';
import {Redirect, RouteComponentProps} from 'react-router';
import {withRouter} from 'react-router-dom';
import Admin from './Admin';

interface Admin {
    login: string;
    password: string;
}

interface State extends Partial<IError> {
    adminsList?: {[login: string]: Admin};
    login?: string;
    password?: string;
    redirectToReferrer: boolean;
}

interface Props {
    auth: EAuth;
    onSign: (auth: EAuth, login: string) => void;
}

class AdminLogin extends React.Component<Props & RouteComponentProps<{}>, State> {

    handleChange = prop => event => {
        this.setState({
            ...this.state,
            [prop]: event.target.value,
        });
    };

    onSubmit = (evt) => {
        const {onSign} = this.props;
        const {adminsList, login, password} = this.state;
        debugger;
        evt.preventDefault();

        const admins = Object.entries(adminsList).map(o => o[1]).filter((o: Admin) => o.login === login);

        if (!admins || !admins.length) {
            this.setState({
                ...this.state,
                error: 'Неправильный логин или пароль',
            });
        } else {
            const a = admins[0];
            debugger;
            if (a.password === base64.encode(password)) {
                onSign(EAuth.admin, a.login);

                this.setState({
                    ...this.state,
                    redirectToReferrer: true,
                });
            } else {
                this.setState({
                    ...this.state,
                    error: 'Неправильный логин или пароль',
                });
            }
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            redirectToReferrer: props.auth === EAuth.admin || props.auth === EAuth.student,
        };

        getAdminsList()
            .then((snapshot) => {
                console.dir(snapshot.val());
                this.setState({
                    ...this.state,
                    adminsList: snapshot.val(),
                });
            });
    }

    componentDidUpdate(prevProps) {
        const {auth} = this.props;

        if (auth !== EAuth.none) {
            this.setState({
                ...this.state,
                redirectToReferrer: true,
            });
        }
    }

    render() {
        const { auth } = this.props;
        const { error, redirectToReferrer } = this.state;

        if (redirectToReferrer) {
            return <Redirect to={{pathname: auth === EAuth.admin ? '/admin' : '/profile'}} />
        }

        return (
            <React.Fragment>
                <Paper className={AppStyles.error}>{error}</Paper>
                <Paper>
                    <form onSubmit={(evt) => this.onSubmit(evt)}>
                        <TextField
                            onChange={this.handleChange('login')}
                            autoFocus
                            margin='dense'
                            label='Логин'
                            fullWidth
                            required={true}
                        />
                        <TextField
                            onChange={this.handleChange('password')}
                            margin='dense'
                            type='password'
                            name='password'
                            label='Пароль'
                            fullWidth
                            required={true}
                        />
                        <Button variant="contained"
                                type='submit'
                                color="primary">
                            Войти
                        </Button>
                    </form>
                </Paper>
            </React.Fragment>
        );
    }
}

export default withRouter(AdminLogin);
