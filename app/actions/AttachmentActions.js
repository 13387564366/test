import CommonLink from '../modules/CommonLink';
import BaseActions from './BaseActions';

const _uploadCommonAttachment = (param, callback, failure) => {
    let requestUrl = CommonLink.uploadCommonAttachment(param.uploadType, param.getParamStr);
    delete param.uploadType;//删除上传类型
    delete param.getParamStr;//删除get参数，
    return BaseActions.uploadAction(requestUrl, param, callback, failure);
};

const _uploadCommonAttachment2 = (param, callback, failure) => {
    let requestUrl = CommonLink.uploadCommonAttachment2();
    return BaseActions.uploadAction(requestUrl, param, callback, failure);
};
//删除单个附件
const _deleteAttachment = (param, callback, failure) => {
    let requestUrl = CommonLink.deleteAttachment(param.docId);
    return BaseActions.postAction(requestUrl, param, callback, failure);
};
//获取附件列表
const _getAttachmentList = (param, callback, failure) => {
    let requestUrl = CommonLink.getAttachmentList();
    return BaseActions.postAction(requestUrl, param, callback, failure);
};

const _getCodeDicts = (param, callback, failure) => {
    const requestUrl = CommonLink.getCodeDicts();
    return BaseActions.postAction(requestUrl, param, callback, failure);
};

const _getCommonList = (param, callback, failure) => {
    const requestUrl = CommonLink.getCommonList(param.pageType, param.pageIndex, param.limit, param.globalText);
    delete param.pageType;
    delete param.pageIndex;
    delete param.limit;
    delete param.globalText;
    return BaseActions.postAction(requestUrl, param, callback, failure);
};

const CommonActions = {
    uploadCommonAttachment: _uploadCommonAttachment,
    uploadCommonAttachment2: _uploadCommonAttachment2,
    deleteAttachment: _deleteAttachment,
    getAttachmentList: _getAttachmentList,
    getCodeDicts: _getCodeDicts,
    getCommonList: _getCommonList,
};

module.exports = CommonActions;
