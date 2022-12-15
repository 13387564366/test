/**
 * Created by edz on 2017/11/1.
 */
import React, {Component, PropTypes} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;

export default class ListItemStyle2 extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        data: React.PropTypes.object,
        visibleFilterKey: React.PropTypes.string,
        visibleFilterFun: React.PropTypes.func,
        visibleFilterFunOnly: React.PropTypes.bool,
        displayKey: React.PropTypes.string,
        valueKey: React.PropTypes.string,
        onPress: React.PropTypes.func,
    };

    static defaultProps = {
        data: null,
        visibleFilterKey: 'colvisible',
        visibleFilterFunOnly: false,
        visibleFilterFun: null,
        displayKey: 'display',
        valueKey: 'value',
    };

    _renderDataItem(display, value, drawLeftColor = false) {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    flex: 1,
                    paddingHorizontal: 10,
                    marginTop: 5,
                    borderLeftColor: drawLeftColor ? '#E4E7F0' : 'transparent',
                    borderLeftWidth: 1,
                }}
            >
                <Text style={{color: '#999',}}>{display + ': '}</Text>
                <Text style={{color: 'black', flex: 1,}} ellipsizeMode={'tail'} numberOfLines={1}>{value}</Text>
            </View>

        );
    }

    _onPress() {
        if (this.props.onPress) {
            this.props.onPress();
        }
    }

    _renderTwoItemPerLine(lineDatasArr) {
        const length = lineDatasArr.length;
        if (length > 2 || length <= 0) {
            return null;
        }
        const oneData = length == 1;
        const leftData = lineDatasArr[0], rightData = oneData ? null : lineDatasArr[1];
        return (
            <View
                style={{flexDirection: 'row', flex: 1,}}
            >
                {this._renderDataItem(leftData.display, leftData.value)}
                {oneData ? null : this._renderDataItem(rightData.display, rightData.value, true)}
            </View>
        );
    }

    _renderSubjectInfo(display, value) {
        if (!display && !value) {
            return null;
        }
        const subjectColor = 'black';
        const subjectFontSize = 18;
        const subjectStyle = {
            color: subjectColor,
            fontSize: subjectFontSize,
        };
        const text = display + ': ' + value;
        return (
            <View style={{
                flex: 1, paddingLeft: 10,
                paddingVertical: 10,
                borderBottomColor: '#ccc',
                borderBottomWidth: 0.5,
            }}>
                <Text style={subjectStyle} ellipsizeMode={'tail'} numberOfLines={1}>{text}</Text>
            </View>
        );
    }

    _visible(widgetInfo, visibleFilterKey, visibleFilterFun) {
        let visible = visibleFilterFun ? visibleFilterFun(widgetInfo) : true;
        if (this.props.visibleFilterFunOnly) {
            return visible;
        }
        return widgetInfo[visibleFilterKey] == '1' && visible;
    }

    render() {
        const {visibleFilterKey, visibleFilterFun, displayKey, valueKey, data} = this.props;
        if (typeof data != 'object') {
            return null;
        }
        const widgets = data.listData || {};
        const children = [];
        let child = null;
        let index = -1;
        let subjectKey = null, subjectVal = null;
        let lineDatas = [];
        let name = '', value = '';
        for (let idx in widgets) {
            const widgetInfo = widgets[idx];
            const visible = this._visible(widgetInfo, visibleFilterKey, visibleFilterFun);
            if (widgetInfo && visible) {
                name = widgetInfo[displayKey];
                value = widgetInfo[valueKey];
                index++;
                if (index == 0) {
                    subjectKey = name;
                    subjectVal = value;
                } else {
                    lineDatas.push({display: name, value: value});
                    if (index % 2 == 0) {
                        child = this._renderTwoItemPerLine(lineDatas);
                        children.push(<View key={'line-' + index}>{child}</View>);
                        lineDatas.splice(0, 2);
                    }
                }
            }
        }
        if (index % 2 != 0) {
            child = this._renderTwoItemPerLine(lineDatas);
            children.push(<View key={'line-' + index}>{child}</View>);
        }
        return (
            <TouchableOpacity activeOpacity={0.5}
                              onPress={() => this._onPress()}>
                <View style={{backgroundColor: 'white', width: WINDOW_WIDTH, marginTop: 10, paddingBottom: 5,}}>
                    {this._renderSubjectInfo(subjectKey, subjectVal)}
                    {children}
                    {this.props.renderRowExt ? this.props.renderRowExt(data) : null}
                </View>
            </TouchableOpacity>
        );
    }
}