/**
 * Copyright 2016-08-29 pdms
 * @author gyli<gyli@amarsoft.com>
 */

import Qs from 'qs';
import MxFetch from './mxFetch';
import {
    NetInfo,
    Alert
} from 'react-native';

import AppDispatcher from '../dispatcher/AppDispatcher';
import AppConstants from '../constants/AppConstants';
import AppActions from '../actions/AppActions';
let netState = false;
//不传递到后台的字段值。
const deleteKeys = [/^inputuser(id)?$/i, /^inputorg(id)?$/i, /^inputtime$/i,
    /^updatetime$/i, /^updateorg(id)?$/i, /^updateuser(id)?$/i];

const _getHeader = () => {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;application/json;'
    };
};

const initNetworkState = () => {
    NetInfo.isConnected.addEventListener(
        'change',
        _handleConnectivityChange // eslint-disable-line
    );
    NetInfo.isConnected.fetch().done(
        (isConnected) => {
            netState = isConnected;
        }
    );
};

const _handleConnectivityChange = (isConnected) => {
    netState = isConnected;
};

/* eslint-disable */
const process = (_promise, networkState, option = {}, url) => { // eslint-disable-line
    return new Promise((resolve, reject) => {
        return _promise.then((response) => {

            const status = response.status;
            console.log("yhf status = "+status);
            switch (parseInt(status / 100)) {
                case 1:
                    console.log('session Http code:' + status + 'Informational');
                    break;
                case 2:
                    return response.text();
                case 3:
                    console.log('session Http code:' + status + 'Redirection');
                    break;
                case 4:
                    if (status === 401) {
                        throw {message: '用户名或密码错误'};
                    } else {
                        throw {message: '出错了，请稍后再试或联系管理员！'};
                    }
                    console.log('session Http code:' + status + ' Client Error');
                    break;
                case 5:
                    throw {message: '服务器出错了，请稍后再试或联系管理员！'};
                    console.log('session Http code:' + status + ' Server Error');
                    break;
                default:
                    throw {message: '未知错误，请稍后再试或联系管理员！'};
                    console.log('session Http code:' + status + ' Unknown Error');
                    break;
            }
        })
            .then((response) => {
                const json = JSON.parse(response);
                const header = json.header;
                const body = json.body;
                console.log(`返回数据----------->url：${url}`);


                console.log(json);

//                console.log('yhf header = ');
//                console.log(JSON.parse(header));
//                console.log('yhf body = ');
//                console.log(JSON.parse(body));
                const mcode = json.code;
                const msg = json.msg;
                console.log('yhf msg = ' + msg);
                console.log('yhf status = ' + response.status);

                console.log('yhf mcode = ' + json.code);

                let bodyIsEmpty = !json.hasOwnProperty("body");
                let headerIsEmpty = !json.hasOwnProperty("header");
                let anotherSuccess = (json.code == 200);
                console.log(' yhf anotherSuccess = ' + anotherSuccess);
                if (!json.hasOwnProperty("body")) {
                    console.log(' yhf no body');
                }
                if (!json.hasOwnProperty("header")) {
                    console.log('yhf no header');
                }

//返回数据格式不在下面逻辑下，所以抛出异常。。。
                if (response === '') {
                    resolve({});
                } else if (anotherSuccess || (!headerIsEmpty && header.code === 'SUCCESS')) {
                    console.log('yhf 1111');
                    if (anotherSuccess || (!bodyIsEmpty && body.outline.code === 'SUCCESS')) {
//                        let content;
                        if (anotherSuccess) {
//                        json.data是个数组，所以这里把 传输成功 的标志也一起传回去算了
//                            content = json;

                            let string = "{\"code\":\"200\",\"msg\":\"查询信息成功\"}";
                            let jsonString = '{"code":"200","msg":"查询信息成功"}';
                            var stringJson = JSON.parse(jsonString);
                            console.log('yhf 1111 fixedJson = ');
                            console.log(stringJson);
//                 resolve(stringJson);
                            resolve(json);
//                            resolve({});

                            console.log('yhf 1111content = ');
                            console.log(json);
                        } else {
                            let content = body.content || {};
                            resolve(content);
                            console.log('yhf 2222content = ');
                            console.log(content);
//                            content = body.content || {};
                        }
//                        console.log('yhf content = '+content);
//                        let content = body.content || {};
//                        resolve(content);
                    } else {
                        reject(body.outline.message);
                    }
                } else {
                    AppActions.dismissLoading();
                    if (header.code === '407') {
                    console.log('yhf 2222');
                        Alert.alert(
                            '提示',
                            '会话已过期,请重新登录',
                            [
                                {
                                    text: '重新登录',
                                    onPress: () => AppDispatcher.dispatch({actionType: AppConstants.FORCE_LOGOUT}),
                                    type: 'plain-text'
                                },
                                {
                                    text: '取消', onPress: () => {
                                }, style: 'cancel'
                                }
                            ]
                        );
                    } else if (header.code === '406') {
                    console.log('yhf 3333');
                        Alert.alert(
                            '提示',
                            '当前账号已在其他设备登陆,您已被迫下线!',
                            [
                                {
                                    text: '重新登录',
                                    onPress: () => AppDispatcher.dispatch({actionType: AppConstants.FORCE_LOGOUT}),
                                    type: 'plain-text'
                                },
                                {
                                    text: '取消', onPress: () => {
                                }, style: 'cancel'
                                }
                            ]
                        );
                    } else {
                    console.log('yhf 4444');
                        throw {message: header.message};
                    }
                }
            })
            .catch((error) => {
            console.log('yhf 5555 message = '+error.message);
                reject(error.message);
            });

    });
};


const rawFetch = (url, param, timeLimit = 6180, option) => {
    /* eslint-disable no-console */
    // console.log('以下打印一次传出去的param:');
    // console.log(param);
    // console.log('请求地址:' + url);
    /* eslint-enable */
    console.log(url);
    timeLimit = 60 * 1000;
    const _promise = Promise.race([MxFetch.fetch(url, param, timeLimit), new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('链接超时，请稍后再试或联系管理员')), timeLimit);
    })]);
    // const _promise = fetch(url, param);

    console.log("yhf fetcher.rawFetch");
    return process(_promise, netState, option, url);
};


const getFetch = (url, option) => {
    const headers = {
        ..._getHeader()
    };
    const urlTemp = url;
    console.log("yhf fetcher.getFetch");
    return rawFetch(urlTemp, {
        method: 'GET',
    }, option);
};

const qsFetch = (url, param, option) => {
    const headers = {
        ..._getHeader()
    };

    return rawFetch(url, {
        method: 'POST',
        headers,
        body: Qs.stringify(param)
    }, option);
};

const jsonFetch = (url, param, option) => {
    const headers = {
        ..._getHeader()
    };

    return rawFetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(param),
    }, option);
};

const uploadFetch = (url, param, option) => {
    const headers = {
        ..._getHeader(),
        'Content-Type': 'multipart/form-data'
    };

    const formData = new FormData();

    for (let key in param) {
        if (key != 'file') {
            let value = encodeURI(param[key]);
            formData.append(key, value);
        }
    }

    for (let fileForm in param.file) {
        formData.append('file' + fileForm, param.file[fileForm]);
    }

    console.log('POST:::');
    console.log(param);

    return rawFetch(url, {
        method: 'POST',
        headers,
        body: formData,
    }, 8000, option);
};

const _handleParams = (param) => {
    const ret = {};
    for (let key in param) {
        if (deleteKeys.some(regExp => regExp.test(key))) {

        } else {
            ret[key] = param[key];
        }
    }
    return ret;
};

const formFetch = (url, param, option) => {
    const headers = {
        ..._getHeader(),
        'Content-Type': 'multipart/form-data'
    };

    const handleParam = _handleParams(param);

    const formData = new FormData();
    let appendKeyPair = true;
    for (let key in handleParam) {
        let value = encodeURI(handleParam[key]);
        formData.append('' + key, value);
        appendKeyPair = false;
    }
    if (appendKeyPair) {
        formData.append('invalidateKey', 'invalidateValue');
    }
    console.log('post::::url--->' + url);
    console.log(handleParam);

    return rawFetch(url, {
        method: 'POST',
        headers,
        body: formData,
    }, 8000, option);
};

export default {
    getFetch,
    qsFetch,
    jsonFetch,
    uploadFetch,
    formFetch,
    initNetworkState
};

