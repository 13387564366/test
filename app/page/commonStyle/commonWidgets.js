/**
 * Created by edz on 2017/11/8.
 */
import React from 'react';
import {
    Text,
    TextInput,
    View,
    Alert,
    Image,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import OptionListPage from '../../components/optionListPage/optionListPage';
// import TreeListPage from '../../components/treeView/treeListPage';
// import ProvinceCityAreas from '../../modules/provinceCityAreas';
import DateHelper from '../../modules/dateHelper';
import DatePicker from 'react-native-datepicker';
import CommonFunc from '../commonStyle/commonFunc';
import dismissKeyboard from '../../../node_modules/react-native/Libraries/Utilities/dismissKeyboard';

const WINDOW_WIDTH = Dimensions.get('window').width;
const TEXT_ITEM_PADDING = 14;
const TEXT_MAX_WIDTH = WINDOW_WIDTH * 0.3;
const EMPTY_LIST_VALUE = '请选择';
const EMPTY_PLEASE_INPUT = '请输入';
const EMPTY_PLEASE_SELECT_DATE = '请选择日期';
const ITEM_PADDING_VERTICAL = 0;
const BORDER_RADIUS = 0;
const ITEM_HEIGHT = 40;

export default class CommonWidgets extends React.Component {
    constructor(props) {
        super(props);
        this._renderLeftTitle = this._renderLeftTitle.bind(this);
        this.isFiledNameNull = this.isFiledNameNull.bind(this);
        this._renderText = this._renderText.bind(this);
        this._renderTextInput = this._renderTextInput.bind(this);
        this._onTextInputBlur = this._onTextInputBlur.bind(this);
        this._renderTextRight = this._renderTextRight.bind(this);
        this._renderOptionList = this._renderOptionList.bind(this);
        this._toOptionListPage = this._toOptionListPage.bind(this);
        this._renderRightSelect = this._renderRightSelect.bind(this);
        this._onListItemSelected = this._onListItemSelected.bind(this);
        this._renderTreeList = this._renderTreeList.bind(this);
        this._toTreeListPage = this._toTreeListPage.bind(this);
        this._renderDatePicker = this._renderDatePicker.bind(this);
        this._onValueChanged = this._onValueChanged.bind(this);
        this._onSetState = this._onSetState.bind(this);
        this._renderWidgets = this._renderWidgets.bind(this);
        this._calculateContents = this._calculateContents.bind(this);
    }

    static propTypes = {
        editable: React.PropTypes.bool,
        onValueChange: React.PropTypes.func,
        onSetState: React.PropTypes.func,
        widgetInfo: React.PropTypes.object,
        renderCustom: React.PropTypes.func,
        groups: React.PropTypes.array,
    };

    static defaultProps = {
        editable: false,
        groups: [],
    };

    _renderLeftTitle(text, required, flexble = 0) {
        const style = {
            flexDirection: 'row',
            backgroundColor: 'white',
            alignItems: 'center',
            paddingLeft: TEXT_ITEM_PADDING,
        };
        if (flexble) {
            style.flex = flexble;
        } else {
            style.height = ITEM_HEIGHT;
        }
        const lines = flexble ? 2 : 1;
        return (
            <View style={style}>
                <Text style={[{flex: 1, fontSize: 15, textAlign: 'left', color: '#767A8B',}, {
                    fontSize: 14,
                    color: '#000'
                }]} ellipsizeMode={'tail'}
                      numberOfLines={lines}>
                    {text}
                </Text>
                {required ? <Text style={{color: 'red',}}>*</Text> : null}
            </View>
        );
    }

    _getFieldName(widgetInfo) {
        return (widgetInfo.display || widgetInfo.colheader || '');
    }

    isFiledNameNull(fieldName) {
        fieldName = fieldName.replace(/(^\s*)|(\s*$)/g, '');
        return !fieldName;
    }

    _getKeyboardType(widgetInfo) {
        let baseType = widgetInfo.basetype || '';
        baseType = baseType ? baseType.toLowerCase() : '';
        const empty = !baseType;
        return empty ? 'default' : baseType == 'number' ? 'numeric' : 'default';
    }

    _renderText(widgetInfo, editable, required, lines) {
        let fieldName = this._getFieldName(widgetInfo);
        if (this.isFiledNameNull(fieldName)) {
            return null;
        } else {
            // const baseType = widgetInfo.basetype || '';
            // const isNumber = baseType.toLowerCase() == 'number';
            // const keyboardType = isNumber ? 'numeric' : 'default';
            const keyboardType = this._getKeyboardType(widgetInfo);
            // const keyboardType = 'default';
            let value = widgetInfo.value || '';
            value = value.toString();
            if (!editable) {
                value = CommonFunc.formatKNumber(widgetInfo);
            }
            const hintText = editable ? EMPTY_PLEASE_INPUT : '';
            const textAlign = lines > 1 ? 'left' : 'right';
            const borderWidth = lines > 1 ? 1 : 0;
            const borderColor = lines > 1 ? '#E4E7F0' : 'transparent';
            const inputMarginVertical = lines > 1 ? 5 : 0;
            const color = editable ? '#000' : '#000';
            const style = {
                marginVertical: inputMarginVertical,
                borderWidth: borderWidth,
                borderColor: borderColor,
                flex: 1,
                marginLeft: 10,
                height: ITEM_HEIGHT * lines,
                textAlign: textAlign,
                color: color,
            };
            const textStyle = lines > 1 ? style : {flex: 1, marginLeft: 10, color: color, textAlign: textAlign};
            return (
                <View
                    style={{
                        borderColor: 'red',
                        borderWidth: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                    }}>
                    <View style={{
                        flexDirection: 'row', backgroundColor: 'white',
                        paddingRight: 14, borderBottomColor: 'gray', borderBottomWidth: 0,
                        borderRadius: BORDER_RADIUS, flex: 1, justifyContent: 'space-between',
                    }}>
                        {this._renderLeftTitle(fieldName, required)}
                        {
                            editable ?
                                (<TextInput
                                    style={[style]}
                                    onFocus={(event)=>this._onTextInputFocus(event, widgetInfo)}
                                    onBlur={(event) => this._onTextInputBlur(event, widgetInfo)}
                                    keyboardType={keyboardType}
                                    underlineColorAndroid={'transparent'}
                                    numberOfLines={lines}
                                    multiline={false}
                                    value={value}
                                    placeholder={hintText}
                                    onChangeText={ (text) => this._onValueChanged(widgetInfo, text)}
                                />)
                                :
                                <View
                                    style={{
                                        flex: 1, flexDirection: 'row',
                                        justifyContent: 'flex-end', alignItems: 'center',
                                    }}
                                >
                                    {/*<Text style={[style, {textAlignVertical: 'center',}]}>{value}</Text>*/}
                                    <Text style={textStyle} ellipsizeMode={'tail'}
                                          numberOfLines={lines}>{value}</Text>
                                </View>
                        }
                    </View>
                    {this._renderTextRight(widgetInfo, editable)}
                </View>
            );
        }
    }

    _renderTextArea(widgetInfo, editable, required, lines) {
        let fieldName = this._getFieldName(widgetInfo);
        if (this.isFiledNameNull(fieldName)) {
            return null;
        } else {
            // const baseType = widgetInfo.basetype || '';
            // const isNumber = baseType.toLowerCase() == 'number';
            // const keyboardType = isNumber ? 'numeric' : 'default';
            const keyboardType = this._getKeyboardType(widgetInfo);
            // const keyboardType = 'default';
            let value = widgetInfo.value || '';

            //TODO :test
            // const repeatCount = 20;
            // for (let i = 0; i < repeatCount; i++) {
            //     value += '数据---->>' + i + '<<';
            // }
            // value += 'end';
            value = value.toString();
            const hintText = editable ? EMPTY_PLEASE_INPUT : '';
            const textAlign = lines > 1 ? 'left' : 'right';
            const borderWidth = lines > 1 ? 1 : 0;
            const borderColor = lines > 1 ? '#E4E7F0' : 'transparent';
            const inputMarginVertical = lines > 1 ? 5 : 0;
            const color = editable ? '#000' : '#000';
            const style = {
                marginVertical: inputMarginVertical,
                borderWidth: borderWidth,
                borderColor: borderColor,
                flex: 1,
                marginLeft: 10,
                textAlign: textAlign,
                color: color,
                minHeight: ITEM_HEIGHT * 2
            };
            const textStyle = lines > 1 ? style : {
                flex: 1,
                marginLeft: 10,
                color: color,
                textAlign: textAlign,
                minHeight: ITEM_HEIGHT * 2
            };
            return (
                <View
                    style={{
                        borderColor: 'red',
                        borderWidth: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                    }}>
                    <View style={{
                        flexDirection: 'row', backgroundColor: 'white',
                        paddingRight: 14, borderBottomColor: 'gray', borderBottomWidth: 0,
                        borderRadius: BORDER_RADIUS, flex: 1, justifyContent: 'space-between',
                    }}>
                        {this._renderLeftTitle(fieldName, required, 1)}
                        {
                            editable ?
                                (<TextInput
                                    style={[style, {flex: 3, fontSize: 14, padding: 2}]}
                                    onFocus={(event)=>this._onTextInputFocus(event, widgetInfo)}
                                    onBlur={(event) => this._onTextInputBlur(event, widgetInfo)}
                                    keyboardType={keyboardType}
                                    underlineColorAndroid={'transparent'}
                                    numberOfLines={lines}
                                    multiline={true}
                                    value={value}
                                    placeholder={hintText}
                                    onChangeText={ (text) => this._onValueChanged(widgetInfo, text)}
                                />)
                                :
                                <View
                                    style={{
                                        flex: 3, flexDirection: 'row',
                                        justifyContent: 'flex-end', alignItems: 'center',
                                    }}
                                >
                                    {/*<Text style={[style, {textAlignVertical: 'center',}]}>{value}</Text>*/}
                                    <Text style={textStyle}>{value}</Text>
                                </View>
                        }
                    </View>
                    {this._renderTextRight(widgetInfo, editable)}
                </View>
            );
        }
    }

    _renderTextInput(widgetInfo, value, hintText, style, lines, keyboardType) {
        if ('numeric' == keyboardType) {
            return (
                <TouchableOpacity
                    style={style}
                >
                    <TextInput
                        style={[style, {textAlignVertical: 'top',}]}
                        onFocus={(event)=>this._onTextInputFocus(event, widgetInfo)}
                        onBlur={(event) => this._onTextInputBlur(event, widgetInfo)}
                        keyboardType={keyboardType}
                        underlineColorAndroid={'transparent'}
                        numberOfLines={lines}
                        multiline={true}
                        value={value}
                        placeholder={hintText}
                        onChangeText={ (text) => this._onValueChanged(widgetInfo, text)}
                    />
                </TouchableOpacity>
            );
        } else {
            return (
                <TextInput
                    style={[style, {textAlignVertical: 'top',}]}
                    onFocus={(event)=>this._onTextInputFocus(event, widgetInfo)}
                    onBlur={(event) => this._onTextInputBlur(event, widgetInfo)}
                    keyboardType={keyboardType}
                    underlineColorAndroid={'transparent'}
                    numberOfLines={lines}
                    multiline={true}
                    value={value}
                    placeholder={hintText}
                    onChangeText={ (text) => this._onValueChanged(widgetInfo, text)}
                />
            );
        }
    }

    _onTextInputFocus(event, widgetInfo) {
        const text = widgetInfo.itemno;
        const isZero = CommonFunc.isZero(text);
        if (isZero) {
            const newWidgetInfo = {
                ...widgetInfo,
                itemno: '',
                value: '',
            };
            this._onSetState(newWidgetInfo);
        }
    }

    _onTextInputBlur(event, widgetInfo) {
        const text = widgetInfo.itemno;
        //处理格式显示问题
        const newWidgetInfo = {
            ...widgetInfo,
        };
        CommonFunc.handleCheckFormat(newWidgetInfo);
        this._onSetState(newWidgetInfo);
    }

    _renderTextRight(widgetInfo, editable) {
        const rightAction = widgetInfo.rightAction;
        if (editable && rightAction) {
            return rightAction(widgetInfo);
        }
    }

    _renderOptionList(widgetInfo, editable, required) {
        let fieldName = this._getFieldName(widgetInfo);
        if (this.isFiledNameNull(fieldName)) {
            return null;
        } else {
            const value = widgetInfo.value;
            const displayValue = editable ? (value ? value : EMPTY_LIST_VALUE) : value;
            return (
                <View
                    style={{
                        backgroundColor: 'white',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: ITEM_PADDING_VERTICAL,
                        paddingHorizontal: 0,
                        borderBottomColor: 'gray', borderBottomWidth: 0,
                        borderRadius: BORDER_RADIUS,
                    }}>
                    {this._renderLeftTitle(fieldName, required)}
                    {
                        editable ?
                            <TouchableOpacity
                                style={{
                                    flex: 1, flexDirection: 'row', paddingHorizontal: 10,
                                }}
                                activeOpacity={0.6}
                                onPress={ () => {
                                    dismissKeyboard();
                                    this._toOptionListPage(widgetInfo, editable);
                                }}>
                                <View
                                    style={{
                                        flex: 1, flexDirection: 'row',
                                        justifyContent: 'flex-end', alignItems: 'center',
                                    }}
                                >
                                    <Text style={{
                                        color: '#000',
                                    }} ellipsizeMode={'tail'}
                                          numberOfLines={1}>{displayValue}</Text>
                                    {
                                        editable ?
                                            <View>
                                                {this._renderRightSelect()}
                                            </View>
                                            :
                                            null
                                    }
                                </View>
                            </TouchableOpacity>
                            :
                            <View
                                style={{
                                    flex: 1, flexDirection: 'row', paddingHorizontal: 10,
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, flexDirection: 'row',
                                        justifyContent: 'flex-end', alignItems: 'center',
                                    }}
                                >
                                    <Text style={{
                                        color: '#000',
                                    }} ellipsizeMode={'tail'}
                                          numberOfLines={1}>{displayValue}</Text>
                                    {
                                        editable ?
                                            <View>
                                                {this._renderRightSelect()}
                                            </View>
                                            :
                                            null
                                    }
                                </View>
                            </View>
                    }
                </View>
            );
        }
    }

    _toOptionListPage(widgetInfo, editable) {
        if (!editable) {
            return;
        }
        const onPress = widgetInfo.onPress;
        if (onPress) {
            onPress(widgetInfo);
        } else {
            // const editStyle = widgetInfo.coleditstyle.toLowerCase();
            let options = widgetInfo.options || [];
            let needRequest = true;
            // needRequest = options.length == 0;
            // switch (editStyle) {
            //     case 'province':
            //         options = ProvinceCityAreas.getProvinces();
            //         needRequest = false;
            //         break;
            //     case 'city':
            //         let province = {
            //             itemno: this.state.pageInfo.province.itemno,
            //             itemname: this.state.pageInfo.province.itemname,
            //         };
            //         options = ProvinceCityAreas.getCitysByProvince(province);
            //         needRequest = false;
            //         break;
            // }
            this.props.navigator.push({
                id: 'OptionListPage',
                comp: OptionListPage,
                param: {
                    options: options,
                    title: widgetInfo.display || widgetInfo.colheader,
                    optionInfo: widgetInfo,
                    callback: this._onListItemSelected,
                    needRequest: needRequest,
                    sourceType: 'coleditsourcetype',
                    source: 'coleditsource',
                    key: 'itemno',
                    value: 'itemname',
                }
            });
        }
    }

    _renderRightSelect() {
        return (
            <View
                style={{paddingLeft: 10,}}
            >
                <Icon
                    name='angle-right'
                    size={25}
                    style={{
                        color: '#666',
                    }}
                />
            </View>
        );
    }

    _onListItemSelected(condition, value) {
        this._onValueChanged(condition, value);
    }

    _renderTreeList(widgetInfo, editable, required) {
        let fieldName = this._getFieldName(widgetInfo);
        if (this.isFiledNameNull(fieldName)) {
            return null;
        } else {
            const value = widgetInfo.value;
            const displayValue = editable ? (value ? value : EMPTY_LIST_VALUE) : value;
            return (
                <View
                    style={{
                        backgroundColor: 'white',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: ITEM_PADDING_VERTICAL,
                        paddingHorizontal: 0,
                        borderBottomColor: 'gray', borderBottomWidth: 0,
                        borderRadius: BORDER_RADIUS,
                    }}>
                    {this._renderLeftTitle(fieldName, required)}
                    <View
                        style={{
                            flex: 1, flexDirection: 'row', paddingHorizontal: 10,
                            justifyContent: 'space-between', alignItems: 'center',
                        }}
                    >
                        <Text style={{
                            color: '#aaa', flex: 1, textAlign: 'right', paddingRight: 5,
                        }} ellipsizeMode={'tail'}
                              numberOfLines={1}>{displayValue}</Text>
                        {
                            editable ?
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={ () => {
                                        dismissKeyboard();
                                        this._toTreeListPage(widgetInfo);
                                    }}>
                                    {/*<View style={{padding: 5, backgroundColor: '#3877bc', borderRadius: 5,}}>*/}
                                    {/*<Text style={{fontSize: 15, color: 'white',}}>选择</Text>*/}
                                    {/*</View>*/}
                                    {this._renderRightSelect()}
                                </TouchableOpacity>
                                :
                                null
                        }
                    </View>
                </View>
            );
        }
    }

    _toTreeListPage(widgetInfo) {
        const onPress = widgetInfo.onPress;
        if (onPress) {
            onPress(widgetInfo);
        } else {
            // this.props.navigator.push({
            //     id: 'TreeListPage',
            //     comp: TreeListPage,
            //     param: {
            //         title: widgetInfo.display,
            //         optionInfo: widgetInfo,
            //         callback: this._onListItemSelected,
            //         needRequest: true,
            //         sourceType: 'coleditsourcetype',
            //         source: 'coleditsource',
            //         key: 'itemno',
            //         value: 'itemname',
            //     }
            // });
        }
    }

    _renderDatePicker(widgetInfo, editable, required) {
        let fieldName = this._getFieldName(widgetInfo);
        if (this.isFiledNameNull(fieldName)) {
            return null;
        } else {
            let value = widgetInfo.value;
            value = value ? DateHelper.df(value, 'yyyy/mm/dd') : '';
            value = editable ? (value ? value : EMPTY_PLEASE_SELECT_DATE) : value;
            return (
                <View style={{
                    flexDirection: 'row',
                    paddingVertical: ITEM_PADDING_VERTICAL,
                    paddingHorizontal: 0,
                    borderBottomColor: 'gray',
                    backgroundColor: 'white',
                    borderBottomWidth: 0,
                    alignItems: 'center',
                    borderWidth: 0,
                    borderColor: 'red',
                    borderRadius: BORDER_RADIUS,
                }}>
                    {this._renderLeftTitle(fieldName, required)}
                    <View
                        style={{
                            flex: 1, flexDirection: 'row', paddingHorizontal: 10,
                            justifyContent: 'space-between', alignItems: 'center',
                        }}
                    >
                        <Text style={{
                            color: '#666', flex: 1, textAlign: 'right',
                        }} ellipsizeMode={'tail'}
                              numberOfLines={1}>{value}</Text>
                        {
                            editable ?
                                <TouchableOpacity style={{borderWidth: 0, borderColor: 'green',}}>
                                    <DatePicker
                                        style={{flexWrap: 'wrap', borderColor: 'red', borderWidth: 0, width: 30,}}
                                        date={widgetInfo.value}
                                        mode="date"
                                        showIcon={true}
                                        format="YYYY/MM/DD"
                                        minDate="1900/01/01"
                                        maxDate="2100/12/31"
                                        confirmBtnText="确定"
                                        cancelBtnText="取消"
                                        customStyles={{
                                            dateInput: {
                                                alignItems: 'flex-start',
                                                justifyContent: 'flex-start',
                                                height: ITEM_HEIGHT,
                                                borderWidth: 0,
                                                borderColor: 'yellow',
                                            },
                                            dateText: {
                                                fontSize: 0,
                                                color: 'transparent',
                                            },
                                            dateTouchBody: {
                                                height: 30,
                                                width: 30,
                                                borderColor: 'blue',
                                                borderWidth: 0,
                                            },
                                            dateIcon: {
                                                width: 25,
                                                height: 25,
                                                marginLeft: 0,
                                                marginRight: 0
                                            },
                                        }}
                                        onDateChange={(dateStr, date) => this._onValueChanged(widgetInfo, date)}
                                    />
                                </TouchableOpacity>
                                :
                                null
                        }
                    </View>
                </View>
            );
        }
    }

    _onValueChanged(widgetInfo, value) {
        const newWidgetInfo = {
            ...widgetInfo,
        };
        const itemno = value.itemno;
        if (itemno) {
            newWidgetInfo.itemno = value.itemno;
            newWidgetInfo.value = value.itemname;
        } else {
            newWidgetInfo.itemno = value;
            newWidgetInfo.value = value;
        }
        //忽略无效值
        if (!CommonFunc.isValidate(newWidgetInfo)) {
            return;
        }
        this._onSetState(newWidgetInfo);
    }

    _onSetState(newWidgetInfo) {
        if (this.props.onSetState) {
            this.props.onSetState(newWidgetInfo);
        }
    }

    _renderWidgets(widgetInfo) {
        const type = widgetInfo.coleditstyle.toLowerCase();
        const required = widgetInfo.colrequired == '1';
        const editable = this.props.editable && widgetInfo.colreadonly != '1';
        const visible = widgetInfo.colvisible == '1';
        const colname = widgetInfo.colname;
        if (visible) {
            let child = null;
            switch (type) {
                case 'text':
                    child = this._renderText(widgetInfo, editable, required, 1,);
                    break;
                case 'textarea':
                    child = this._renderTextArea(widgetInfo, editable, required, 2);
                    break;
                case 'combobox':
                case 'flatselect':
                case 'select':
                case 'radiobox':
                case 'province':
                case 'checkbox':
                case 'city':
                    child = this._renderOptionList(widgetInfo, editable, required);
                    break;
                case 'date':
                case 'daterange':
                    child = this._renderDatePicker(widgetInfo, editable, required);
                    break;
                case 'tree':
                    child = this._renderTreeList(widgetInfo, editable, required);
                    break;
                default:
                    return null;
            }
            if (child) {
                let content = child;
                if (!editable) {
                    const title = this._getFieldName(widgetInfo);
                    const msg = widgetInfo.value || '';
                    content = (
                        <TouchableOpacity
                            style={{flex: 1,}}
                            activeOpacity={0.6}
                            onPress={()=>CommonFunc.alert(msg, null, title)}
                        >
                            {child}
                        </TouchableOpacity>
                    );
                }
                return <View
                    style={{borderBottomColor: '#E4E7F0', borderBottomWidth: 1,}}>{content}</View>
            }
        }
        return null;
    }

    _calculateContents(widgets, groups) {
        let showGroup = groups.length > 1;
        const groupIds = {};//数组转对象
        const visibleKeys = [];//显示的字段名字
        groups.forEach(groupInfo => {
            groupIds[groupInfo.dockid] = {groupid: groupInfo.dockid, groupname: groupInfo.dockname, columns: []};
        });
        for (let key in widgets) {
            let widgetInfo = widgets[key];
            const visible = widgetInfo.colvisible == '1';
            if (visible) {
                visibleKeys.push(key);
                const groupid = widgetInfo.groupid;
                const groupInfo = groupIds[groupid];//字段可显示，标记group可显示，并添加到该group下
                if (groupInfo) {
                    groupInfo.show = true;
                    groupInfo.columns.push(key);
                }
            }
        }
        return {showGroup: showGroup, groups: groupIds, visibleKeys: visibleKeys};
    }

    _renderGroupTitle(groupTitle, groupKey) {
        return (
            <Text
                key={'group-' + groupKey}
                style={{
                    backgroundColor: '#F1F2F7',
                    padding: 14,
                    color: '#B40000',
                }}>{groupTitle}</Text>
        );
    }

    _renderChildren(keyArr, widgets, retChildren) {
        keyArr.forEach(widgetKey => {
            let widgetInfo = widgets[widgetKey];
            let child = this._renderWidgets(widgetInfo);
            if (child) {
                retChildren.push(<View key={widgetInfo.colname}
                                       style={{
                                           borderBottomColor: '#E4E7F0',
                                           borderBottomWidth: 0.5,
                                       }}>{child}</View>);
            }
        });
    }

    _renderContent() {
        const {style, widgets, groups} = this.props;
        const calcResult = this._calculateContents(widgets, groups);
        const showGroup = calcResult.showGroup;
        const groupObj = calcResult.groups;
        let visibleKeys = calcResult.visibleKeys;
        const children = [];
        let groupTitleView = null;
        if (!showGroup) {
            this._renderChildren(visibleKeys, widgets, children);
        } else {
            for (let groupId in groupObj) {
                const groupInfo = groupObj[groupId];
                const groupTitle = groupInfo.groupname;
                let groupVisibleKeys = groupInfo.columns;
                const show = groupInfo.show;
                if (show) {
                    groupTitleView = this._renderGroupTitle(groupTitle, groupId);
                    children.push(groupTitleView);
                }
                this._renderChildren(groupVisibleKeys, widgets, children);
            }
        }
        return (
            <View style={[{backgroundColor: 'white',}, style]}>
                {children}
            </View>
        );
    }

    render() {
        return this._renderContent();
    }
}