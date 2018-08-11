import * as React from 'react';
import firebase from 'firebase';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

export default class AddStudentDialog extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            open: false,
        };
    }

    handleClose = () => {
        this.props.onClose();
    };

    render() {
        const { handleClose } = this.props;

        return (
            <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="dialog-title">
                <DialogTitle id="dialog-title">Set backup account</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Чтобы добавить студентов для прохождения тестов введите их логины GitHub через любые пробельные
                        символы.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Student github's logins"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={this.handleClose} color="primary">
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
