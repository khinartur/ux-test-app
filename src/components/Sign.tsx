import * as React from 'react';
import GithubCircle from 'mdi-material-ui/GithubCircle';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {withRouter} from 'react-router-dom';

import * as AppStyles from '../styles/App.scss';
import * as SignStyles from '../styles/Sign.scss';
import {auth, database, provider} from '../modules/firebase';
import Paper from '@material-ui/core/Paper';
import * as H from 'history';
import {IUser} from '../interfaces/IUser';

interface RouterProps {
    history: H.History;
}

interface Props {
    onSign: (l: string) => void;
}

interface State {
    error?: string;
}

class Sign extends React.Component<Props & RouterProps, State> {

    constructor(props) {
        super(props);

        const login = localStorage.getItem('loggedUser');
        if (login) {
            props.history.push('/profile');
        }

        this.state = {
            error: '',
        };
    }

    //TODO: admin list
    isAdmin = (login: string) => {
        return database.ref(`/admins/${login}`).once('value').then(function(snapshot) {
            return snapshot.val();
        });
    };

    isAllowedUser = (login: string) => {
        return database.ref(`/users/${login}`).once('value').then(function(snapshot) {
            return snapshot.val();
        });
    };

    githubSignIn = () => {
        const {history, onSign} = this.props;

        let login;
        auth.signInWithPopup(provider).then((result) => {
            login = result.additionalUserInfo.username;
            return this.isAdmin(login);
        })
            .then((isAdmin) => {
                if (isAdmin) history.push('/admin');
                return this.isAllowedUser(login);
            })
            .then((allowedUser) => {
                if (allowedUser) {
                    onSign(login);
                    history.push('/profile');
                } else {
                    this.setState({
                        ...this.state,
                        error: 'Вас не удается найти в базе студентов',
                    });
                }
            });
    };

    render() {
        const {error} = this.state;

        return (
            <div className={SignStyles.signWrapper}>
                <div className={SignStyles.spaceItemA}></div>
                <div className={SignStyles.spaceItemC}></div>
                <div className={SignStyles.spaceItemD}></div>
                <div className={SignStyles.spaceItemE}></div>
                <div className={SignStyles.signForm}>
                    <Paper className={AppStyles.error}>{error}</Paper>
                    <Typography variant="headline" gutterBottom align={'center'}>
                        Технопарк. Тестирование по курсу UX
                    </Typography>
                    <Button variant="contained"
                            className={SignStyles.githubButton}
                            color="primary"
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
