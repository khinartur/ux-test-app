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
import {EUserTestStatus, IUser} from '../interfaces/IUser';

import * as StudentListStyles from '../styles/StudentsList.scss';
import IconButton from '@material-ui/core/IconButton';
import * as AppStyles from '../styles/App.scss';
import LinearProgress from '@material-ui/core/LinearProgress';
import TestEditForm from './TestEditForm';
import Test from './Test';
import {createUser, deleteUser, updateUser} from '../api/api-database';

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
    studentList?: IUser[];
    students?: { [login: string]: IUser }
    mode?: EMode;
    editableStudent?: IUser;
    loading: boolean;
    showStudentResults: boolean;
    checkingStudentLogin?: string;
}

export default class StudentsList extends React.Component<{}, State> {

    onDialogInputChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {mode, editableStudent} = this.state;

        const inputName = evt.target.name as keyof State;
        const inputValue = evt.target.value;
        switch (mode) {
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
                            ...editableStudent,
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
        const {studentGithub, studentName, studentSurname, editableStudent} = this.state;

        switch (this.state.mode) {
            case EMode.create:
                const newUser = {
                    name: studentName,
                    surname: studentSurname,
                    github: studentGithub,
                    test_status: EUserTestStatus.not_passed,
                    current_question: 0,
                    points: 0,
                    test_is_checked: false,
                };

                createUser(newUser)
                    .then(() => {
                        this.refreshStudentList();
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
                updateUser(editableStudent, {})
                    .then(() => {
                        this.refreshStudentList();
                    });
                break;

            case EMode.delete:
                deleteUser(editableStudent.github).then(() => {
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
        Object.entries(students).forEach((prop) => {
            list.push(students[prop[0]]);
        });

        this.setState({
            ...this.state,
            studentList: list,
            students: students,
            loading: false,
        });
    };
    toStudentList = () => {
        this.setState({
            ...this.state,
            showStudentResults: false,
            checkingStudentLogin: '',
        });
    };
    showUserTest = (evt, login) => {
        this.setState({
            ...this.state,
            showStudentResults: true,
            checkingStudentLogin: login,
        });
    };
    deleteUser = (evt, login) => {
        const {students} = this.state;

        this.setState({
            ...this.state,
            addStudentDialogOpened: true,
            editableStudent: students[login],
            mode: EMode.delete,
        });
    };
    editUser = (evt, login) => {
        const {students} = this.state;

        this.setState({
            ...this.state,
            addStudentDialogOpened: true,
            editableStudent: students[login],
            mode: EMode.edit,
        });
    };
    //TODO: hmmmm
    refreshStudentList = () => {
        const usersRef = database.ref('users/');
        usersRef.on('value', (snapshot) => {
            this.updateStudentList(snapshot.val());
        });
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
    }

    componentDidMount() {
        this.refreshStudentList();
    }

    render() {
        const {
            loading, showStudentResults, studentList, mode, editableStudent, addStudentDialogOpened,
            checkingStudentLogin, students
        } = this.state;

        return (
            <React.Fragment>
                {loading &&
                <div className={AppStyles.progress}>
                    <LinearProgress/>
                </div>
                }
                {!loading && !showStudentResults &&
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
                            {studentList.map((n: IUser, i: number) => {
                                return (
                                    <TableRow key={i}>
                                        <TableCell>{n.name + ' ' + n.surname}</TableCell>
                                        <TableCell>{n.github}</TableCell>
                                        <TableCell>{n.test_status == EUserTestStatus.passed ? 'пройден' : 'не пройден'}</TableCell>
                                        <TableCell>{n.test_is_checked ? 'да' : 'нет'}</TableCell>
                                        <TableCell>{n.points}</TableCell>
                                        <TableCell>
                                            <IconButton aria-label="Show test"
                                                        disabled={n.test_status == EUserTestStatus.not_passed}
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
                                      mode={mode}
                                      student={editableStudent}
                                      open={addStudentDialogOpened}
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
                {!loading && showStudentResults &&
                <Test user={students[checkingStudentLogin]}
                      checkMode={true}
                      onCheck={this.onCheck}
                      toStudentList={this.toStudentList}/>
                }
            </React.Fragment>
        );
    }
}
