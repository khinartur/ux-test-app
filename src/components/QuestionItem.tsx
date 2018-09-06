import * as React from 'react';
import {QuestionListItem} from '../interfaces/IQuestion';
import Drag from 'mdi-material-ui/Drag';
import * as styles from '../styles/QuestionItem.scss';

type QuestionItemProps = {
    item: QuestionListItem;
    itemSelected: number;
    dragHandle: any;
    commonProps: any;
};
type QuestionItemState = {};

export default class QuestionItem extends React.Component<QuestionItemProps, QuestionItemState> {

    render() {
        const {item, itemSelected, dragHandle, commonProps} = this.props;
        const scale = itemSelected * 0.05 + 1;
        const shadow = itemSelected * 15 + 1;
        //const dragged = itemSelected !== 0;

        return (
            <React.Fragment>
                <div
                    //className={cx('item', {dragged})}
                    className={styles.questionItem}
                    style={{
                        transform: `scale(${scale})`,
                        boxShadow: `rgba(0, 0, 0, 0.3) 0px ${shadow}px ${2 * shadow}px 0px`
                    }}
                    onClick={(evt) => commonProps.onClick(evt, item.order)}
                >
                    <div className={styles.questionText}>{item.order + ') ' + item.text}</div>
                    {dragHandle(<div className={styles.dragIcon}><Drag style={{float: 'right'}}/></div>)}
                </div>
            </React.Fragment>
        );
    }
}
