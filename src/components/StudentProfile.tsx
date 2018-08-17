import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {RouteComponentProps, withRouter} from 'react-router';
import Typography from '@material-ui/core/Typography';
import {IUser} from '../interfaces/IUser';
import Button from '@material-ui/core/Button';

import '../styles/StudentProfile.scss';
import {database} from '../modules/firebase';

interface Props {
    user: IUser;
}

interface State {
    loggedUser: IUser;
    loading: boolean;
}

class StudentProfile extends React.Component<Props & RouteComponentProps<{}>, State> {

    initTest = () => {
        this.props.history.push('/test');
    };

    constructor(props) {
        super(props);

        this.state = {
            loggedUser: this.props.user,
            loading: true,
        }
    }

    componentDidMount() {
        database.ref('/users/'+this.props.user.github).once('value').then((snapshot) => {
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
            !this.state.loading &&
            <div className={'profile-wrapper'}>
                <div className={'space-item-a'}></div>
                <div className={'space-item-c'}></div>
                <div className={'space-item-d'}></div>
                <div className={'space-item-e'}></div>
                <div className={'user-profile-panel'}>
                    <Paper className={'profile-paper'}>
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
                        {/*{*/}
                            {/*user.test_passed &&*/}
                            {/*<Typography variant="body2" gutterBottom>*/}
                                {/*Кол-во баллов: {user.github}*/}
                            {/*</Typography>*/}
                        {/*}*/}
                        {/*{*/}
                            {/*user.test_passed &&*/}
                            {/*<Typography variant="body2" gutterBottom>*/}
                                {/*Статус проверки: {user.test_is_checked ? 'проверен' : 'не проверен'}*/}
                            {/*</Typography>*/}
                        {/*}*/}
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
                                    <Button variant="contained"
                                            color="primary"
                                            className={'test-button'}
                                            onClick={this.initTest}>
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
