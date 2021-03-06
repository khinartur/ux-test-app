import * as React from 'react';
import {ChangeEvent} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import {IUser} from '../interfaces/IUser';

interface Props {
    onClose: () => any;
    onChange: (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => any;
    onSubmit: () => any;
    open: boolean;
    student: IUser,
}

export default class EditStudentDialog extends React.Component<Props> {

    render() {
        const {open, onChange, onSubmit, onClose, student} = this.props;

        return (
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
            </Dialog>
        );
    }
}
