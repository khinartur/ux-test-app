import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import {ChangeEvent} from 'react';

interface Props {
    onClose: () => any;
    onChange: (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => any;
    onSubmit: () => any;
    open: boolean;
}

export default class AddStudentDialog extends React.Component<Props> {

    constructor(props) {
        super(props);
    }

    render() {
        const { open, onChange, onSubmit, onClose } = this.props;

        return (
            <Dialog open={open} aria-labelledby="dialog-title">
                <DialogTitle id="dialog-title">Добавление студентов</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Введите данные студента.
                    </DialogContentText>
                    <TextField
                        onChange={onChange}
                        autoFocus
                        margin="dense"
                        name={"newStudentName"}
                        label="Name"
                        fullWidth
                    />
                    <TextField
                        onChange={onChange}
                        margin="dense"
                        name={"newStudentSurname"}
                        label="Surname"
                        fullWidth
                    />
                    <TextField
                        onChange={onChange}
                        margin="dense"
                        name={"newStudentGithub"}
                        label="Student github's login"
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
            </Dialog>
        );
    }
}
