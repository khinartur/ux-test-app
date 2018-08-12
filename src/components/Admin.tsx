import * as React from 'react';
import {Link} from 'react-router-dom';

export default class Admin extends React.Component {

    render() {
        return (
            <div>
                <Link to="/admin/edit/test">Редактировать тест</Link>
                <Link to="/admin/students">Результаты студентов</Link>
            </div>
        );
    }
}
