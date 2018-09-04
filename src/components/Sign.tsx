import * as React from 'react';
import GithubCircle from 'mdi-material-ui/GithubCircle';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {withRouter} from 'react-router-dom';

import * as AppStyles from '../styles/App.scss';
import * as SignStyles from '../styles/Sign.scss';
import {auth, provider} from '../modules/firebase';
import Paper from '@material-ui/core/Paper';
import {IUser} from '../interfaces/IUser';
import {Redirect, RouteComponentProps} from 'react-router';
import {IError} from '../interfaces/IError';
import {getUsersList} from '../api/api-database';

interface State extends Partial<IError> {
    usersList: { [login: string]: IUser };
}

class Sign extends React.Component<{} & RouteComponentProps<{}>, State> {

    githubSignIn = () => {
        const {history} = this.props;
        const {usersList} = this.state;

        let login;
        auth.signInWithPopup(provider).then((result) => {
            login = result.additionalUserInfo.username;

            const users = Object.entries(usersList).map(o => o[1]).filter((u: IUser) => u.github === login);

            if (!users || !users.length) {
                auth.signOut()
                    .then(() => {
                        this.setState({
                            ...this.state,
                            error: 'Вы не найдены в базе студентов',
                        });
                    });
            } else {
                localStorage.setItem('user', JSON.stringify(users[0]));
                history.push('/profile');
            }
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            usersList: {},
        };

        getUsersList()
            .then((snapshot) => {
                this.state = {
                    ...this.state,
                    usersList: snapshot.val(),
                };
            });
    }


    render() {
        const {error} = this.state;

        // debugger;
        // if (auth.currentUser) {
        //     return <Redirect to={{pathname: auth.currentUser.providerData[0].providerId === 'github.com' ? '/admin' : '/profile'}}/>;
        // }

        if (auth.currentUser) {
            return <Redirect to={{pathname: '/profile'}}/>;
        }

        return (
            <div className={SignStyles.signWrapper}>
                <div className={SignStyles.signForm}>
                    <Paper className={AppStyles.error}>{error}</Paper>
                    <Typography variant="title" gutterBottom align={'center'}>
                        Технопарк. Тестирование по курсу UX
                    </Typography>
                    <Button variant="contained"
                            className={SignStyles.githubButton}
                            color="primary"
                            style={{
                                marginTop: '20px'
                            }}
                            onClick={this.githubSignIn}
                    >
                        Войти с помощью GitHub&nbsp;&nbsp;&nbsp;
                        <GithubCircle/>
                    </Button>
                </div>
            </div>
        );
    }
}

export default withRouter(Sign);
