import * as React from 'react';
import {GithubCircle} from 'mdi-material-ui';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {withRouter} from 'react-router-dom';

import '../styles/Sign.scss';

interface Props {
    //TODO: find out type
    history: any;
}

class Sign extends React.Component<Props> {

    githubSignIn = () => {
        this.props.history.push('/admin');

        // const provider = new firebase.auth.GithubAuthProvider();
        // firebase.auth().signInWithPopup(provider).then(function (result) {
        //     console.log("Result:");
        //     console.dir(result);
        // });
    };

    render() {
        return (
            <div className={'wrapper'}>
                <div className={'space-item-a'}></div>
                <div className={'space-item-c'}></div>
                <div className={'space-item-d'}></div>
                <div className={'space-item-e'}></div>
                <div className={'sign-form'}>
                    <Typography variant="headline" gutterBottom>
                        Технопарк. Тестирование по курсу UX
                    </Typography>
                    <Button variant="contained" color="primary" onClick={this.githubSignIn}>
                        Войти с помощью GitHub&nbsp;&nbsp;&nbsp;
                        <GithubCircle/>
                    </Button>
                </div>
            </div>
        );
    }
}

export default withRouter(Sign as any);
