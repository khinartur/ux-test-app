import * as React from 'react';
import firebase from 'firebase';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AddStudentDialog from './AddStudentDialog'
import {ChangeEvent} from 'react';

let id = 0;
function createData(name, team, github, status, points) {
    id += 1;
    return { id, name, team, github, status, points };
}

interface State {
    addStudentDialogOpened: boolean;
    newStudentsString: string;
}

export default class StudentsList extends React.Component<{}, State> {

    constructor(props) {
        super(props);

        this.state = {
            addStudentDialogOpened: false,
            newStudentsString: "",
        };

        this.githubSignIn = this.githubSignIn.bind(this);
    }



    githubSignIn() {
        //TODO: check instanse
        const provider = new firebase.auth.GithubAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function (result) {
            console.log("Result:");
            console.dir(result);
        });
    }

    onDialogInputChange = (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        this.setState({
            newStudentsString: evt.target.value,
        });
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
        this.setState({
            addStudentDialogOpened: false,
        });

        this.state.newStudentsString.split(/\s+/g).forEach(function(login) {
            console.log("LOGIN: ", login);
        });
    };

    render() {
        const data = [
            createData('Артур Хинельцев', 'gophers', 'khinartur', 'Тест не пройден', 0),
            createData('Анатолий Остапенко', 'perlmonks', 'akamandusa', 'Тест пройден', 100),
        ];

        return (
            <div>
                <Paper>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Студент</TableCell>
                                <TableCell>Команда</TableCell>
                                <TableCell>GitHub</TableCell>
                                <TableCell>Статус теста</TableCell>
                                <TableCell>Кол-во баллов</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map(n => {
                                return (
                                    <TableRow key={n.id}>
                                        <TableCell>{n.name}</TableCell>
                                        <TableCell numeric>{n.team}</TableCell>
                                        <TableCell numeric>{n.github}</TableCell>
                                        <TableCell numeric>{n.status}</TableCell>
                                        <TableCell numeric>{n.points}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Paper>
                <AddStudentDialog onClose={this.closeAddStudentDialog}
                                  open={this.state.addStudentDialogOpened}
                                  onChange={this.onDialogInputChange}
                                  onSubmit={this.onDialogSubmit}/>
                <Button onClick={this.openAddStudentDialog}>Добавить студента</Button>
            </div>
        );
    }
}