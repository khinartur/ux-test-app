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
import {EAuth} from './App';
import {IError} from '../interfaces/IError';
import {getUsersList} from '../api/api-database';

interface Props {
    auth: EAuth;
    onSign: (auth: EAuth, login: string) => void;
}

interface State extends Partial<IError> {
    usersList: { [login: string]: IUser };
    redirectToReferrer: boolean;
}

class Sign extends React.Component<Props & RouteComponentProps<{}>, State> {

    githubSignIn = () => {
        const {onSign} = this.props;
        const {usersList} = this.state;

        let login;
        auth.signInWithPopup(provider).then((result) => {
            login = result.additionalUserInfo.username;

            const users = Object.entries(usersList).map(o => o[0]).filter((s: string) => s === login);

            if (!users && !users.length) {
                this.setState({
                    ...this.state,
                    error: 'Вы не найдены в базе студентов',
                });
            } else {
                const login = users[0];

                onSign(EAuth.student, login);

                this.setState({
                    ...this.state,
                    redirectToReferrer: true,
                });
            }
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            usersList: {},
            redirectToReferrer: props.auth === EAuth.student || props.auth === EAuth.admin,
        };

        getUsersList()
            .then((snapshot) => {
                this.state = {
                    ...this.state,
                    usersList: snapshot.val(),
                };
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
        const {error, redirectToReferrer} = this.state;

        debugger;
        if (redirectToReferrer) {
            return <Redirect to={{pathname: auth === EAuth.student ? '/profile' : '/admin'}}/>;
        }

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
