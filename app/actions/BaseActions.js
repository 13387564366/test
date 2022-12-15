import Fetcher from '../network/fetcher';
import AppActions from './AppActions';
import DateHelper from '../modules/dateHelper';
const dateFormat = 'yyyymmddHHMMssLL';//年月日时分秒毫秒

const __getAction = (requestUrl, sFunc, eFunc, loading = true)=> {
    loading && AppActions.showLoading();
    console.log("yhf _getAction");
    return Fetcher.getFetch(requestUrl)
        .then((responseData) => {
        console.log('yhf 成功111 data');
            loading && AppActions.dismissLoading();
            console.log('yhf 成功222 data');
            sFunc(responseData);
            console.log('yhf 成功333 data');
        }, (errorData) => {
        console.log('yhf 失败1111 data');
            loading && AppActions.dismissLoading();
            console.log('yhf 失败2222 data');
            eFunc(errorData||'出错了，请稍后再试或联系管理员！');
 console.log('yhf 失败3333 data');
        });
};

const __postAction = (requestUrl, param, sFunc, eFunc, loading = true)=> {
    loading && AppActions.showLoading();
    return Fetcher.formFetch(requestUrl, param)
        .then((responseData) => {
            loading && AppActions.dismissLoading();
            sFunc(responseData);
             console.log('yhf post 成功 data');
        }, (errorData) => {
            loading && AppActions.dismissLoading();
            eFunc(errorData);
             console.log('yhf post 失败 data');
        });
};

const __uploadAction = (requestUrl, param, sFunc, eFunc, loading = true)=> {
    const fileArray = param.file || [];
    const timestamp = DateHelper.df(Date.now(), dateFormat);
    let subName = Math.random().toString();
    let startIndex = subName.indexOf('.') + 1;
    subName = subName.substring(startIndex);
    let fileAddress = {};
    fileArray.map((item, i) => {
        if (!item.name) {
            item.name = timestamp + '_' + subName + '_' + i + '.'+item.fileType;//文件名格式：时间戳_随机数_索引.jpg
            item.type = 'application/octet-stream';
        }
        fileAddress[item.name] = {address:item.address,timestamp:item.timestamp};
    });
    param.fileAddress = JSON.stringify(fileAddress);
    console.log(param);
    loading && AppActions.showLoading();
    return Fetcher.uploadFetch(requestUrl, param)
        .then((responseData) => {
            loading && AppActions.dismissLoading();
            sFunc(responseData);
        }, (errorData) => {
            loading && AppActions.dismissLoading();
            eFunc(errorData);
        });
};

//非模态GET调用
const _getActionNoModal = (url, sFunc, eFunc) => {
    return __getAction(url, sFunc, eFunc, false);
};
//模态GET调用
const _getActionModal = (url, sFunc, eFunc) => {
    return __getAction(url, sFunc, eFunc, true);
};
//非模态POST调用
const _postActionNoModal = (url, param, sFunc, eFunc) => {
    return __postAction(url, param, sFunc, eFunc, false);
};
//非模态POST调用
const _postActionModal = (url, param, sFunc, eFunc) => {
    return __postAction(url, param, sFunc, eFunc, true);
};
//模态上传文件
const _uploadAction = (url, param, sFunc, eFunc) => {
    return __uploadAction(url, param, sFunc, eFunc, true);
};
//非模态上传文件
const _uploadActionNoModal = (url, param, sFunc, eFunc) => {
    return __uploadAction(url, param, sFunc, eFunc, false);
};
//模拟测试
const _mockAction = (sFunc, eFunc)=> {
    AppActions.showLoading();
    return new Promise((resolve, reject)=> {
        const func = function () {
            AppActions.dismissLoading();
            sFunc();
        };
        setTimeout(func, 3000);
    });
};

const CommonActions = {
    getActionNoModal: _getActionNoModal,
    getAction: _getActionModal,
    postActionNoModal: _postActionNoModal,
    postAction: _postActionModal,
    uploadAction: _uploadAction,
    uploadActionNoModal: _uploadActionNoModal,
    mockAction: _mockAction,
};

module.exports = CommonActions;
