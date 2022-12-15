/**
 * Created by edz on 2017/11/8.
 */
import React, {PropTypes} from 'react';
import {
    Text,
    View,
    Dimensions,
} from 'react-native';
const WINDOW_WIDTH = Dimensions.get('window').width;
const TEXT_ITEM_PADDING = 14;
const ITEM_HEIGHT = 40;

export default class FormInfo extends React.Component {
    constructor(props) {
        super(props);
        this._renderContent = this._renderContent.bind(this);
        this._renderText = this._renderText.bind(this);
        this._renderLeftTitle = this._renderLeftTitle.bind(this);
        this._visible = this._visible.bind(this);
    }

    static propTypes = {
        datas: PropTypes.array.isRequired,
        keyIndex: PropTypes.string.isRequired,
        editable: PropTypes.bool,
        renderFilterFunc: PropTypes.func.isRequired,
        visibleFilterFuncOnly: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        datas: [],
        editable: false,
        groups: [],
        renderFilterFunc: () => true,
        visibleFilterFuncOnly: true,
    };

    _renderGroupTitle(groupTitle, keyIndex) {
        return (
            <Text
                key={keyIndex}
                style={{
                    backgroundColor: '#F1F2F7',
                    padding: 8,
                    color: '#B40000',
                }}>{groupTitle}</Text>
        );
    }

    _visible(lineDataItem, visibleFilterFunc) {
        let visible = visibleFilterFunc ? visibleFilterFunc(lineDataItem) : true;
        if (this.props.visibleFilterFuncOnly) {
            return visible;
        }
    }

    _renderChildren(datas, retChildren, visibleFilterFunc) {
        datas.forEach((dataItem, idx) => {
            if (this._visible(dataItem, visibleFilterFunc)) {
                retChildren.push(this._renderText(dataItem.display, dataItem.value, idx));
            }
        });
    }

    _renderLeftTitle(text, flex = 0) {
        const style = {
            flex: flex,
            flexDirection: 'row',
            backgroundColor: 'white',
            alignItems: 'center',
        };
        return (
            <Text style={{flex: flex, textAlign: 'left', color: '#000',}}>
                {text}
            </Text>
        );
    }

    _renderText(display, value, keyIndex) {
        const textStyle = {
            marginVertical: 5,
            flex: 7,
            textAlign: 'right',
            color: '#000',
            paddingLeft: 15,
        };
        return (
            <View
                key={keyIndex}
                style={{
                    backgroundColor: 'white',
                    borderBottomColor: '#E4E7F0',
                    borderBottomWidth: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: WINDOW_WIDTH,
                    paddingVertical: 5,
                    paddingHorizontal: TEXT_ITEM_PADDING,
                }}>
                {this._renderLeftTitle(display, 3)}
                <Text style={textStyle}>{value}</Text>
            </View>
        );
    }

    _renderContent() {
        const {title, datas, keyIndex, style, renderFilterFunc} = this.props;
        const children = [];
        let groupTitleView = null;
        if (!title) {
            this._renderChildren(datas, children, renderFilterFunc);
        } else {
            groupTitleView = this._renderGroupTitle(title, 'groupTitle');
            children.push(groupTitleView);
            this._renderChildren(datas, children, renderFilterFunc);
        }
        return (
            <View
                key={keyIndex}
                style={[{backgroundColor: 'white',}, style]}
            >
                {children}
            </View>
        );
    }

    render() {
        return this._renderContent();
    }
}