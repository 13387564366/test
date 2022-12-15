/**
 * Created by edz on 2016/10/26.
 */
import DeviceInfo from 'react-native-device-info';
import urls from './urls';
import {Platform,} from 'react-native';

let hostUrl = urls.hostUrl;

const devId = DeviceInfo.getUniqueID();
const CommonLink = {
    returnHostUrl() {
        return hostUrl;
    },

    /**
     * start>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[]
     */

    /**
     * end<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<[]
     */


    /**
     * start>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[版本升级接口]
     */

    /**
     * 获取App最新版本信息
     * @param actorid
     * @param jbpmWorkFlowInfoId
     */
    fetchAppVersionInfo(devOs, versionCode,){
        const subUrl = 'webapi/resf/user/center/manager/detection/version?devos=' + devOs + '&versioncode=' + versionCode;
        return hostUrl + subUrl;
    },


       /**
        * 获取App最新版本信息
        * @param actorid
        * @param jbpmWorkFlowInfoId
        * 下面是测试环境中的请求url
        * http://10.112.50.60/login/loginCheck?userid=admin&type=AppPower
         hostUrl = 'http://10.112.50.40:8088/rzdp/';// 物产生产环境
        * 下面是切换回正常环境中的url
        * http://115.231.102.41/login/loginCheck?userid=admin&type=AppPower
        */
       getPermission(userId){
//           const subUrl = 'webapi/resf/user/center/manager/detection/version?devos=' + devOs + '&versioncode=' + versionCode;
//          测试环境
//         const subUrl = 'http://10.112.50.60/login/loginCheck?userid=' + userId + '&&type=AppPower';
           // 正常环境
           const subUrl = 'http://115.231.102.41/login/loginCheck?userid=' + userId + '&&type=AppPower';
            //return hostUrl + subUrl;
           return subUrl;
       },


    /**
     * end<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<[版本升级接口]
     */



    /**
     * start>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[登录、用户信息接口]
     */

    /**
     * 查询是否使用手势密码登陆
     * @param username
     * @returns {string}
     */
    getEnableGesture(username){
        const subUrl = 'webapi/resf/user/center/manager/acquisition/gesture?userid=' + username;
        return hostUrl + subUrl;
    },

    /**
     * 用户登录，
     * @param username 用户名
     * @param password 密码
     * @param psttype 密码类型
     * @param regId 推送用到的regId，
     * @param devType 设备类型（android，）
     * @returns {string}
     */
    login(username, password, psttype, regId, devType) {
        regId = escape(regId).replace(/\+/g, '%2B').replace(/\"/g, '%22').replace(/\'/g, '%27').replace(/\//g, '%2F').replace(/\#/g, '%23');
        const subUrl = 'webapi/resf/logon/manager/logon?un=' + username + '&pwd=' + password + '&keytype=' + psttype
            + '&devid=' + DeviceInfo.getUniqueID() + '&dev_reg_id=' + regId + '&devtype=' + devType;
        return hostUrl + subUrl;
    },
     /**
     * 登录后更新推送regid
     * @returns {string}
     */
    updateLogRegid(userid, regId, devType){
        regId = escape(regId).replace(/\+/g, '%2B').replace(/\"/g, '%22').replace(/\'/g, '%27').replace(/\//g, '%2F').replace(/\#/g, '%23');
        const subUrl = 'webapi/resf/logon/manager/updatelog?userid=' + userid + '&devid=' + DeviceInfo.getUniqueID() + '&dev_reg_id=' + regId + '&devtype=' + devType;;
        return hostUrl + subUrl;
    },

    /**
     * 用户注销
     * @returns {string}
     */
    fetchLogOut(){
        const subUrl = 'webapi/resf/logon/manager/logout';
        return hostUrl + subUrl;
    },

    /**
     * 设置、更新手势密码
     * @param userid
     * @param gesturepassword
     */
    updateGesturePassword(userid, gesturepassword){
        const subrl = 'webapi/resf/user/center/manager/setup/gesture?userid=' + userid + '&pwd=' + gesturepassword;
        return hostUrl + subrl;
    },

    /**
     * 设置、更新登录密码
     * @param userid
     * @param oldPwd
     * @param newPwd
     */
    updateLogPwd(userid, oldPwd, newPwd){
        const subrl = 'webapi/resf/user/center/manager/rebuild/password?userid=' + userid + '&old_pwd=' + oldPwd + "&new_pwd=" + newPwd;
        return hostUrl + subrl;
    },

    /**
     * 更新手势密码状态
     * @param userid
     * @param enablegesture
     * @returns {string}
     */
    updateGestureStatus(userid, enablegesture){
        const subUrl = 'webapi/resf/user/center/manager/close/gesture?userid=' + userid;
        return hostUrl + subUrl;
    },

    /**
     * end<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<[登录、用户信息接口]
     */



    /**
     * start>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[流程相关接口]
     */

    /**
     * 分页获取流程列表（待办）
     * @returns {string}
     */
    getTodoTaskCount(){
        const subUrl = 'webapi/resf/my/work/to/count';
        return hostUrl + subUrl;
    },
     /**
     * 判断待办可点
     * @returns {string}
     */
    getTodoTaskCheck() {
        const subUrl = 'webapi/resf/comm/query/app/check/detail';
        return hostUrl + subUrl;
    },

    /**
     * 分页获取流程列表（待办）
     * @returns {string}
     */
    getTodoTaskListByPage(){
        const subUrl = 'webapi/resf/my/work/to/list';
        return hostUrl + subUrl;
    },

    /**
     * 分页获取流程列表（已办）
     * @returns {string}
     */
    getCompletedList() {
        const subUrl = 'webapi/resf/my/work/has/list';
        return hostUrl + subUrl;
    },

    /**
     * 分页传阅列表
     * @returns {string}
     */
    getReadingTaskListByPage(){
        const subUrl = 'webapi/resf/my/work/pass';
        return hostUrl + subUrl;
    },

    /**
     * 分页已阅列表
     * @returns {string}
     */
    getReadedTaskListByPage(){
        const subUrl = 'webapi/resf/my/work/pass/close';
        return hostUrl + subUrl;
    },

    /**
     * 结束传阅任务
     * @returns {string}
     */
    endReadingTask(){
        const subUrl = 'webapi/resf/my/work/action/close';
        return hostUrl + subUrl;
    },

    /**
     * 获取流程菜单信息
     * @returns {string}
     */
    getFlowMenuInfos() {
        const subUrl = 'webapi/resf/comm/query/app/do/detail';
        return hostUrl + subUrl;
    },

    /**
     * 查询通用表单、列表信息
     * @returns {string}
     */
    getCommonFormInfo(pageId){
        const subUrl = 'webapi/resf/comm/query/by/dono/data?id=' + pageId;
        return hostUrl + subUrl;
    },

    /**
     * 通用表单保存
     * @returns {string}
     */
    saveCommonInfo(pageId){
        const subUrl = 'webapi/resf/comm/save/by/dono/data?id=' + pageId;
        return hostUrl + subUrl;
    },

    /**
     * 获取流程审批意见
     * @returns {string}
     */
    getHistoryOpinion() {
        const subUrl = 'webapi/resf/flow/opinion/history/list';
        return hostUrl + subUrl;
    },

    /**
     * 获取当前阶段签署意见
     * @returns {string}
     */
    fetchOpinion() {
        const subUrl = 'webapi/resf/flow/opinion/sign/info';
        return hostUrl + subUrl;
    },

    /**
     * 保存签署意见
     * @returns {string}
     */
    pushOpinion() {
        const subUrl = 'webapi/resf/flow/opinion/sign/save';
        return hostUrl + subUrl;
    },

    /**
     * 提交、退回，风险检测
     * @returns {string}
     */
    submitDetectRisk() {
        const subUrl = 'webapi/resf/flow/action/scan/service';
        return hostUrl + subUrl;
    },

    /**
     * 提交处理头部(判定是否可以提交，以及获取路由信息)
     * @param serialNo 流程号
     * @param submitModel 处理模式（Submit，Back）
     * @returns {string}
     */
    fetchCommitList(){
        const subUrl = 'webapi/resf/flow/action/submit/service';
        return hostUrl + subUrl;
    },

    /**
     * 待办、提交 (POST)
     * @returns {string}
     */
    submitWorkFlowComplete() {
        const subUrl = 'webapi/resf/flow/action/commit';
        return hostUrl + subUrl;
    },

    /**
     * 获取退回路由信息
     * @returns {string}
     */
    getBackStepDirector(){
        const subUrl = 'webapi/resf/flow/action/back/step';
        return hostUrl + subUrl;
    },

    /**
     * 待办、退回
     * @param serialNo
     * @returns {string}
     */
    backStepWorkFlow() {
        const subUrl = 'webapi/resf/flow/action/back/commit';
        return hostUrl + subUrl;
    },

    /**
     * end<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<[流程相关接口]
     */


    /**
     * start>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[附件相关接口]
     */

    /**
     * App下载页面
     */
    fetchDownloadPage(){
        const subUrl = 'appDownload.jsp';
        return hostUrl + subUrl;
    },

    /**
     * 首页图片下载
     * @param fileId    文件Id
     * @returns {string}
     */
    downloadFile(fileId){
        const subUrl = 'webapi/resf/files/down/flow/image?id=' + fileId;
        return hostUrl + subUrl;
    },

    /**
     * 获取附件一览列表
     * @param serialNo
     * @param pageIndex
     * @param limit
     * @returns {string}
     */
    fetchAllAttachmentData() {
        const subUrl = 'webapi/resf/flow/document/attachment/list';
        return hostUrl + subUrl;
    },

    /**
     * 上传附件（post）
     * @returns {string}
     */
    uploadImage() {
        const subUrl = 'webapi/resf/flow/document/attachment/upload';
        return hostUrl + subUrl;
    },

    /**
     * 获取某一分类所有附件
     * @returns {string}
     */
    fetchLibraryAttachments(){
        const subUrl = 'flow/document/attachment/by/library';
        return hostUrl + subUrl;
    },

    /**
     * 下载文件
     * @returns {string}
     */
    downloadAttachment(docId){
        const subUrl = 'webapi/resf/files/down/docById?id=' + docId;
        return hostUrl + subUrl;
    },
    /**
     * 删除文件
     * @returns {string}
     */
    deleteAttachment(docId){
        const subUrl = 'webapi/resf/files/remove/docById?id=' + docId;
        return hostUrl + subUrl;
    },

    /**
     * 下载app文件
     * @returns {string}
     */
    downloadAndroid(){
        const subUrl = 'webapi/resf/files/downloadApp?devType=android';
        return hostUrl + subUrl;
    },


    /**
     * 获取附件类型列表
     * @returns {string}
     */
    getAttachmentUploadData() {
        const subUrl = 'webapi/resf/flow/work/manager/attachments/acquisition/type';
        return hostUrl + subUrl;
    },

    /**
     * end<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<[附件相关接口]
     */


    /**
     * start>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[通用接口]
     */

    /**
     * 获取下拉框词典信息（POST）
     * @returns {string}
     */
    getCodeDicts(){
        const subUrl = 'webapi/resf/select/data/get/common';
        return hostUrl + subUrl;
    },
    /**
     * end<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<[通用接口]
     */

    /**
     * 获取流程概要信息
     * @returns {string}
     */
    fetchSummaryInfo() {
        const subUrl = 'webapi/resf/comm/brief/detail';
        return hostUrl + subUrl;
    },

    setHostUrl(url){
        hostUrl = url;
    },
    /**
     * start>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[预查询功能、报表模块接口]
     */

    /**
     * 获取 报表、图表 列表
     * @param userId
     * @param type  表格报表：report，图形报表：chart
     * @returns {string}
     */
    fetchStatementListWithCondition(userId, type) {
        // const subUrl = 'api/report/obtain/list?userId=' + userId + '&dataType=' + type;
        const subUrl = 'webapi/resf/app/report/limit';
        return hostUrl + subUrl;
    },

    /**
     * 获取预查询数据
     * @param id  报表id
     * @param type  报表类型，表格报表：report，图形报表：chart
     * @param selectType    预查询：search，搜索：filter
     * @param pageIndex
     * @param limit
     * @param preSearchCondition    预查询条件字符串, ex:
     * @returns {string}
     */
    fetchGeneralStatementDataWithCondition(id, type, selectType, pageIndex, limit, preSearchCondition, globalText = '') {
        // const subUrl = 'api/report/obtain/datas';
        const subUrl = 'webapi/resf/app/report/data?reportid=' + id + '&reportcheck=' + globalText;
        return hostUrl + subUrl;
    },
    /**
     * end<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<[预查询功能、报表模块接口]
     */

};
module.exports = CommonLink;