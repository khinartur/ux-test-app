import * as React from 'react';
import {Link} from 'react-router-dom';

export default class Admin extends React.Component {

    render() {
        return (
            <div>
                <button>Редактировать тест</button>
                <button>Посмотреть результаты</button>
                <Link to="/admin/students">Результаты студентов</Link>
                <button>Список студентов</button>
            </div>
        );
    }
}
