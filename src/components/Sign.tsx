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
    onSign: (user: IUser) => void;
}

interface State {
    error?: string;
}

class Sign extends React.Component<Props & RouterProps, State> {

    constructor(props) {
        super(props);

        this.state = {
            error: '',
        };
    }

    isAdmin = (login: string) => {
        return database.ref('/admins').once('value').then(function(snapshot) {
            const admins = snapshot.val();
            return admins && admins[login];
        });
    };

    isAllowedUser = (login: string) => {
        return database.ref('/users').once('value').then(function(snapshot) {
            const users = snapshot.val();
            return users[login];
        });
    };

    githubSignIn = () => {
        auth.signInWithPopup(provider).then(function (result) {
            console.dir(result);
            const login = result.additionalUserInfo.username;
            this.isAdmin(login).then(isAdmin => {
                if (isAdmin) this.props.history.push('/admin');
                return this.isAllowedUser(login);
            }).then(allowedUser => {
                if (allowedUser) {
                    this.props.onSign(login);
                    this.props.history.push('/profile');
                } else {
                    this.setState({
                        ...this.state,
                        error: 'Вас не удается найти в базе студентов',
                    });
                }
            });
        }.bind(this));
    };

    render() {
        return (
            <div className={SignStyles.signWrapper}>
                <div className={SignStyles.spaceItemA}></div>
                <div className={SignStyles.spaceItemC}></div>
                <div className={SignStyles.spaceItemD}></div>
                <div className={SignStyles.spaceItemE}></div>
                <div className={SignStyles.signForm}>
                    <Paper className={AppStyles.error}>{this.state.error}</Paper>
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
