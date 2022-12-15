/**
 * Created by cui on 11/3/16.
 */

import AppDispatcher from '../dispatcher/AppDispatcher';
import CommonLink from '../modules/CommonLink';
import AppConstants from '../constants/AppConstants'
import BaseActions from './BaseActions';

import DES from '../modules/des';
const encryptKeys = {
    firstKey: '0123456789abc',
    secondKey: '1234567890abc',
    thirdKey: '1234567890!@#',
};

const _encryptData = (data) => {
    const encodedData = DES.encrypt(data, encryptKeys.firstKey, encryptKeys.secondKey, encryptKeys.thirdKey);
    return encodedData;
};

const _login = (params, callback, failure) => {
    const encodedPassWord = _encryptData(params.password);
    const requestUrl = CommonLink.login(params.username, encodedPassWord, params.psttype, params.regId, params.devType);
    const sFunc = (response)=> {
        const password = params.psttype == 'common' ? params.password : '';
        AppDispatcher.dispatch({
            actionType: AppConstants.LOGIN,
            data: {...response, hostUrl: CommonLink.returnHostUrl(), password: password,},
        });
        callback(response);
    };
    return BaseActions.getAction(requestUrl, sFunc, failure);
};

const _updateLogRegid = (params, callback, failure) =>{
    const requestUrl = CommonLink.updateLogRegid(params.userid, params.regId, params.devType);
    return BaseActions.getAction(requestUrl, callback, failure);
}

const _getGestureInfo = (params, callback, failure) => {
    const requestUrl = CommonLink.getEnableGesture(params.userid);
    return BaseActions.getAction(requestUrl, callback, failure);
};

const _updateGesture = (params, callback, failure) => {
    const encodedGesturePwd = _encryptData(params.gesturePwd);
    const requestUrl = CommonLink.updateGesturePassword(params.userid, encodedGesturePwd);
    return BaseActions.getAction(requestUrl, callback, failure);
};

const _updateGestureStatus = (params, callback, failure) => {
    const requestUrl = CommonLink.updateGestureStatus(params.userid, params.enablegesture);
    return BaseActions.getAction(requestUrl, callback, failure);
};

const _updateLogPwd = (params, callback, failure) => {
    const oldPwd = _encryptData(params.oldPwd);
    const newPwd = _encryptData(params.newPwd);
    const requestUrl = CommonLink.updateLogPwd(params.userid, oldPwd, newPwd);
    return BaseActions.getAction(requestUrl, callback, failure);
};

const _fetchLogOut = (param, callback, failure) => {
    const requestUrl = CommonLink.fetchLogOut();
    const sFunc = (res)=> {
        AppDispatcher.dispatch({
            actionType: AppConstants.LOGOUT,
            data: res,
        });
        callback(res);
    };
    return BaseActions.getAction(requestUrl, sFunc, failure);
};

const _fetchAppVersionInfo = (param, callback, failure) => {
    const requestUrl = CommonLink.fetchAppVersionInfo(param.devOs, param.versionCode);
    return BaseActions.getAction(requestUrl, callback, failure);
};

const _getPermission = (param,callback,failure) => {
    const requestUrl = CommonLink.getPermission(param.userid);
    console.log("yhf  requestUrl = "+requestUrl);
    return BaseActions.getAction(requestUrl, callback, failure);
}
const LoginActions = {
    login: _login,
    updateLogRegid: _updateLogRegid,
    getGestureInfo: _getGestureInfo,
    updateGesture: _updateGesture,
    updateLogPwd: _updateLogPwd,
    updateGestureStatus: _updateGestureStatus,
    getLogOut: _fetchLogOut,
    fetchAppVersionInfo: _fetchAppVersionInfo,
    getPermission :_getPermission,
};

module.exports = LoginActions;
