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
import EyeSettings from 'mdi-material-ui/EyeSettings';
import AccountEdit from 'mdi-material-ui/AccountEdit';
import Delete from 'mdi-material-ui/Delete';

import {database} from '../modules/firebase';
import {IUser} from '../interfaces/IUser';

import * as StudentListStyles from '../styles/StudentsList.scss';
import IconButton from '@material-ui/core/IconButton';
import * as AppStyles from '../styles/App.scss';
import LinearProgress from '@material-ui/core/LinearProgress';
import TestEditForm from './TestEditForm';
import Test from './Test';

interface StudentInfo {
    name: string;
    surname: string;
    github: string;
    points: number;
    test_passed: boolean;
    test_is_checked: boolean;
}

enum EMode {
    delete = 'delete',
    create = 'create',
    edit = 'edit',
}

interface State {
    addStudentDialogOpened: boolean;
    studentName: string;
    studentSurname: string;
    studentGithub: string;
    studentList?: StudentInfo[];
    students?: { [login: string]: StudentInfo }
    mode?: EMode;
    editableStudent?: StudentInfo;
    loading: boolean;
    showStudentResults: boolean;
    checkingStudentLogin?: string;
}

export default class StudentsList extends React.Component<{}, State> {

    onDialogInputChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const inputName = evt.target.name as keyof State;
        const inputValue = evt.target.value;
        switch (this.state.mode) {
            case EMode.create:
                this.setState(
                    {
                        ...this.state,
                        [inputName]: inputValue,
                    },
                );
                break;

            case EMode.edit:
                this.setState(
                    {
                        ...this.state,
                        editableStudent: {
                            ...this.state.editableStudent,
                            [inputName]: inputValue,
                        },
                    },
                );
                break;
        }
    };
    openAddStudentDialog = () => {
        this.setState({
            ...this.state,
            mode: EMode.create,
            addStudentDialogOpened: true,
        });
    };
    closeAddStudentDialog = () => {
        this.setState({
            ...this.state,
            addStudentDialogOpened: false,
        });
    };
    onDialogSubmit = () => {
        //TODO: make loading
        switch (this.state.mode) {
            case EMode.create:
                database.ref('users/' + this.state.studentGithub).set({
                    name: this.state.studentName,
                    surname: this.state.studentSurname,
                    github: this.state.studentGithub,
                    test_passed: false,
                    points: 0,
                    test_is_checked: false,
                }).then(() => {
                    this.setState({
                        ...this.state,
                        studentName: '',
                        studentSurname: '',
                        studentGithub: '',
                        loading: false,
                    });
                });
                break;

            case EMode.edit:
                database.ref('users/' + this.state.editableStudent.github).set({
                    ...this.state.editableStudent,
                }).then(() => {
                    this.refreshStudentList();
                });
                break;

            case EMode.delete:
                database.ref('users/' + this.state.editableStudent.github).remove().then(() => {
                    this.refreshStudentList();
                });
        }
        this.setState({
            ...this.state,
            addStudentDialogOpened: false,
            loading: true,
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
            students: students,
            loading: false,
        });
    };
    showUserTest = (evt, login) => {
        console.log('SHOW USER TEST', login);
        this.setState({
            ...this.state,
            showStudentResults: true,
            checkingStudentLogin: login,
        });
    };
    deleteUser = (evt, login) => {
        const students = this.state.students;
        this.setState({
            ...this.state,
            addStudentDialogOpened: true,
            editableStudent: students[login],
            mode: EMode.delete,
        });
    };
    editUser = (evt, login) => {
        const students = this.state.students;
        this.setState({
            ...this.state,
            addStudentDialogOpened: true,
            editableStudent: students[login],
            mode: EMode.edit,
        });
    };
    refreshStudentList = () => {
        const usersRef = database.ref('users/');
        usersRef.on('value', function (snapshot) {
            this.updateStudentList(snapshot.val());
        }.bind(this));
    };
    onCheck = () => {
        this.setState({
            ...this.state,
            showStudentResults: false,
            checkingStudentLogin: '',
            loading: true,
        }, () => {
            this.refreshStudentList();
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            addStudentDialogOpened: false,
            studentName: '',
            studentSurname: '',
            studentGithub: '',
            loading: true,
            showStudentResults: false,
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
        this.refreshStudentList();
    }

    render() {
        return (
            <React.Fragment>
                {this.state.loading &&
                    <div className={AppStyles.progress}>
                        <LinearProgress/>
                    </div>
                }
                {!this.state.loading && !this.state.showStudentResults &&
                <Paper className={StudentListStyles.studentsListContainer}>
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
                            {this.state.studentList.map((n: IUser, i: number) => {
                                return (
                                    <TableRow key={i}>
                                        <TableCell>{n.name + ' ' + n.surname}</TableCell>
                                        <TableCell>{n.github}</TableCell>
                                        <TableCell>{n.test_passed ? 'пройден' : 'не пройден'}</TableCell>
                                        <TableCell>{n.test_is_checked ? 'да' : 'нет'}</TableCell>
                                        <TableCell>{n.points}</TableCell>
                                        <TableCell>
                                            <IconButton aria-label="Show test"
                                                        disabled={!n.test_passed}
                                                        onClick={(evt) => this.showUserTest(evt, n.github)}>
                                                <EyeSettings/>
                                            </IconButton>
                                            <IconButton aria-label="Edit student"
                                                        onClick={(evt) => this.editUser(evt, n.github)}>
                                                <AccountEdit/>
                                            </IconButton>
                                            <IconButton aria-label="Delete student"
                                                        onClick={(evt) => this.deleteUser(evt, n.github)}>
                                                <Delete/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <AddStudentDialog onClose={this.closeAddStudentDialog}
                                      mode={this.state.mode}
                                      student={this.state.editableStudent}
                                      open={this.state.addStudentDialogOpened}
                                      onChange={this.onDialogInputChange}
                                      onSubmit={this.onDialogSubmit}/>
                    <div className={StudentListStyles.addStudentButton}>
                        <Button onClick={this.openAddStudentDialog}
                                variant="contained"
                                color="primary">
                            Добавить студента
                        </Button>
                    </div>
                </Paper>}
                {!this.state.loading && this.state.showStudentResults &&
                    <Test user={this.state.students[this.state.checkingStudentLogin]}
                          checkMode={true}
                          onCheck={this.onCheck}/>
                }
            </React.Fragment>
        );
    }
}
