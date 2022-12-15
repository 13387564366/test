/**
 * Created by cui on 11/3/16.
 */

// import React from 'react';
import CommonLink from '../modules/CommonLink';
import AppConstants from '../constants/AppConstants'
import AppDispatcher from '../dispatcher/AppDispatcher';
import BaseActions from './BaseActions';
const useTest = false;
let testUser = null;
const testUrlPrefix = 'https://txlapp.goldwind.com.cn/app/';
const loginUrl = testUrlPrefix + 'api/user/check?username=admin&password=11111111';
// 报表列表
const __getStatementListUrl = (userId, type) => {
    return `${testUrlPrefix}api/report/obtain/list?userId=${userId}&dataType=${type}`
}
// 报表数据
const statementDataUrl = testUrlPrefix + 'api/report/obtain/datas';
// 获取报表、图标列表
const _fetchStatementListWithCondition = (param, callback, failure) => {
    // TODO: for test
    if( useTest ) {
        const sFunc = (user) => {
            let statementListUrl = __getStatementListUrl(user.id, param.type)
            BaseActions.getAction(statementListUrl, callback, failure);
        }
        if (!testUser) {
            const sFunc1 = (res) => {
                testUser = res.user;
                return testUser
            };
            const eFunc = (err) => {
                console.log(err)
            };
            BaseActions.getAction(loginUrl, sFunc1, eFunc).then(sFunc)
        } else {
            sFunc(testUser)
        }
    } else {
        const requestUrl = CommonLink.fetchStatementListWithCondition( param.userid, param.type );
        return BaseActions.getAction(requestUrl, callback, failure);
    }
};

// 获取报表、图标数据
const _fetchGeneralStatementDataWithCondition = (param, callback, failure) => {
    //TODO: for test
    if( useTest ) {
        BaseActions.postAction(statementDataUrl, param, callback, failure);
    } else {
        const requestUrl = CommonLink.fetchGeneralStatementDataWithCondition(param.id, param.type, param.selectType, param.pageIndex, param.limit, param.preSearchCondition, param.globalText);
        return BaseActions.getAction(requestUrl, callback, failure);
    }
};

const _fetchStatementList = (param, callback, failure) => {
    const requestUrl = CommonLink.fetchStatementList( param.userid );
    return BaseActions.getAction(requestUrl, callback, failure);
};

const _fetchGeneralStatementData = (param, callback, failure) => {
    const requestUrl = CommonLink.fetchGeneralStatement(param.reportId, param.start, param.globalText);
    const sFunc = (response)=> {
        // AppDispatcher.dispatch({
        //     actionType: AppConstants.FETCH_GENERAL_STATEMENT,
        //     data: response.body,
        // });
        callback(response);
    };
    return BaseActions.getAction(requestUrl, sFunc, failure);
};

const _fetchGraphStatementData = (param, callback, failure) => {
    const requestUrl = CommonLink.fetchGraphStatement(param.userid);
    const sFunc = (response)=> {
        const resultData = modalGraphStatementData(response)
        AppDispatcher.dispatch({
            actionType: AppConstants.FETCH_GRAPHA_STATEMENT,
            data: resultData,
        });
        callback(response);
    };
    return BaseActions.getAction(requestUrl, sFunc, failure);
};

const modalGraphStatementData = (json) => {
    console.log('数据转换前：-------');
    console.log(json);
    const datas = json.body.datas || '';
    for (let item in datas) {
        const columns = datas[item].columns;
        const graphData = datas[item].datas;
        let xAixsName = columns[0].name || '';
        let yAixsName = columns[1].name || 0;
        if(columns[0].usagetype === 'DATA') {
            xAixsName = columns[1].name || '';
            yAixsName = columns[0].name || 0;
        }
        const pointArr = new Array();
        for(let pointObj of graphData){

            let xVal = pointObj[xAixsName] || '';

            let number = parseFloat(pointObj[yAixsName]);
            number = isNaN(number) ? 0 : number;
            pointArr.push([xVal, number]);
        }
        datas[item].pointArr = pointArr;
    }
    const graphDesc = json.body.desc || '';
    for(let item of graphDesc) {
        item.graphData = datas[item.id].pointArr;
    }
    console.log('数据转换后:+++++++++');
    console.log(graphDesc);

    return graphDesc;
};

const StatementActions = {
    fetchStatementListWithCondition: (param, callback, failure) => _fetchStatementListWithCondition(param, callback, failure),
    fetchGeneralStatementDataWithCondition: (param, callback, failure) => _fetchGeneralStatementDataWithCondition(param, callback, failure),

    fetchGeneralStatementData: (param, callback, failure) => _fetchGeneralStatementData(param, callback, failure),
    fetchStatementList: (param, callback, failure) => _fetchStatementList(param, callback, failure),
    fetchGraphStatementData: (param, callback, failure) => _fetchGraphStatementData(param, callback, failure)
};

module.exports = StatementActions;
