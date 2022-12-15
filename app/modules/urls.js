/**
 * Created by admin on 11/16/18.
 */

let hostUrl = 'https://erp.zjmileasing.com/rzdp/';// 物产生产环境
// let hostUrl = 'http://115.231.102.40:8080/rzdp/';// 物产测试环境

//2021 yhf 改url地址 内网
// let hostUrl = 'http://10.112.50.40:8088/rzdp/';// 物产生产环境

const thirdUrl = hostUrl + 'webapi/resf/proxy/';

module.exports = {
    hostUrl,
    thirdUrl,
};