import * as React from 'react';
import {withRouter} from 'react-router';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import * as AdminStyles from '../styles/Admin.scss';
import {database} from '../modules/firebase';

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

    constructor(props) {
        super(props);

        const login = localStorage.getItem('loggedUser');
        if (!login) {
            this.props.history.push('/');
        }

        this.state = {
            loading: true,
        };
    }

    render() {
        return (
            <div className={AdminStyles.adminWrapper}>
                <div className={AdminStyles.spaceItemA}></div>
                <div className={AdminStyles.spaceItemC}></div>
                <div className={AdminStyles.spaceItemD}></div>
                <div className={AdminStyles.spaceItemE}></div>
                <div className={AdminStyles.adminForm}>
                    <Typography variant="headline" gutterBottom align={'center'}>
                        Администратор
                    </Typography>
                    <Button variant="contained" color="primary" fullWidth={true} onClick={this.goToTestEdit}>
                        Редактировать тест
                    </Button>
                    <div className={AdminStyles.brDiv}></div>
                    <Button variant="contained" color="primary" fullWidth={true} onClick={this.goToStudentsResults}>
                        Результаты студентов
                    </Button>
                </div>
            </div>
        );
    }
}

export default withRouter(Admin as any);
