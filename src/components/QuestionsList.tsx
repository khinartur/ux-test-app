import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CheckCircleOutline from 'mdi-material-ui/CheckCircleOutline';
import CheckBlankCircleOutline from 'mdi-material-ui/CheckboxBlankCircleOutline';

import {database} from '../modules/firebase';

import * as QuestionsListStyles from '../styles/StudentsList.scss';
import * as AppStyles from '../styles/App.scss';
import LinearProgress from '@material-ui/core/LinearProgress';
import {AnyQuestionData, IQuestion} from '../interfaces/IQuestion';
import {embedKey, getTypeName} from '../utils/key-embedding';

enum EMode {
    student = 'student',
    admin = 'admin',
}

interface Props {
    onClick: () => void;
    mode: EMode;
}

interface State {
    loading: boolean;
    questions?: IQuestion<AnyQuestionData>[];
}

export default class QuestionsList extends React.Component<Props, State> {

    updateQuestionsList = (questions) => {
        this.setState({
            ...this.state,
            questions: embedKey(questions),
        });
    };

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        database.ref('users/').on('value', function (snapshot) {
            this.updateQuestionsList(snapshot.val());
        }.bind(this));
    }

    render() {
        const {onClick, mode} = this.props;

        return (
            <React.Fragment>
                {this.state.loading &&
                <div className={AppStyles.progress}>
                    <LinearProgress/>
                </div>
                }
                {!this.state.loading &&
                <Paper className={QuestionsListStyles.tablePaper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Вопрос</TableCell>
                                <TableCell>Тип</TableCell>
                                <TableCell>Статус</TableCell>
                                {
                                    mode == EMode.admin &&
                                    <TableCell>Статус проверки</TableCell>
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.questions.map((q: IQuestion<AnyQuestionData>, i: number) => {
                                return (
                                    <TableRow key={i}
                                              onClick={(evt) => onClick(evt, q.key)}>
                                        <TableCell className={QuestionsListStyles.questionTextCell}>
                                            {q.text}
                                        </TableCell>
                                        <TableCell>{getTypeName(q)}</TableCell>
                                        <TableCell>
                                            {
                                                q.isAnswered ? <CheckCircleOutline color={'secondary'}/> :
                                                    <CheckBlankCircleOutline color={'error'}/>
                                            }
                                        </TableCell>
                                        {
                                            this.props.mode == EMode.admin &&
                                            <TableCell>
                                                {q.isChecked ?
                                                    <span style={{color: '#00695f'}}>проверен</span> :
                                                    <span style={{color: '#b2102f'}}>не проверен</span>}
                                            </TableCell>
                                        }
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Paper>}
            </React.Fragment>
        );
    }
}
