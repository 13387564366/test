import React from 'react';
import {
    View,
    ScrollView,
} from 'react-native';
import ListItemStyle from './listItem';
import CommonFunc from './commonFunc';
import CommonStyles from './commonStyle';

export default class CommonList extends React.Component {
    constructor(props) {
        super(props);
        this._renderRow = this._renderRow.bind(this);
        this._onPress = this._onPress.bind(this);
        this._renderRowExt = this._renderRowExt.bind(this);
    }

    static propTypes = {
        styleNum: React.PropTypes.number,
    };

    static defaultProps = {
        needConvert: true,
        styleNum: 1,
    };

    _onPress(rowData, rowID) {
        if (this.props.onPress) {
            this.props.onPress(rowData, rowID);
        } else {
            // CommonFunc.alert('列表条目点击事件、请添加!!!', null, this.props.title);
        }
    }

    _renderRowExt(rowData, rowId) {
        if (this.props.renderRowExt) {
            return this.props.renderRowExt(rowData, rowId);
        }
    }

    _renderRow(rowData, sectionID, rowID) {
        if (this.props.renderRow) {
            return this.props.renderRow(rowData, sectionID, rowID);
        }
        return (
            <ListItemStyle
                key={rowID}
                data={rowData}
                renderRow={this.props.renderRow}
                renderRowExt={(param) => this._renderRowExt(param, rowID)}
                visibleFilterFun={this.props.renderFilter}
                visibleFilterFunOnly={this.props.visibleFilterFunOnly}
                onPress={() => this._onPress(rowData, rowID)}
                renderLineItemFilter={this.props.renderLineItemFilter}
                renderLineItem={this.props.renderLineItem}
            />
        );
    }

    _renderList(listDs) {
        return listDs.map((listItemData, i) => {
            return this._renderRow(listItemData, i, i);
        })
    }

    _renderListContent() {
        const {datas, style, needConvert, inInnerList} = this.props;
        const isEmpty = datas.length <= 0;
        if (isEmpty) {
            return null;
        }
        const handledDs = needConvert ? CommonFunc.handleListDatas(datas, 'colname') : datas;
        return (
            <View style={[{flex: 1, alignItems: 'center',}, CommonStyles.backgroundColor, style]}>

                {!inInnerList ? <ScrollView>
                    {this._renderList(handledDs)}
                </ScrollView>
                    :
                    this._renderList(handledDs)
                }
            </View>
        );
    }

    render() {
        return this._renderListContent();
    }
}