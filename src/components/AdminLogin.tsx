import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {IError} from '../interfaces/IError';
import * as AppStyles from '../styles/App.scss';
import {Redirect, RouteComponentProps, withRouter} from 'react-router';
import * as AdminLoginStyles from '../styles/AdminLogin.scss';
import {auth} from '../modules/firebase';

interface State extends Partial<IError> {
    email?: string;
    password?: string;
}

class AdminLogin extends React.Component<{} & RouteComponentProps<{}>, State> {

    handleChange = prop => event => {
        this.setState({
            ...this.state,
            [prop]: event.target.value,
        });
    };

    onSubmit = (evt) => {
        const {email, password} = this.state;
        debugger;
        evt.preventDefault();

        auth.signInWithEmailAndPassword(email, password)
            .catch((error) => {
                this.setState({
                    ...this.state,
                    error: 'Неправильный логин или пароль',
                });
            });
    };


    render() {
        const {error} = this.state;

        if (auth.currentUser) {
            return <Redirect to={{pathname: auth.currentUser.providerData[0].providerId === 'github.com' ? '/admin' : '/profile'}}/>;
        }

        return (
            <React.Fragment>
                <div className={AdminLoginStyles.adminLoginWrapper}>
                    <div className={AdminLoginStyles.adminLoginForm}>
                        <Paper className={AppStyles.error}>{error}</Paper>
                        <Paper className={AdminLoginStyles.adminLoginPaper}>
                            <form onSubmit={(evt) => this.onSubmit(evt)}>
                                <TextField
                                    onChange={this.handleChange('email')}
                                    autoFocus
                                    margin='dense'
                                    label='Email'
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
                                        color="primary"
                                        style={{
                                            marginTop: '20px'
                                        }}>
                                    Войти
                                </Button>
                            </form>
                        </Paper>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(AdminLogin);
