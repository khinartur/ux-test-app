import * as React from 'react';
import {database, firebaseApp} from '../modules/firebase';
import Paper from '@material-ui/core/Paper';
import {withRouter} from 'react-router';
import Typography from '@material-ui/core/Typography';

interface IUser {
    github: string;
    name: string;
    surname: string;
    points: number;
    test_is_checked: boolean;
    test_passed: boolean;
}

interface State {
    user: IUser;
}

class StudentProfile extends React.Component<{}, State> {

    componentWillMount() {
        debugger;
        const userId = firebaseApp.auth().currentUser.uid;
        return database.ref('/users/' + userId).once('value').then(function(snapshot) {
            const username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
            // ...
        });
    }

    render() {
        return (
            <div className={'wrapper'}>
                <div className={'space-item-a'}></div>
                <div className={'space-item-c'}></div>
                <div className={'space-item-d'}></div>
                <div className={'space-item-e'}></div>
                <div className={'user-profile-panel'}>
                    <Paper>
                        <Typography variant="display1" gutterBottom>
                            Профиль студента
                        </Typography>
                        <Typography variant="display2" gutterBottom>
                            Имя: {this.state.user.name}
                        </Typography>
                        <Typography variant="display2" gutterBottom>
                            Фамилия: {this.state.user.surname}
                        </Typography>
                        <Typography variant="display2" gutterBottom>
                            Github: {this.state.user.github}
                        </Typography>
                        <br/>
                    </Paper>
                </div>
            </div>
        );
    }
}

export default withRouter(StudentProfile as any);
