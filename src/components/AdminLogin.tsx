import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {IError} from '../interfaces/IError';
import * as AppStyles from '../styles/App.scss';
import {Redirect, RouteComponentProps, withRouter} from 'react-router';
import * as AdminLoginStyles from '../styles/AdminLogin.scss';
import {auth} from '../modules/firebase';
import LinearProgress from '@material-ui/core/LinearProgress/LinearProgress';

interface State extends Partial<IError> {
    email?: string;
    password?: string;
    loading: boolean;
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

        this.setState({
            ...this.state,
            loading: true,
        });

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({
                    ...this.state,
                    loading: false,
                });
            })
            .catch(() => {
                this.setState({
                    ...this.state,
                    error: 'Неправильный логин или пароль',
                });
            });
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }

    componentDidMount() {
        const {history} = this.props;

        auth.onAuthStateChanged(function(user) {
            if (user) {
                history.push('/admin');
            }
        });
    }

    render() {
        const {error, loading} = this.state;

        // if (auth.currentUser) {
        //     return <Redirect to={{pathname: auth.currentUser.providerData[0].providerId === 'github.com' ? '/admin' : '/profile'}}/>;
        // }

        if (auth.currentUser) {
            return <Redirect to={{pathname: '/admin'}}/>;
        }

        return (
            <React.Fragment>
                {loading &&
                <div className={AppStyles.progress}>
                    <LinearProgress/>
                </div>
                }
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
