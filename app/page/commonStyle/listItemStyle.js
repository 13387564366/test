/**
 * Created by edz on 2017/11/1.
 */
import React, {Component, PropTypes} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
} from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;
const TEXT_ITEM_PADDING = 12;
const rowWidth = WINDOW_WIDTH - TEXT_ITEM_PADDING * 2;
const styles = StyleSheet.create({
    titleKeyStyle: {
        color: '#000',
    },
    titleValueStyle: {
        flex: 1,
        color: '#222',
        textAlign: 'right',
    },
    keyStyle: {
        color: '#000',
    },
    valueStyle: {
        flex: 1,
        color: '#222',
        textAlign: 'right',
    },
});

export default class ListItemStyle extends React.Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        data: PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.array,
        ]),
        visibleFilterKey: React.PropTypes.string,
        visibleFilterFun: React.PropTypes.func,
        displayKey: React.PropTypes.string,
        valueKey: React.PropTypes.string,
        onPress: React.PropTypes.func,
    };

    static defaultProps = {
        visibleFilterKey: 'colvisible',
        visibleFilterFun: null,//过滤某些字段是否显示，true：显示，false：不显示
        displayKey: 'display',
        valueKey: 'value',
    };

    _renderDataItem(display, value) {
        return (
            <View
                style={{flexDirection: 'row', flex: 1, paddingHorizontal: 10, marginTop: 5,}}
            >
                <Text style={{color: '#999',}}>{display + ': '}</Text>
                <Text style={{color: 'black', flex: 1,}} ellipsizeMode={'tail'} numberOfLines={1}>{value}</Text>
            </View>

        );
    }

    _onPress() {
        if (this.props.onPress) {
            this.props.onPress(this.props.data);
        }
    }

    _renderOneItemPerLine(name, value, colname, widgetInfo, listData) {
        const {renderLineItemFilter, renderLineItem} = this.props;
        if (renderLineItemFilter && renderLineItemFilter(colname, widgetInfo, listData)) {
            return renderLineItem(colname, widgetInfo, listData);
        }
        const showName = !!name;
        const textAlign = showName ? 'right' : 'left';
        return (
            <View
                key={colname}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 5,
                    flex: 1,
                }}>
                {
                    showName ?
                        <Text
                            style={styles.keyStyle}
                        >
                            {name}
                        </Text>
                        :
                        null
                }
                <Text
                    style={[styles.valueStyle, {textAlign: textAlign}]}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                >
                    {value}
                </Text>
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

    _renderSubjectInfo(display, value, colname, widgetInfo, widgets, showBottomLine = true) {
        if (!display && !value) {
            return null;
        }
        const {renderLineItemFilter, renderLineItem} = this.props;
        if (renderLineItemFilter && renderLineItemFilter(colname, widgetInfo, widgets)) {
            return renderLineItem(colname, widgetInfo, widgets);
        }
        const showName = !!display;
        const textAlign = showName ? 'right' : 'left';
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 6,
                borderBottomColor: '#E4E7F0',
                borderBottomWidth: showBottomLine ? 0.5 : 0,
                marginBottom: showBottomLine ? 5 : 0,
            }}>
                {showName ?
                    <Text style={styles.titleKeyStyle} ellipsizeMode={'tail'} numberOfLines={1}>{display}</Text> : null}
                <Text style={[styles.titleValueStyle, {textAlign: textAlign}]} ellipsizeMode={'tail'}
                      numberOfLines={1}>{value}</Text>
            </View>
        );
    }

    render() {
        const {visibleFilterKey, visibleFilterFun, displayKey, valueKey, data} = this.props;
        if (typeof data != 'object') {
            return null;
        }
        const widgets = data.listData || data;
        const children = [];
        let child = null;
        let isSubject = false;//记录第一次显示字段，显示样式为小标题
        let titleDisplay = null, titleVal = null, titleKey = null, titleWidget = null;
        let name = null, value = null;
        for (let idx in widgets) {
            const widgetInfo = widgets[idx];
            const visible = this._visible(widgetInfo, visibleFilterKey, visibleFilterFun);
            if (widgetInfo && visible) {
                name = widgetInfo[displayKey];
                value = widgetInfo[valueKey];
                if (!isSubject) {
                    isSubject = true;
                    titleDisplay = name;
                    titleVal = value;
                    titleKey = idx;
                    titleWidget = widgetInfo;
                } else {
                    child = this._renderOneItemPerLine(name, value, idx, widgetInfo, widgets);
                    if (child) {
                        children.push(child);
                    }
                }
            }
        }
        const hasChild = children.length > 0;
        return (
            <TouchableOpacity activeOpacity={0.5}
                              onPress={() => this._onPress()}>
                <View
                    style={{
                        marginTop: 8,
                        width: rowWidth,
                        marginHorizontal: TEXT_ITEM_PADDING,
                        paddingHorizontal: TEXT_ITEM_PADDING,
                        backgroundColor: 'white',
                        paddingVertical: 5,
                        borderBottomColor: '#e9e9e9',
                        borderBottomWidth: 0.5,
                        borderRadius: 5,
                    }}
                >
                    {this._renderSubjectInfo(titleDisplay, titleVal, titleKey, titleWidget, widgets, hasChild)}
                    {
                        hasChild ?
                            <View>
                                {children}
                                {this.props.renderRowExt ? this.props.renderRowExt(data) : null}
                            </View>
                            : null
                    }
                </View>
            </TouchableOpacity >
        );
    }
}