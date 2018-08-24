import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {RouteComponentProps, withRouter} from 'react-router';
import Typography from '@material-ui/core/Typography';
import {EUserTestStatus, IUser} from '../interfaces/IUser';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

import * as AppStyles from '../styles/App.scss';
import * as StudentProfileStyles from '../styles/StudentProfile.scss';
import {auth, database} from '../modules/firebase';

interface Props {}

interface State {
    loggedUser?: IUser;
    loading: boolean;
}

class StudentProfile extends React.Component<Props & RouteComponentProps<{}>, State> {

    initTest = () => {
        this.props.history.push('/test');
    };
    private userLogin: string;

    constructor(props) {
        super(props);

        if (auth.currentUser) {
            const login = localStorage.getItem('loggedUser');
            this.userLogin = login;
        } else {
            localStorage.setItem('loggedUser', null);
            this.props.history.push('/');
        }

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        database.ref('/users/' + this.userLogin).once('value').then((snapshot) => {
            const user = snapshot.val();
            this.setState({
                loading: false,
                loggedUser: user,
            });
        });
    }

    render() {
        const user = this.state.loggedUser;

        return (
            <React.Fragment>
                {this.state.loading &&
                    <div className={AppStyles.progress}>
                        <LinearProgress/>
                    </div>
                }
                {!this.state.loading &&
                <div className={StudentProfileStyles.profileWrapper}>
                    <div className={StudentProfileStyles.spaceItemA}></div>
                    <div className={StudentProfileStyles.spaceItemC}></div>
                    <div className={StudentProfileStyles.spaceItemD}></div>
                    <div className={StudentProfileStyles.spaceItemE}></div>
                    <div className={StudentProfileStyles.userProfilePanel}>
                        <Paper className={StudentProfileStyles.profilePaper}>
                            <Typography variant="title" gutterBottom align={'center'}>
                                Профиль студента
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Имя: {user.name}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Фамилия: {user.surname}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Github: {user.github}
                            </Typography>
                            {user.test_status == EUserTestStatus.passed ?
                                (
                                    <Typography variant="body2" gutterBottom>
                                        Вы прошли тест. Следите за новостями на портале.
                                    </Typography>
                                )
                                :
                                (
                                    <Button variant="contained"
                                            color="primary"
                                            className={StudentProfileStyles.testButton}
                                            onClick={this.initTest}>
                                        Начать тест
                                    </Button>
                                )
                            }
                            <br/>
                        </Paper>
                    </div>
                </div>
                }
            </React.Fragment>
        );
    }
}

export default withRouter(StudentProfile);
