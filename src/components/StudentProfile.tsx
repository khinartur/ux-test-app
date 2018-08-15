import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {RouteComponentProps, withRouter} from 'react-router';
import Typography from '@material-ui/core/Typography';
import {IUser} from '../interfaces/IUser';
import Button from '@material-ui/core/Button';

interface Props {
    user: IUser;
}

class StudentProfile extends React.Component<Props & RouteComponentProps<{}>, {}> {

    initTest = () => {
        this.props.history.push('/test');
    };

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
                        <Typography variant="body2" gutterBottom>
                            Имя: {user.name}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            Фамилия: {user.surname}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            Github: {user.github}
                        </Typography>
                        {
                            user.test_passed ?
                                (
                                    <Typography variant="body2" gutterBottom>
                                        Вы уже прошли тест. Ваш результат: {user.points}
                                        (Задание на листочках {user.test_is_checked ? "проверены" : "не проверены"})
                                    </Typography>
                                )
                                :
                                (
                                    <Button variant="contained" color="primary" onClick={this.initTest}>
                                        Начать тест
                                    </Button>
                                )
                        }
                        <br/>
                    </Paper>
                </div>
            </div>
        );
    }
}

export default withRouter(StudentProfile);
