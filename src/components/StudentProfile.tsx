import * as React from 'react';
import {database, firebaseApp} from '../modules/firebase';
import Paper from '@material-ui/core/Paper';
import {withRouter} from 'react-router';
import Typography from '@material-ui/core/Typography';
import {IUser} from '../interfaces/IUser';


interface Props {
    user: IUser;
}

class StudentProfile extends React.Component<Props> {

    componentWillMount() {
        debugger;
        console.dir(firebaseApp.auth().currentUser);
        const userId = firebaseApp.auth().currentUser.uid;
        return database.ref('/users/' + userId).once('value').then(function(snapshot) {
            const username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
            // ...
        });
    }

    render() {
        const {user} = this.props;

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
                            Имя: {user.name}
                        </Typography>
                        <Typography variant="display2" gutterBottom>
                            Фамилия: {user.surname}
                        </Typography>
                        <Typography variant="display2" gutterBottom>
                            Github: {user.github}
                        </Typography>
                        <br/>
                    </Paper>
                </div>
            </div>
        );
    }
}

export default withRouter(StudentProfile as any);
