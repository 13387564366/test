/**
 * Created by amarsoft on 2016/11/3.
 */
import CommonLink from '../modules/CommonLink';
import AppConstants from '../constants/AppConstants';
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseActions from './BaseActions';
//判断待办可点
// /resf/comm/query/app/check/detail
const _getTodoTaskCheck = (param, callback, failure) => {
    const requestUrl = CommonLink.getTodoTaskCheck();
    return BaseActions.postAction(requestUrl, param, callback, failure);
};
//获取待办数量
const _getTodoTaskCount = (param, callback, failure) => {
    const requestUrl = CommonLink.getTodoTaskCount();
    return BaseActions.postAction(requestUrl, param, callback, failure);
};
//获取待办列表
const _getTodoTaskListByPage = (param, callback, failure) => {
    const requestUrl = CommonLink.getTodoTaskListByPage();
    return BaseActions.postAction(requestUrl, param, callback, failure);
};
//获取已办列表
const _getCompletedList = (param, callback, failure) => {
    const requestUrl = CommonLink.getCompletedList();
    return BaseActions.postAction(requestUrl, param, callback, failure);
};
//获取传阅列表
const _getReadingTaskListByPage = (param, callback, failure) => {
    const requestUrl = CommonLink.getReadingTaskListByPage();
    return BaseActions.postAction(requestUrl, param, callback, failure);
};
//获取已结束传阅列表
const _getReadedTaskListByPage = (param, callback, failure) => {
    const requestUrl = CommonLink.getReadedTaskListByPage();
    return BaseActions.postAction(requestUrl, param, callback, failure);
};
//结束传阅任务
const _endReadingTask = (param, callback, failure) => {
    const requestUrl = CommonLink.endReadingTask();
    const sFunc = (res)=> {
        AppDispatcher.dispatch({actionType: AppConstants.REFRESH_DATA_READ});
        callback(res);
    };
    return BaseActions.postAction(requestUrl, param, sFunc, failure);
};

//获取流程概要信息
const _fetchSummaryInfo = (param, callback, failure) => {
    const requestUrl = CommonLink.fetchSummaryInfo();
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//获取流程菜单信息
const _getFlowMenuInfos = (param, callback, failure) => {
    const requestUrl = CommonLink.getFlowMenuInfos();
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//获取通用表单信息
const _getCommonFormInfo = (param, callback, failure) => {
    const requestUrl = CommonLink.getCommonFormInfo(param.pageId);
    delete param.pageId;
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//提交、退回风险检测
const _submitDetectRisk = (param, callback, failure) => {
    const requestUrl = CommonLink.submitDetectRisk();
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//获取提交路由列表
const _fetchCommitList = (param, callback, failure) => {
    const requestUrl = CommonLink.fetchCommitList();
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//流程提交
const _submitWorkFlow = (param, callback, failure) => {
    const requestUrl = CommonLink.submitWorkFlowComplete();
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//获取退回路由列表
const _getBackStepDirector = (param, callback, failure) => {
    const requestUrl = CommonLink.getBackStepDirector();
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//流程退回
const _backStepWorkFlow = (param, callback, failure) => {
    const requestUrl = CommonLink.backStepWorkFlow();
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//当前节点的签署意见
const _getOpinion = (param, callback, failure) => {
    const requestUrl = CommonLink.fetchOpinion();
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//已经签署过的意见
const _getHistoryOpinion = (param, callback, failure) => {
    const requestUrl = CommonLink.getHistoryOpinion();
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//保存节点节点通用意见
const _pushOpinion = (param, callback, failure) => {
    const requestUrl = CommonLink.pushOpinion();
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//获取当前的流程附件
const _getAllAttachmentUploadData = (param, callback, failure) => {
    const requestUrl = CommonLink.fetchAllAttachmentData();
    return BaseActions.postAction(requestUrl,param,callback,failure);
};
//通用保存
const _saveCommonInfo = (param, callback, failure) => {
    const requestUrl = CommonLink.saveCommonInfo(param.pageId);
    delete param.pageId;
    return BaseActions.postAction(requestUrl,param,callback,failure);
};

const _getAttachmentUploadData = (param, callback, failure) => {
    const requestUrl = CommonLink.getAttachmentUploadData();
    return BaseActions.getAction(requestUrl,callback,failure);
};

const _uploadImage = (param, callback, failure) => {
    let requestUrl = CommonLink.uploadImage();
    return BaseActions.uploadAction(requestUrl,param,callback,failure);
};

const todoTaskActions = {
    getTodoTaskCheck:_getTodoTaskCheck,
    getTodoTaskCount: _getTodoTaskCount,
    getTodoTaskListByPage: _getTodoTaskListByPage,
    getReadingTaskListByPage: _getReadingTaskListByPage,
    getReadedTaskListByPage: _getReadedTaskListByPage,
    endReadingTask: _endReadingTask,
    getCompletedList: _getCompletedList,
    fetchSummaryInfo: _fetchSummaryInfo,
    getFlowMenuInfos: _getFlowMenuInfos,
    getCommonFormInfo: _getCommonFormInfo,
    fetchCommitList: _fetchCommitList,
    getBackStepDirector: _getBackStepDirector,
    submitDetectRisk: _submitDetectRisk,
    submitWorkFlow: _submitWorkFlow,
    backStepWorkFlow: _backStepWorkFlow,
    getOpinion: _getOpinion,
    getHistoryOpinion: _getHistoryOpinion,
    pushOpinion: _pushOpinion,
    getAllAttachmentUploadData: _getAllAttachmentUploadData,
    saveCommonInfo: _saveCommonInfo,
    uploadImage: _uploadImage,
    getAttachmentUploadData: _getAttachmentUploadData,
};

module.exports = todoTaskActions;
