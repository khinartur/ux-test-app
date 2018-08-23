import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

interface Props {
    onClose: () => any;
    onSubmit: () => any;
    open: boolean;
}

export default class DoneTestDialog extends React.Component<Props> {

    render() {
        const {open, onSubmit, onClose} = this.props;

        return (
            <Dialog open={open} aria-labelledby="dialog-title">
                <DialogTitle id="dialog-title">Завершение теста</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы ответили не на все вопросы. Вы уверены, что хотите завершить тест?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={onSubmit} color="primary">
                        Да
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
