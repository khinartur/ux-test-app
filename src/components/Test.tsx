import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {IUser} from '../interfaces/IUser';

interface Props {
    user: IUser;
}

class Test extends React.Component<Props & RouteComponentProps<{}>, {}> {

    render() {
        const {user} = this.props;

        return (
            <div className={'wrapper'}>

            </div>
        );
    }
}

export default withRouter(Test);
