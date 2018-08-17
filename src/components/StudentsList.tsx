import * as React from 'react';
import firebase from 'firebase';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AddStudentDialog from './AddStudentDialog';
import {ChangeEvent} from 'react';

import {database} from '../modules/firebase';
import {IUser} from '../interfaces/IUser';

let id = 0;

function createData(name, surname, team, github, status, points) {
    id += 1;
    return {id, name, surname, team, github, status, points};
}

interface StudentInfo {
    name: string;
    surname: string;
    github: string;
    points: number;
    test_passed: boolean;
    test_is_checked: boolean;
}

interface State {
    addStudentDialogOpened: boolean;
    newStudentName: string;
    newStudentSurname: string;
    newStudentGithub: string;
    studentList: StudentInfo[];
}

export default class StudentsList extends React.Component<{}, State> {

    onDialogInputChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const inputName = evt.target.name as keyof State;
        const inputValue = evt.target.value;

        this.setState(
            {
                ...this.state,
                [inputName]: inputValue,
            },
        );
    };
    openAddStudentDialog = () => {
        this.setState({
            addStudentDialogOpened: true,
        });
    };
    closeAddStudentDialog = () => {
        this.setState({
            addStudentDialogOpened: false,
        });
    };
    onDialogSubmit = () => {
        //TODO: make loading
        database.ref('users/' + this.state.newStudentGithub).set({
            name: this.state.newStudentName,
            surname: this.state.newStudentSurname,
            github: this.state.newStudentGithub,
            test_passed: false,
            points: 0,
            test_is_checked: false,
        }).then(() => {
            this.setState({
                addStudentDialogOpened: false,
                newStudentName: '',
                newStudentSurname: '',
                newStudentGithub: '',
            });
        });
    };
    updateStudentList = (students) => {
        let list = [];
        for (const studentLogin in students) {
            list.push(students[studentLogin]);
        }

        this.setState({
            ...this.state,
            studentList: list,
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            addStudentDialogOpened: false,
            newStudentName: '',
            newStudentSurname: '',
            newStudentGithub: '',
            studentList: [],
        };

        this.githubSignIn = this.githubSignIn.bind(this);
    }

    githubSignIn() {
        //TODO: check instance
        const provider = new firebase.auth.GithubAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function (result) {
            console.log('Result:');
            console.dir(result);
        });
    }

    componentDidMount() {
        const usersRef = database.ref('users/');
        usersRef.on('value', function (snapshot) {
            this.updateStudentList(snapshot.val());
        }.bind(this));
    }

    render() {
        return (
            <Paper className={'students-list-container'}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Студент</TableCell>
                            <TableCell>GitHub</TableCell>
                            <TableCell>Статус теста</TableCell>
                            <TableCell>Тест проверен</TableCell>
                            <TableCell>Кол-во баллов</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.studentList.map((n: IUser, i: number)  => {
                            return (
                                <TableRow key={i}>
                                    <TableCell>{n.name + ' ' + n.surname}</TableCell>
                                    <TableCell>{n.github}</TableCell>
                                    <TableCell>{n.test_passed ? 'пройден' : 'не пройден'}</TableCell>
                                    <TableCell>{n.test_is_checked ? 'да' : 'нет'}</TableCell>
                                    <TableCell>{n.points}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <AddStudentDialog onClose={this.closeAddStudentDialog}
                                  open={this.state.addStudentDialogOpened}
                                  onChange={this.onDialogInputChange}
                                  onSubmit={this.onDialogSubmit}/>
                <Button onClick={this.openAddStudentDialog}
                        variant="contained"
                        color="primary">
                    Добавить студента
                </Button>
            </Paper>
        );
    }
}
