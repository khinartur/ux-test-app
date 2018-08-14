import * as React from 'react';
import {withRouter} from 'react-router';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import '../styles/Admin.scss';

interface Props {
    history: any;
}

//TODO: remove br-div
class Admin extends React.Component<Props> {

    goToTestEdit = () => {
        this.props.history.push('/admin/edit/test');
    };

    goToStudentsResults = () => {
        this.props.history.push('/admin/students');
    };


    render() {
        return (
            <div className={'wrapper'}>
                <div className={'space-item-a'}></div>
                <div className={'space-item-c'}></div>
                <div className={'space-item-d'}></div>
                <div className={'space-item-e'}></div>
                <div className={'admin-form'}>
                    <Typography variant="headline" gutterBottom>
                        Администратор
                    </Typography>
                    <Button variant="contained" color="primary" fullWidth={true} onClick={this.goToTestEdit}>
                        Редактировать тест
                    </Button>
                    <div className={'br-div'}></div>
                    <Button variant="contained" color="primary" fullWidth={true} onClick={this.goToStudentsResults}>
                        Результаты студентов
                    </Button>
                </div>
            </div>
        );
    }
}

export default withRouter(Admin as any);
