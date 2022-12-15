/**
 * Created by edz on 2017/11/9.
 */

import {
    Alert,
    Linking,
    InteractionManager,
} from 'react-native';
import DateHelper from '../../modules/dateHelper';
// import DataChecker from '../../modules/checkDataValidate';
const hasOwn = Object.hasOwnProperty;
import EventDic from '../../modules/eventDic';
import AppStore from '../../stores/AppStore';
import AppDispatcher from '../../dispatcher/AppDispatcher';
let showLog = false;
const checkAllFormat = true;//各种设置值，都检查显示格式
const DATE_FORMAT = 'yyyy/mm/dd';
import CommonLink from '../../modules/CommonLink';
import Orientation from 'react-native-orientation';
const ORIENTATION_PORTRAIT = 'portrait'; // 竖屏
const ORIENTATION_LANDSCAPE = 'landscape'; // 横屏
let orientation = ORIENTATION_PORTRAIT ; // [ portrait | landscape ]
/**
 * 动态页面参数获取、校验
 * @param checkObj
 * @param checkRequire
 * @returns {{showAlert: boolean, alertMsg: string, returnObj: {}}}
 * @private
 */
const _getDynamicValuesAndCheck = (checkObj, checkRequire = true) => {
    let showAlert = false;
    let msg = '';
    let checkMsg = '';
    let alertMsg = '';
    let returnObj = {};
    for (let key in checkObj) {
        const itemInfo = checkObj[key];
        const required = checkRequire && itemInfo.colrequired == '1';
        const colvisible = checkRequire && itemInfo.colvisible == '1';
        const editStyle = itemInfo.coleditstyle ? itemInfo.coleditstyle.toLowerCase() : '';
        const filedName = itemInfo.display || itemInfo.colheader;
        //忽略无效值，空值、0值通过
        let value = itemInfo.itemno === '' ? '' : (itemInfo.itemno === '0' ? '0' : (itemInfo.itemno || ''));
        //1、必填性校验
        if (required && colvisible && !value) {
            showAlert = true;
            msg += msg ? ('，' + filedName) : ('【' + filedName);
        }
        const colreadonly = itemInfo.colreadonly == '1';
        // const onCheck = itemInfo.onCheck;
        const needCheck = value && colvisible && !colreadonly;//非空、可见、可编辑
        // if (value && onCheck && !onCheck(value) || (needCheck && !_checkContent(itemInfo, required))) {//校验不通过
        //2、规则校验
        if (needCheck && !_checkContent(itemInfo, required)) {//校验不通过
            showAlert = true;
            checkMsg += checkMsg ? ('，' + filedName) : ('【' + filedName);
        }
        if (editStyle.indexOf('date') > -1) {
            value = value ? DateHelper.df(value, DATE_FORMAT) : '';
        }
        returnObj[key] = value;
    }
    msg += msg ? ('】为必填项，请填写！') : '';
    checkMsg += checkMsg ? ('】格式不正确，请检查！') : '';
    alertMsg = msg ? msg : '';
    alertMsg += alertMsg ? '' : checkMsg;
    const ret = {showAlert: showAlert, alertMsg: alertMsg, returnObj: returnObj};
    return ret;
};

/**
 * 静态字段获取、校验
 * @param checkObj
 * @param checkRequire
 * @returns {{showAlert: boolean, alertMsg: string, returnObj: {}}}
 * @private
 */
const _getStaticValuesAndCheck = (checkObj, checkRequire = true) => {
    let showAlert = false;
    let msg = '';
    let returnObj = {};
    for (let key in checkObj) {
        const value = checkObj[key];
        if (checkRequire && !value) {
            showAlert = true;
            msg += msg ? ('，' + key) : ('【' + key);
        }
        returnObj[key] = value;
    }
    msg += msg ? ('】，为必填项，请填写！') : '';
    const ret = {showAlert: showAlert, alertMsg: msg, returnObj: returnObj};
    return ret;
};

const _handlePageData = (pageArr, keyCode = 'code', convertDate: true, handleDefaultVal: false, handleKNumber = false) => {
    const pageInfo = {};
    pageArr.forEach(itemInfo => {
        let editStyle = itemInfo.coleditstyle;
        editStyle = editStyle ? editStyle : 'Text';
        itemInfo.coleditstyle = editStyle;
        editStyle = editStyle.toLowerCase();
        let colname = itemInfo[keyCode];
        if (colname) {
            if (editStyle.indexOf('date') > -1 && convertDate) {
                let value = itemInfo.value;
                value = value ? new Date(value) : '';
                itemInfo.itemno = value;
            }
            //TODO:处理显示数字格式
            _handleCheckFormat(itemInfo);
            if (handleKNumber) {
                itemInfo.value = _formatKNumber(itemInfo);
            }
            if (handleDefaultVal) {
                const defVal = itemInfo.coldefaultvalue;
                const originVal = itemInfo.itemno;
                if (!originVal && defVal) {
                    itemInfo.itemno = defVal;
                    itemInfo.value = defVal;
                }
            }
            pageInfo[colname] = itemInfo;
        }
    });
    return pageInfo;
};
const _handlePostParam = (postParam, paramKeys, listData)=> {
    paramKeys.forEach(paramKey => {
      // 以@@分割需要替换的参数 前面的为查找的参数名 后面的为传递的参数名
      const keysArr = paramKey.split('@@')||[];
      let firstKey,lastKey;
      if (keysArr.length == 2) {
        firstKey = keysArr[0];lastKey = keysArr[1];
      }else{
        firstKey = lastKey = paramKey;
      }
      let temp = __getValue(listData, firstKey,'itemno');
        if (temp) {
          postParam[lastKey] = temp;
        }
    });
    return paramKeys;
  }

//处理显示格式问题
const _handleCheckFormat = (widgetInfo) => {
    const colType = widgetInfo.coltype ? (widgetInfo.coltype.toLowerCase() || '') : '';
    const originItemno = widgetInfo.itemno;
    const colheader = widgetInfo.colheader || widgetInfo.display;
    let converteVal = originItemno;
    const checkFormat = widgetInfo.colcheckformat;
    let isNumber = false;
    const editStyle = widgetInfo.coleditstyle ? (widgetInfo.coleditstyle.toLowerCase() || '') : '';
    const colname = widgetInfo.colname || widgetInfo.code || '';
    const needSetValue = __needSetValue(editStyle);
    let logMsg = '字段名:' + colheader + '--->colname:' + colname + '--->coltype:' + colType + '--->editStyle:' + editStyle + '--->needSetValue:' + needSetValue + '--->checkFormat:' + checkFormat + '--->originVal:' + originItemno + '--->formatVal:';
    switch (checkFormat) {
        case '1'://字符串
            break;
        case '2'://数字
        case '14'://小数点后4位
        case '16'://小数点后6位
        {
            let precision = checkFormat == 2 ? 2 : checkFormat - 10;
            if (converteVal || converteVal == 0) {//非空值
                converteVal = _toFixedPrecision(originItemno, precision);
            }
            isNumber = true;
        }
            break;
        case '3'://日期
            break;
        case '4'://时间
            break;
        case '5'://整数
        {
            if (converteVal || converteVal == 0) {//非空值
                converteVal = parseInt(originItemno);
            }
            isNumber = true;
        }
            break;
    }
    if (isNumber) {
        if (needSetValue || widgetInfo.itemno == widgetInfo.value) {//需要设置value值
            widgetInfo.value = converteVal;
        }
        widgetInfo.itemno = converteVal;
    }
    //字符显示问题
    if (originItemno == null || originItemno == 'null') {
        widgetInfo.itemno = '';
        widgetInfo.value = '';
    }
};

//处理显示格式问题
const _handlePageFormat = (pageInfo) => {
    for (let key in pageInfo) {
        const widgetInfo = pageInfo[key];
        _handleCheckFormat(widgetInfo);
    }
};

//根据控件类型、判断是否需要设置转换数值
const __needSetValue = (colEditStyle) => {
    let needConvert = false;
    switch (colEditStyle) {
        //编辑框类型
        case 'text':
        case 'textarea':
            needConvert = true;
            break;
        //选择框类型
        case 'combobox':
        case 'flatselect':
        case 'select':
        case 'radiobox':
        case 'province':
        case 'city':
            break;
        //日期类型
        case 'date':
        case 'daterange':
            break;
        //树型图类型
        case 'tree':
            break;
    }
    return needConvert;
};

const _handleArr2Obj = (arrData, keyOfKey = 'code') => {
    const retObj = {};
    for (let idx in arrData) {
        const fieldObj = arrData[idx];
        const key = fieldObj[keyOfKey];
        retObj[key] = fieldObj;
    }
    return retObj;
};

const _handleListDatas = (originDataArr, keyOfKey = 'code', handleKNumber = true) => {
    const handledDataArr = [];
    for (let idx in originDataArr) {
        const itemObj = originDataArr[idx];
        const listItemObj = _handlePageData(itemObj.list_data || [], keyOfKey, false, false, handleKNumber);
        const detailItemData = _handlePageData(itemObj.detail_data || [], keyOfKey, false);
        handledDataArr.push({listData: listItemObj, detailData: detailItemData});
    }
    return handledDataArr;
};

const _alert = (msg, func = null, title = '提示',) => {
    title = '' + title
    msg = '' + msg
    Alert.alert(
        title,
        msg,
        [
            {
                text: '确定', onPress: () => {
                if (func) {
                    func();
                }
            }
            },
        ]
    );
};

const _confirm = (msg, confirmAction, title = '提示') => {
    Alert.alert(
        title,
        msg,
        [
            {text: '确定', onPress: confirmAction},
            {text: '取消',},
        ],
    );
};

const _confirmMsg = (msg, confirmInfo = null, cancelInfo = null, title = null) => {
    const hasConfirmAction = !!confirmInfo, hanCancelAction = !!cancelInfo;
    const actions = [
        {
            text: '确定', onPress: ()=> {
        }
        },
        {
            text: '取消', onPress: ()=> {
        }
        }
    ];
    if (hasConfirmAction) {
        actions[0].text = confirmInfo.text;
        actions[0].onPress = confirmInfo.onPress;
    }
    if (hanCancelAction) {
        actions[1].text = cancelInfo.text;
        actions[1].onPress = cancelInfo.onPress;
    }
    Alert.alert(
        title,
        msg,
        actions
    )
};

const _getValueByKeyArr = (obj, keyArr, undefinedToEmptyStr = true, throwErr = false) => {
    let ret = obj;
    keyArr.forEach(key => {
        let findKey = undefined;
        if (ret) {
            findKey = Object.keys(ret).find(_key => _key.toLowerCase() == key.toLowerCase());
        }
        // const findKey = Object.keys(ret).find(_key => _key.toLowerCase() == key.toLowerCase());
        //快速失效机制
        ret = findKey === undefined ? undefined : ret;
        if (ret != undefined && ret != null && typeof ret === 'object') {
            ret = ret[findKey];
        } else {
            if (throwErr) {
                throw ('keyArr:' + keyArr + ',不存在的key:' + key);
            } else {
                ret = undefined;
            }
        }
    });
    ret = undefinedToEmptyStr ? (!ret ? '' : ret) : ret;
    return ret;
};
const digitReg = /^\d*(\.\d{0,6})?$/;
const zeroCheck = /^[0]{2,}.*/;
const _isNumber = (value, regExp = digitReg) => {
    return regExp.test(value) && !zeroCheck.test(value);
};

//通用输入内容格式校验，电话、整数
const _checkFormat = (widgetInfo) => {
    let validate = true;
    const inputType = (widgetInfo.inputType || '').toLowerCase();
    const value = widgetInfo.itemno || '';
    switch (inputType) {
        case 'telephone':
            validate = /^\d{0,11}$/g.test(value);
            break;
        case 'integer':
            validate = /^\d*$/g.test(value);
            break;
    }
    return validate;
};

const _checkContent = (widgetInfo, required) => {
    // if (!required) {
    //     return true;
    // }
    let validate = true;
    const inputType = (widgetInfo.inputType || '').toLowerCase();
    const value = widgetInfo.itemno || '';
    switch (inputType) {
        case 'telephone'://手机号
            validate = /^1\d{10,10}$/g.test(value);
            break;
        // case 'idnumber'://身份证号
        //     validate = DataChecker.CheckLicense(value);
        //     break;
        // case 'socialcreditidentifier'://统一社会信用代码
        //     validate = DataChecker.checkSocialCreditIdentifier(value);
        //     break;

    }
    return validate;
};

const _isValidate = (widgetInfo) => {
    const baseType = (widgetInfo.basetype || 'string').toLowerCase();
    const value = widgetInfo.itemno || '';
    let validate = false;
    //输入类型校验，普通、数字
    switch (baseType) {
        case 'string':
        case 'default':
            validate = true;
            break;
        case 'number':
            validate = _isNumber(value);
            break;
    }
    validate = validate ? _checkFormat(widgetInfo) : validate;
    return validate;
};

const _isValidates = (widgets) => {
    for (let key in widgets) {
        if (!_isValidate(widgets[key])) {
            return false;
        }
    }
    return true;
};

const _assignObj = (dest, source) => {
    for (let key in source) {
        dest[key] = source[key];
    }
    return dest;
};

const _create = () => {
    let retObj = Object.create(null);
    return retObj;
};
const COL_REQUIRED = 'colrequired';
const _setRequired = (pageInfo, colname, required) => {
    _setCommonValue(pageInfo, colname, COL_REQUIRED, required ? '1' : '0', false);
};

const _isRequired = (pageInfo, colname) => {
    return _getValueByKeyArr(pageInfo, [colname, COL_REQUIRED]) == '1';
};

const _setMultiRequired = (pageInfo, cols, required) => {
    cols.forEach(colname => {
        _setRequired(pageInfo, colname, required);
    });
};
const COL_READONLY = 'colreadonly';
const _setReadOnly = (pageInfo, colname, readonly) => {
    _setCommonValue(pageInfo, colname, COL_READONLY, readonly ? '1' : '0', false);
};

const _isReadOnly = (pageInfo, colname) => {
    return __getValue(pageInfo, colname, COL_READONLY) == '1';
};

const _setMultiReadonly = (pageInfo, cols, readonly) => {
    cols.forEach(colname => {
        _setReadOnly(pageInfo, colname, readonly);
    });
};
const COL_VISIBLE = 'colvisible';
const _setVisible = (pageInfo, colname, visible) => {
    _setCommonValue(pageInfo, colname, COL_VISIBLE, visible ? '1' : '0', false);
};

const _isVisible = (pageInfo, colname) => {
    return _getValueByKeyArr(pageInfo, [colname, COL_VISIBLE]) == '1';
};

//字段显示属性
const _isItemVisible = (fieldObj)=> {
    return _getValueByKeyArr(fieldObj, [COL_VISIBLE]) == '1';
}

const __getValue = (pageInfo, colname, subKey) => {
    return _getValueByKeyArr(pageInfo, [colname, subKey]);
};

const _setMultiVisible = (pageInfo, cols, visible) => {
    cols.forEach(colname => {
        _setVisible(pageInfo, colname, visible);
    });
};

const _setValue = (pageInfo, colname, valObj = {itemno: '', value: ''}) => {
    const findColName = Object.keys(pageInfo).find(key => key.toLowerCase() == colname.toLowerCase());
    if (findColName === undefined) {
        return;
    }
    const widgetInfo = pageInfo[findColName];
    if (typeof widgetInfo == 'object') {
        _setDirectValue(widgetInfo, 'itemno', valObj.itemno);
        _setDirectValue(widgetInfo, 'value', valObj.value);
        if (checkAllFormat) {
            _handleCheckFormat(widgetInfo);
        }
    }
};

const _setSingleValue = (pageInfo, colname, val) => {
    _setValue(pageInfo, colname, {itemno: val, value: val});
};

const _setCommonValue = (pageInfo, colname, setKey, setVal, checkFormat = true) => {
    const findColName = Object.keys(pageInfo).find(key => key.toLowerCase() == colname.toLowerCase());
    if (findColName === undefined) {
        return;
    }
    const widgetInfo = pageInfo[findColName];
    const typeOf = typeof widgetInfo;
    if (typeOf == 'object') {
        widgetInfo[setKey] = setVal;
        if (checkAllFormat && checkFormat) {
            _handleCheckFormat(widgetInfo);
        }
    }
};

const _setDirectValue = (obj, colname, setVal) => {
    if (obj !== null && typeof obj == 'object') {
        const findColName = Object.keys(obj).find(key => key.toLowerCase() == colname.toLowerCase());
        if (findColName === undefined) {
            obj[colname] = setVal;
        } else {
            obj[findColName] = setVal;
        }
    }
};

const _setMultiValue = (pageInfo, cols, valObj = {itemno: '', value: ''}) => {
    cols.forEach(colname => {
        _setValue(pageInfo, colname, valObj);
    });
};

const _getCode = (pageInfo, colname) => {
    return __getValue(pageInfo, colname, 'itemno');
};

const _getValue = (pageInfo, colname) => {
    return __getValue(pageInfo, colname, 'value');
};

//pageInfo，用
const _copyObj = (sourceObj) => {
    const ret = {};
    for (let key in sourceObj) {
        if (hasOwn.call(sourceObj, key)) {

        }
    }
};

const _openUrl = (url) => {
    Linking.canOpenURL(url).then(support => {
        if (support) {
            Linking.openURL(url);
        }
    }).catch(error => {
        _alert('链接地址失效');
    });
};

const _downloadFile = (downloadId, confirm = false) => {
    const url = CommonLink.downloadAttachment(downloadId);
    if (confirm) {
        _confirm('确定下载吗', () => _openUrl(url));
    } else {
        _openUrl(url);
    }
};

const _goBack = (thisArg) => {
    if (thisArg) {
        thisArg.props.navigator.pop();
    }
};


const _goHome = (thisArg) => {
    if (thisArg) {
        return (function () {
            this.props.navigator.popToTop();
        }).bind(thisArg);
    }
};

const _cloneObj = (obj) => {
    var newObj = {};
    if (obj instanceof Array) {
        newObj = [];
    }
    for (var key in obj) {
        var val = obj[key];
        newObj[key] = typeof val === 'object' ? _cloneObj(val) : val;
    }
    return newObj;
};

const _makeActionType = (type) => {
    const actionType = EventDic.EVENT_PREFIX + type;
    return actionType;
};

const _dispatchActionType = (type, payload = null) => {
    const actionType = _makeActionType(type);
    const isDispatching = AppDispatcher.isDispatching();

    console.log(`_dispatchActionType:>>>${isDispatching}--->actionType:${actionType}--->payload:${payload}`);
    if (!isDispatching) {
        AppDispatcher.dispatch({actionType: actionType, data: payload});
    } else {
        InteractionManager.runAfterInteractions(()=> {
            AppDispatcher.dispatch({actionType: actionType, data: payload});
        });
    }
};

const _addListenerAndType = (listener, type) => {
    const actionType = _makeActionType(type);
    AppStore.addChangeListener(listener, actionType);
};

const _removeListenerAndType = (listener, type) => {
    const actionType = _makeActionType(type);
    AppStore.removeChangeListener(listener, actionType);
};
//转换为固定精度显示
const _toFixedPrecision = (number, precision = 2, isPercentValue = false) => {
    if (!number || number == 0) {
        return parseFloat(0).toFixed(precision);
    }
    const tempNum = isPercentValue ? number * 100 : parseFloat(number);
    return tempNum.toFixed(precision);
};
//获取float值
const _getFloatValue = (number, precision = 6) => {
    if (!number || number == 0) {
        return '0.00';
    }
    const tempNum = parseFloat(number);
    return tempNum.toFixed(precision);
};
//比较日期
const _compareDate = (one, compareTo = new Date())=> {
    const date1 = new Date(one);
    const date2 = new Date(DateHelper.df(compareTo, DATE_FORMAT));
    return date1.getTime() - date2.getTime();
};

const _isEarlyFrom = (one, compareTo = new Date()) => {
    return _compareDate(one, compareTo) <= 0;
};

const _isZero = (text) => {
    const parsed = parseFloat(text || '0').toFixed(6);
    const zero = parsed === '0.000000';
    return zero;
};

const _getCheckResultMsg = (checkResultArr) => {
    let msg = '';
    let idx = 1;
    checkResultArr.forEach(itemInfo => {
        if (!itemInfo.sStatus) {
            let tempMsg = idx.toString() + '、' + itemInfo.sMsg;
            let errMsg = msg ? '\n' + tempMsg : tempMsg;
            msg += errMsg;
            idx++;
        }
    });
    return msg;
};

const __isNumber = (widgetInfo)=> {
    const colCheckFormat = widgetInfo.colcheckformat || '';
    const numArr = ['2', '5', '14', '16'];
    return numArr.some(format => format == colCheckFormat);
};

const __getFormatSize = (widgetInfo) => {
    const checkFormat = widgetInfo.colcheckformat;
    switch (checkFormat) {
        case '2':
            return 2;
        case '5':
            return 0;
        case '14':
        case '16':
            return checkFormat - 10;
        default:
            return 0;
    }
};

const __FormatKNumber = (number_, size) => {
    if (number_ == '' || number_ == '-' || number_ == '.-' || number_ == '-.' || number_ == '.') {
        return '';
    }

    let number = "";
    let orgsize = size;

    if (typeof(number_) == "number")
        number = number_ + "";
    else
        number = parseFloat(number_.replace(/,/g, ""), 10).toFixed(size + 1).toString();
    if (number == '')
        return '';

    let sPreChar = "";
    let sAfterChar = "";
    if (number.substring(0, 1) == "-") {
        sPreChar = "-";
        number = number.substring(1, number.length);
    }
    let str = number.toString();
    str = str.replace(',', '');

    //������ֵ�ԭʼλ��
    let oldSize = number.substring(number.indexOf(".") + 1, number.length).length;

    if (size == undefined || size < 0)
        size = oldSize;

    if (str.indexOf('.') > -1) {
        let dotFormat = "";
        for (let i = 0; i < size; i++)
            dotFormat += "#";
        let sResult = __formatNumber(str, '#,###.' + dotFormat);
        oldSize = sResult.substring(sResult.indexOf(".") + 1, sResult.length).length;
        for (let i = oldSize; i < size; i++)
            sAfterChar += "0";
        return sPreChar + sResult + sAfterChar;
    } else {
        let sResult = __formatNumber(str, '#,###');
        for (let i = 0; i < orgsize; i++) {
            if (i == 0)
                sAfterChar += ".0";
            else
                sAfterChar += "0";
        }
        return sPreChar + sResult + sAfterChar;
    }
};

const __formatNumber = (number, pattern) => { //��ʽ������
    if (isNaN(number)) return 0.00;
    let str = number.toString();
    let strInt;
    let strFloat;
    let formatInt;
    let formatFloat;
    if (/\./g.test(pattern)) {
        formatInt = pattern.split('.')[0];
        formatFloat = pattern.split('.')[1];
    } else {
        formatInt = pattern;
        formatFloat = null;
    }
    if (/\./g.test(str)) {
        if (formatFloat != null) {
            let tempFloat = Math.round(parseFloat('0.' + str.split('.')[1]) * Math.pow(10, formatFloat.length)) / Math.pow(10, formatFloat.length);
            strInt = (Math.floor(number) + Math.floor(tempFloat)).toString();
            strFloat = /\./g.test(tempFloat.toString()) ? tempFloat.toString().split('.')[1] : '0';
        } else {
            strInt = Math.round(number).toString();
            strFloat = '0';
        }
    } else {
        strInt = str;
        strFloat = '0';
    }
    if (formatInt != null) {
        let outputInt = '';
        let zero = formatInt.match(/0*$/)[0].length;
        let comma = null;
        if (/,/g.test(formatInt)) {
            comma = formatInt.match(/,[^,]*/)[0].length - 1;
        }
        let newReg = new RegExp('(\\d{' + comma + '})', 'g');
        if (strInt.length < zero) {
            outputInt = new Array(zero + 1).join('0') + strInt;
            outputInt = outputInt.substr(outputInt.length - zero, zero);
        } else {
            outputInt = strInt;
        }
        outputInt = outputInt.substr(0, outputInt.length % comma) + outputInt.substring(outputInt.length % comma).replace(newReg, (comma != null ? ',' : '') + '$1');
        outputInt = outputInt.replace(/^,/, '');
        strInt = outputInt;
    }
    if (formatFloat != null) {
        let outputFloat = '';
        let zero = formatFloat.match(/^0*/)[0].length;
        if (strFloat.length < zero) {
            outputFloat = strFloat + new Array(zero + 1).join('0');
            //outputFloat		= outputFloat.substring(0,formatFloat.length);
            let outputFloat1 = outputFloat.substring(0, zero);
            let outputFloat2 = outputFloat.substring(zero, formatFloat.length);
            outputFloat = outputFloat1 + outputFloat2.replace(/0*$/, '');
        } else {
            outputFloat = strFloat.substring(0, formatFloat.length);
        }
        strFloat = outputFloat;
    } else {
        if (pattern != '' || (pattern == '' && strFloat == '0')) {
            strFloat = '';
        }
    }
    return strInt + (strFloat == '' ? '' : '.' + strFloat);
};

//格式化数字为千分位显示
const _formatKNumber = (widgetInfo)=> {
    const isNumber = __isNumber(widgetInfo);
    const value = widgetInfo.value;
    if (!isNumber) {
        return value;
    } else {
        return __FormatKNumber(value, __getFormatSize(widgetInfo));
    }
};

const __changeOrientation = (change2Landscape) => {
    orientation = change2Landscape ? ORIENTATION_LANDSCAPE : ORIENTATION_PORTRAIT
    change2Landscape ? Orientation.lockToLandscape() : Orientation.lockToPortrait();
};

const _lockToPortrait = () => {
    __changeOrientation(false)
};

const _lockToLandscape = () => {
    __changeOrientation(true)
};

module.exports = {
    cloneObj: _cloneObj,
    getDynamicValuesAndCheck: _getDynamicValuesAndCheck,
    getStaticValuesAndCheck: _getStaticValuesAndCheck,
    isValidate: _isValidate,
    isValidates: _isValidates,
    assignObj: _assignObj,
    create: _create,
    handlePageData: _handlePageData,
    handleListDatas: _handleListDatas,
    handleArr2Obj: _handleArr2Obj,
    alert: _alert,
    confirm: _confirm,
    confirmMsg: _confirmMsg,
    getValueByKeyArr: _getValueByKeyArr,
    setRequired: _setRequired,
    isRequired: _isRequired,
    setMultiRequired: _setMultiRequired,
    setReadOnly: _setReadOnly,
    isReadOnly: _isReadOnly,
    setMultiReadonly: _setMultiReadonly,
    setVisible: _setVisible,
    isVisible: _isVisible,
    isItemVisible: _isItemVisible,
    setMultiVisible: _setMultiVisible,
    setValue: _setValue,
    setSingleValue: _setSingleValue,
    setCommonValue: _setCommonValue,
    setDirectValue: _setDirectValue,
    setMultiValue: _setMultiValue,
    getCode: _getCode,
    getValue: _getValue,
    showLog: showLog,
    openUrl: _openUrl,
    downloadFile: _downloadFile,
    goBack: _goBack,
    goHome: _goHome,
    makeActionType: _makeActionType,
    dispatchActionType: _dispatchActionType,
    addListenerAndType: _addListenerAndType,
    removeListenerAndType: _removeListenerAndType,
    toFixedPrecision: _toFixedPrecision,
    getFloatValue: _getFloatValue,
    handleCheckFormat: _handleCheckFormat,
    handlePageFormat: _handlePageFormat,
    isZero: _isZero,
    compareDate: _compareDate,
    isEarlyFrom: _isEarlyFrom,
    getCheckResultMsg: _getCheckResultMsg,
    formatKNumber: _formatKNumber,
    handlePostParam: _handlePostParam,
    lockToPortrait: _lockToPortrait,
    lockToLandscape: _lockToLandscape,
};