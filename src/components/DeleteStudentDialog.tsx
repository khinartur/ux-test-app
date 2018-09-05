import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import {IUser} from '../interfaces/IUser';

interface Props {
    onClose: () => any;
    onSubmit: () => any;
    open: boolean;
    student: IUser,
}

export default class DeleteStudentDialog extends React.Component<Props> {

    render() {
        const {open, onSubmit, onClose, student} = this.props;

        return (
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
            </Dialog>
        );
    }
}
