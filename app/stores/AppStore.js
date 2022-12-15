/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * TodoStore
 */
/* eslint-disable camelcase */
const AppDispatcher = require('../dispatcher/AppDispatcher');
const EventEmitter = require('events').EventEmitter;
const AppConstants = require('../constants/AppConstants');
const _ = require('lodash');
const LocalKeyStore = require('../stores/LocalKeyStore');
import EventDic from '../modules/eventDic';
import CommonLink from '../modules/CommonLink';

const {
    DEFAULT_EVENT,
    USER_CHANGE,
    REFRESH_DATA,
    REFRESH_DATA_READ
} = EventDic;

const STORAGE_KEY_PROFILE = '@AS:profile';

let _init_state = false;
let _is_loading_visible = false;
let _is_force_logout = false;
let _is_Login_out = false;
const _data = {};
let mainParam = {};

const AppStore = _.assign({}, EventEmitter.prototype, EventEmitter.prototype._maxListeners = 30, {

    emitChange(event = DEFAULT_EVENT, payload) {
        this.emit(event, payload);
    },

    addChangeListener(callback, event = DEFAULT_EVENT) {
        this.on(event, callback);
    },

    removeChangeListener(callback, event = DEFAULT_EVENT) {
        this.removeListener(event, callback);
    },
    autoLogin: () => _data.autoLogin,
    getUserID: () => (_data.user && _data.user.userid) || _data.userId || '',
    getPassword: () => _data.password,
    getInitState: () => _init_state,
    getUserName: () => (_data.user && _data.user.loginid) || _data.username || '',
    getHostUrl: () => _data.hostUrl || CommonLink.returnHostUrl() || '',
    getRealName: () => (_data.user && _data.user.username) || _data.realname || '',
    getToken: () => _data.token || '',
    getUser: () => _data.user || {},
    isForceLogout: () => _is_force_logout || _data._is_force_logout,
    isLoadingVisible: () => _is_loading_visible,
    isLoginOut: () => _is_Login_out || _data._is_Login_out,
    getMainParam: ()=> mainParam || {},
    setMainParam: (p) => {mainParam = p},
});


// Private Functions
const _initProfile = () => {
    _init_state = true;
    LocalKeyStore.getKey(STORAGE_KEY_PROFILE, (error, data) => {
        if (data) {
            _.assign(_data, data, {
                token: null
            });
        }
        _init_state = false;
        AppStore.emitChange();
    });
};

//修改密码后操作，取消自动登录
const _modifyPwd = (data) => {
    _data.autoLogin = false;
    const newData = _.assign({},_data, {
        autoLogin: false,
    });
    LocalKeyStore.setKey(STORAGE_KEY_PROFILE, newData);
};

const _login = (data) => {
    _.assign(_data, {
        username: data.loginid,
        userId: data.userid,
        realname: data.username,
        token: data.token,
        user: data,
        password: data.password,
        autoLogin: true,
        _is_Login_out: false,
        _is_force_logout: false,
        hostUrl: data.hostUrl,
    });
    LocalKeyStore.setKey(STORAGE_KEY_PROFILE, _data);
};

const _logout = () => {
    _data.token = null;
    _data.user = null;
    _data.password = '';
    _data.autoLogin = true;
    _data._is_Login_out = true;
    _data._is_force_logout = false;
    _is_Login_out = true;
    _is_force_logout = false;
    LocalKeyStore.setKey(STORAGE_KEY_PROFILE, _data);
};

const _forceLogout = () => {
    _data.token = null;
    _data.user = null;
    _data.password = '';
    _data.autoLogin = true;
    _data._is_Login_out = true;
    _data._is_force_logout = true;
    _is_Login_out = true;
    _is_force_logout = true;
    LocalKeyStore.setKey(STORAGE_KEY_PROFILE, _data);
};

const _getGeneralStatementData = (data) => {
    _.assign(_data, {
        datas: data.datas,
        header: data.header
    });
    return _data
};

// Register callback to handle all updates
AppDispatcher.register((action) => {
    console.log('AppDispatcher.register--------------------');
    console.log(action);
    switch (action.actionType) {
        case AppConstants.INIT_PROFILE:
            _initProfile();
            break;
        case AppConstants.INIT_LOGIN:
            _is_force_logout = false;
            break;

        case AppConstants.LOADING_SHOW:
            _is_loading_visible = true;
            AppStore.emitChange();
            break;
        case AppConstants.LOADING_HIDE:
            _is_loading_visible = false;
            AppStore.emitChange();
            break;

        case AppConstants.LOGIN:
            _login(action.data);
            // AppStore.emitChange(USER_CHANGE);
            break;

        case AppConstants.LOGOUT:
            _logout();
            AppStore.emitChange(USER_CHANGE);
            break;
        case AppConstants.PWD_CHANGED:
            _modifyPwd(action.data);
            break;
        case AppConstants.FORCE_LOGOUT:
            _forceLogout();
            AppStore.emitChange(USER_CHANGE);
            break;
        case AppConstants.REFRESH_DATA_READ://刷新传阅数据
            AppStore.emitChange(REFRESH_DATA_READ);
            break;
        case AppConstants.REFRESH_DARA://通用数据刷新
            AppStore.emitChange(REFRESH_DATA);
            break;

        case AppConstants.FETCH_GENERAL_STATEMENT:
            _getGeneralStatementData(action.data);
            AppStore.emitChange();
        default:
            AppStore.emitChange(action.actionType, action.data);

    }
});

module.exports = AppStore;

