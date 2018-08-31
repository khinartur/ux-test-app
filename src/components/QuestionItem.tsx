import * as React from 'react';
import {QuestionListItem} from '../interfaces/IQuestion';

type QuestionItemProps = {
    item: QuestionListItem;
    itemSelected: number;
    dragHandle: any;
};
type QuestionItemState = {};

export default class QuestionItem extends React.Component<QuestionItemProps, QuestionItemState> {

    render() {
        const {item, itemSelected, dragHandle} = this.props;
        const scale = itemSelected * 0.05 + 1;
        const shadow = itemSelected * 15 + 1;
        const dragged = itemSelected !== 0;
        debugger;
        return (
            <React.Fragment>
                {dragHandle(<div
                    //className={cx('item', {dragged})}
                    style={{
                        transform: `scale(${scale})`,
                        boxShadow: `rgba(0, 0, 0, 0.3) 0px ${shadow}px ${2 * shadow}px 0px`
                    }}
                >
                    {item.order + ') ' + item.text}
                </div>)}
            </React.Fragment>
        );
    }
}
