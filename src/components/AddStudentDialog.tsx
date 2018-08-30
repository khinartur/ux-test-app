import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import {ChangeEvent} from 'react';
import {IUser} from '../interfaces/IUser';

interface Props {
    onClose: () => any;
    onChange: (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => any;
    onSubmit: () => any;
    open: boolean;
    mode: string;
    student: IUser,
}

export default class AddStudentDialog extends React.Component<Props> {

    render() {
        const {open, onChange, onSubmit, onClose, mode, student} = this.props;

        return (
            <React.Fragment>
                {mode == 'create' &&
                <Dialog open={open} aria-labelledby="dialog-title">
                    <DialogTitle id="dialog-title">Добавление студента</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Введите данные студента.
                        </DialogContentText>
                        <TextField
                            onChange={onChange}
                            autoFocus
                            margin="dense"
                            name={'studentName'}
                            label="Имя"
                            fullWidth
                        />
                        <TextField
                            onChange={onChange}
                            margin="dense"
                            name={'studentSurname'}
                            label="Фамилия"
                            fullWidth
                        />
                        <TextField
                            onChange={onChange}
                            margin="dense"
                            name={'studentGithub'}
                            label="Логин Github"
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} color="primary">
                            Отмена
                        </Button>
                        <Button onClick={onSubmit} color="primary">
                            Добавить
                        </Button>
                    </DialogActions>
                </Dialog>}
                {mode == 'edit' &&
                <Dialog open={open} aria-labelledby="dialog-title">
                    <DialogTitle id="dialog-title">Редактирование студента</DialogTitle>
                    <DialogContent>
                        <TextField
                            onChange={onChange}
                            autoFocus
                            margin="dense"
                            name={'name'}
                            label="Имя"
                            fullWidth
                            defaultValue={student.name}
                        />
                        <TextField
                            onChange={onChange}
                            margin="dense"
                            name={'surname'}
                            label="Фамилия"
                            fullWidth
                            defaultValue={student.surname}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} color="primary">
                            Отмена
                        </Button>
                        <Button onClick={onSubmit} color="primary">
                            Сохранить
                        </Button>
                    </DialogActions>
                </Dialog>}
                {mode == 'delete' &&
                <Dialog open={open} aria-labelledby="dialog-title">
                    <DialogTitle id="dialog-title">Удаление студента</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Вы уверены, что хотите удалить студента {student.github}?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} color="primary">
                            Отмена
                        </Button>
                        <Button onClick={onSubmit} color="primary">
                            Удалить
                        </Button>
                    </DialogActions>
                </Dialog>}
            </React.Fragment>
        );
    }
}
