import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import * as AdminStyles from '../styles/Admin.scss';
import {auth, database} from '../modules/firebase';

class Admin extends React.Component<{} & RouteComponentProps<{}>> {

    goToTestEdit = () => {
        const {history} = this.props;

        history.push('/admin/edit/test');
    };

    goToStudentsResults = () => {
        const {history} = this.props;

        history.push('/admin/students');
    };

    render() {

        return (
            <div className={AdminStyles.adminWrapper}>
                <div className={AdminStyles.adminForm}>
                    <Typography variant="headline" gutterBottom align={'center'}>
                        Администратор
                    </Typography>
                    <Button variant="contained"
                            color="primary"
                            fullWidth={true}
                            style={{
                                marginTop: '20px'
                            }}
                            onClick={this.goToTestEdit}>
                        Редактировать тест
                    </Button>
                    <Button variant="contained"
                            color="primary"
                            fullWidth={true}
                            style={{
                                marginTop: '20px'
                            }}
                            onClick={this.goToStudentsResults}>
                        Результаты студентов
                    </Button>
                </div>
            </div>
        );
    }
}

export default withRouter(Admin as any);
