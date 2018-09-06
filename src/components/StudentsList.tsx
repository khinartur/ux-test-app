import * as React from 'react';
import {ChangeEvent} from 'react';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AddStudentDialog from './AddStudentDialog';
import EyeSettings from 'mdi-material-ui/EyeSettings';
import AccountEdit from 'mdi-material-ui/AccountEdit';
import Delete from 'mdi-material-ui/Delete';
import {database} from '../modules/firebase';
import {EUserTestStatus, IUser} from '../interfaces/IUser';
import * as StudentListStyles from '../styles/StudentsList.scss';
import IconButton from '@material-ui/core/IconButton';
import * as AppStyles from '../styles/App.scss';
import LinearProgress from '@material-ui/core/LinearProgress';
import Test from './Test';
import {createUser, deleteUser, updateUser} from '../api/api-database';
import EditStudentDialog from './EditStudentDialog';
import DeleteStudentDialog from './DeleteStudentDialog';

interface State {
    addStudentDialogOpened: boolean;
    editStudentDialogOpened: boolean;
    deleteStudentDialogOpened: boolean;
    studentName: string;
    studentSurname: string;
    studentGithub: string;
    studentList?: IUser[];
    students?: { [login: string]: IUser }
    editableStudent?: IUser;
    loading: boolean;
    showStudentResults: boolean;
    checkingStudentLogin?: string;
}

export default class StudentsList extends React.Component<{}, State> {

    onAddDialogInputChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const inputName = evt.target.name as keyof State;
        const inputValue = evt.target.value;
        this.setState(
            {
                ...this.state,
                [inputName]: inputValue,
            },
        );
    };
    onEditDialogInputChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {editableStudent} = this.state;
        const inputName = evt.target.name as keyof State;
        const inputValue = evt.target.value;

        this.setState(
            {
                ...this.state,
                editableStudent: {
                    ...editableStudent,
                    [inputName]: inputValue,
                },
            },
        );
    };
    openAddStudentDialog = () => {
        this.setState({
            ...this.state,
            addStudentDialogOpened: true,
        });
    };
    openEditStudentDialog = () => {
        this.setState({
            ...this.state,
            editStudentDialogOpened: true,
        });
    };
    openDeleteStudentDialog = () => {
        this.setState({
            ...this.state,
            deleteStudentDialogOpened: true,
        });
    };
    closeAddStudentDialog = () => {
        this.setState({
            ...this.state,
            addStudentDialogOpened: false,
        });
    };
    closeEditStudentDialog = () => {
        this.setState({
            ...this.state,
            editStudentDialogOpened: false,
        });
    };
    closeDeleteStudentDialog = () => {
        this.setState({
            ...this.state,
            deleteStudentDialogOpened: false,
        });
    };

    onAddDialogSubmit = () => {
        const {studentGithub, studentName, studentSurname} = this.state;

        this.setState({
            ...this.state,
            loading: true,
        });

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
                    addStudentDialogOpened: false,
                    loading: false,
                });
            });
    };
    onEditDialogSubmit = () => {
        const {editableStudent} = this.state;

        this.setState({
            ...this.state,
            loading: true,
        });

        updateUser(editableStudent, {})
            .then(() => {
                this.refreshStudentList();
            });

        this.setState({
            ...this.state,
            editStudentDialogOpened: false,
            loading: false,
        });
    };
    onDeleteDialogSubmit = () => {
        const {editableStudent} = this.state;

        this.setState({
            ...this.state,
            loading: true,
        });

        deleteUser(editableStudent.github).then(() => {
            this.refreshStudentList();
        });

        this.setState({
            ...this.state,
            deleteStudentDialogOpened: false,
            loading: false,
        });
    };
    updateStudentList = (students = {}) => {
        let list = [];
        if (students) {
            Object.entries(students).forEach((prop) => {
                list.push(students[prop[0]]);
            });
        }

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
            deleteStudentDialogOpened: true,
            editableStudent: students[login],
        });
    };
    editUser = (evt, login) => {
        const {students} = this.state;

        this.setState({
            ...this.state,
            editStudentDialogOpened: true,
            editableStudent: students[login],
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
            editStudentDialogOpened: false,
            deleteStudentDialogOpened: false,
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
            loading, showStudentResults, studentList, editableStudent,
            addStudentDialogOpened, editStudentDialogOpened, deleteStudentDialogOpened,
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
                                        <TableCell>{n.test_status === EUserTestStatus.passed ? 'пройден' : 'не пройден'}</TableCell>
                                        <TableCell>{n.test_is_checked ? 'да' : 'нет'}</TableCell>
                                        <TableCell>{n.points}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                aria-label="Show test"
                                                disabled={n.test_status === EUserTestStatus.not_passed}
                                                onClick={(evt) => this.showUserTest(evt, n.github)}>
                                                <EyeSettings/>
                                            </IconButton>
                                            <IconButton
                                                aria-label="Edit student"
                                                onClick={(evt) => this.editUser(evt, n.github)}>
                                                <AccountEdit/>
                                            </IconButton>
                                            <IconButton
                                                aria-label="Delete student"
                                                onClick={(evt) => this.deleteUser(evt, n.github)}>
                                                <Delete/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <AddStudentDialog
                        onClose={this.closeAddStudentDialog}
                        open={addStudentDialogOpened}
                        onChange={this.onAddDialogInputChange}
                        onSubmit={this.onAddDialogSubmit}/>
                    {editStudentDialogOpened &&
                    <EditStudentDialog
                        onClose={this.closeEditStudentDialog}
                        student={editableStudent}
                        open={editStudentDialogOpened}
                        onChange={this.onEditDialogInputChange}
                        onSubmit={this.onEditDialogSubmit}/>
                    }
                    {deleteStudentDialogOpened &&
                    <DeleteStudentDialog
                        onClose={this.closeDeleteStudentDialog}
                        student={editableStudent}
                        open={deleteStudentDialogOpened}
                        onSubmit={this.onDeleteDialogSubmit}/>
                    }
                    <div className={StudentListStyles.addStudentButton}>
                        <Button onClick={this.openAddStudentDialog}
                                variant="contained"
                                color="primary">
                            Добавить студента
                        </Button>
                    </div>
                </Paper>}
                {!loading && showStudentResults &&
                <Test
                    user={students[checkingStudentLogin]}
                    checkMode={true}
                    onCheck={this.onCheck}
                    toStudentList={this.toStudentList}/>
                }
            </React.Fragment>
        );
    }
}
