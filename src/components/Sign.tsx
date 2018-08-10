import * as React from 'react';
import firebase from 'firebase'

export default class Sign extends React.Component {

    constructor(props) {
        super(props);

        this.githubSignIn = this.githubSignIn.bind(this);
    }

    githubSignIn() {

    }

    render() {
        return (
            <div>
                <h4>Технопарк. Тестирование по курсу UX</h4>
                <button onClick={this.githubSignIn}>Войти с помощью Github</button>
            </div>
        );
    }
}
