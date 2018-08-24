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
    user?: IUser;
    loading: boolean;
}

class StudentProfile extends React.Component<Props & RouteComponentProps<{}>, State> {

    initTest = () => {
        this.props.history.push('/test');
    };

    constructor(props) {
        super(props);

        const login = localStorage.getItem('loggedUser');
        if (login) {
            database.ref('/users/' + login).once('value').then((snapshot) => {
                const user = snapshot.val();
                this.setState({
                    loading: false,
                    user: user,
                });
            });
        } else {
            this.props.history.push('/');
        }

        this.state = {
            loading: true,
        };
    }

    render() {
        const {loading, user} = this.state;

        return (
            <React.Fragment>
                {loading &&
                    <div className={AppStyles.progress}>
                        <LinearProgress/>
                    </div>
                }
                {!loading &&
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
