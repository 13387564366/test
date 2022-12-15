/**
 * Created by admin on 15/03/2018.
 */

import CommonFunc from '../commonStyle/commonFunc';

const MENU_ATTACHMENT_TITLE = '附件信息';
const MENU_HISTORY_OPINION_TITLE = '历史意见';
//主菜单显示key
const GROUP_DISPLAY_KEY = 'menuName';
//右上角菜单显示key
const MENU_DISPLAY_KEY = 'menuName';
//子菜单key
const GROUP_SUB_PAGE_KEY = 'menuItems';
//项目总信息
const MENU_ALL_PROJECT_INFO = {[MENU_DISPLAY_KEY]: '项目总信息'};
//附件菜单
const MENU_ATTACHMENT_ITEM = {[MENU_DISPLAY_KEY]: MENU_ATTACHMENT_TITLE, [GROUP_SUB_PAGE_KEY]: []};
const ATTACHMENT_PAGE_ID = '__ATTACHMENT_PAGE_ID__';

//附件菜单
const MENU_HISTORY_OPINION_ITEM = {[MENU_DISPLAY_KEY]: MENU_HISTORY_OPINION_TITLE, [GROUP_SUB_PAGE_KEY]: []};
const PAGE_IS_LIST_KEY = 'isList', PAGE_IS_LIST = 'Y', YES_OR_NO__YES = 'Y';
const PAGE_NAME_KEY = 'menuName';
const MENU_ID_KEY = 'menuId';
const PAGE_ID_KEY = 'pageId';
const PARAMS_ARR_KEY = 'pageParams';
const PRODUCT_FLOW_KEY = 'FlowKey';
const PAGE_PARENT_ID_KEY = 'parentId';
const PAGE_STYLE_KEY = 'style';
const MENU_CHANGE_EVENT = 'menuChange';//菜单变更
const MENU_INFO_CHANGE_EVENT = 'menuInfoChange';//菜单项切换
const ATTACHMENT_MENU_ID = '_attachmentId_';//附件菜单Id
//附件页签信息
const MENU_ATTACHMENT_PAGE_ITEM = {
    [MENU_ID_KEY]: ATTACHMENT_MENU_ID,
    [MENU_DISPLAY_KEY]: MENU_ATTACHMENT_TITLE,
    [PAGE_ID_KEY]: ATTACHMENT_PAGE_ID,
};
//处理实际产品信息
const _handleProducts = (originProducts) => {
    const ret = [];
    originProducts.forEach(op => {
        const handledProduct = {
            isProduct: true,
            id: op.id,
        };
        const eleTables = CommonFunc.getValueByKeyArr(op, ['value', 'elementTable']) || [];
        eleTables.forEach(ele => {
            handledProduct[ele.name] = CommonFunc.getValueByKeyArr(ele, ['value']);
        });
        handledProduct[GROUP_DISPLAY_KEY] = CommonFunc.getValueByKeyArr(handledProduct, ['ProductName']);
        ret.push(handledProduct);
    });
    return ret;
};

//处理子菜单项
const _handleMenus = (originalMenus) => {
    const ret = [];
    originalMenus.forEach((menuInfo, idx) => {
        const menuItem = {
            [MENU_ID_KEY]: 'menuId_' + idx,
        };
        menuItem[GROUP_DISPLAY_KEY] = CommonFunc.getValueByKeyArr(menuInfo, ['display']);
        const originalLibrary = CommonFunc.getValueByKeyArr(menuInfo, ['library']) || [];
        menuItem[GROUP_SUB_PAGE_KEY] = _handlePageInfo(originalLibrary);
        ret.push(menuItem);
    });
    return ret;
};

//处理参数信息,字符串转数组
const _handlePageParam = (paramStr = '') => {
    const ret = [];
    let temp = paramStr.replace(/\s*/g, '');
    if (!temp) {
        return [];
    }
    const splitArr = temp.split(',');
    return splitArr;
};
//处理子菜单项
const _handlePageInfo = (originalPageLibrary) => {
    const ret = [
        // MENU_ATTACHMENT_PAGE_ITEM,
    ];
    const subMenus = [];
    const pageIdIndex = {};
    originalPageLibrary.forEach((pageItem, i) => {
        const handledPageInfo = {};
        //判断页面是否为列表
        const isList = CommonFunc.getValueByKeyArr(pageItem, ['appBusiness', 'isList']) == PAGE_IS_LIST;
        handledPageInfo[PAGE_IS_LIST_KEY] = isList;
        const pageId = CommonFunc.getValueByKeyArr(pageItem, ['id']);
        handledPageInfo[PAGE_ID_KEY] = pageId;
        pageIdIndex[pageId] = i;
        const parentId = CommonFunc.getValueByKeyArr(pageItem, ['fatherId']);
        const style = CommonFunc.getValueByKeyArr(pageItem, ['style']);
        handledPageInfo[PAGE_PARENT_ID_KEY] = parentId;
        handledPageInfo[PAGE_STYLE_KEY] = style;
        handledPageInfo[PAGE_NAME_KEY] = CommonFunc.getValueByKeyArr(pageItem, ['display']);
        handledPageInfo[PARAMS_ARR_KEY] = _handlePageParam(CommonFunc.getValueByKeyArr(pageItem, ['initialCondition']));
        //是否编辑页面
        handledPageInfo.editable = CommonFunc.getValueByKeyArr(pageItem, ['enableSave']) == YES_OR_NO__YES;
        const downloadable = CommonFunc.getValueByKeyArr(pageItem, ['enableDownLoad']) == YES_OR_NO__YES;
        handledPageInfo.downloadable = downloadable;
        if (downloadable) {
            //下载参数，filenameField，高亮显示的文件名字段，dlownloadId：下载文件的文件id
            let downloadParam = CommonFunc.getValueByKeyArr(pageItem, ['downloadParam']);
            try {
                downloadParam = JSON.parse(downloadParam);
            } catch (e) {
                downloadParam = {
                    fileNameKey: '', downloadIdKey: ''
                };
            }
            handledPageInfo.downloadParam = downloadParam;
        }
        if (parentId) {
            subMenus.push(handledPageInfo);
        } else {//顶级页签
            ret.push(handledPageInfo);
        }
    });
    subMenus.forEach(pageItem => {
        const parentId = pageItem[PAGE_PARENT_ID_KEY];
        ret.forEach(parentItem => {
            if (parentItem[PAGE_IS_LIST_KEY] && parentItem[PAGE_ID_KEY] == parentId) {
                if (parentItem.detailPageInfo == undefined) {
                    parentItem.detailPageInfo = []
                }
                parentItem.detailPageInfo.push(pageItem);
            }
        });
    });
    return ret;
};

//根据匹配信息，绑定菜单与子菜单项
const _bindProductMenus = (menus, menuItems) => {
    const ret = [];
    menus.forEach(menuInfo => {
        menuInfo[GROUP_SUB_PAGE_KEY] = [];
        const menuName = menuInfo[GROUP_DISPLAY_KEY];
        menuItems.forEach(subMenuInfo => {
            const subMenuName = subMenuInfo[GROUP_DISPLAY_KEY];
            const items = subMenuInfo[GROUP_SUB_PAGE_KEY];
            if (menuName == subMenuName && items.length > 0) {
                // if (menuName == subMenuName) {
                menuInfo[GROUP_SUB_PAGE_KEY] = items;
                ret.push(menuInfo);
            }
        });
    });
    return ret;
};

//处理菜单信息
const _handleMenuInfos = (originalData) => {
    //实际项目选择的产品信息
    const productInfo = CommonFunc.getValueByKeyArr(originalData, ['productInfo', 'flowParams', 'ProjectProduct', 'elementTable']) || [];
    const productMainMenus = _handleProducts(productInfo);
    //产品配置项
    const flowProductInfo = CommonFunc.getValueByKeyArr(originalData, ['flowProduct']) || [];
    const productMenus = _handleMenus(flowProductInfo);
    //绑定菜单到产品菜单
    const handledProductMenus = _bindProductMenus(productMainMenus, productMenus);

    //项目配置项
    const flowProjectInfo = CommonFunc.getValueByKeyArr(originalData, ['flowProject']) || [];
    const projectMenus = _handleMenus(flowProjectInfo);
    // const menuGroups = productMainMenus.concat(projectMenus);
    const menuGroups = projectMenus.concat(handledProductMenus);
    return menuGroups;
};

module.exports = {
    MENU_ALL_PROJECT_INFO: MENU_ALL_PROJECT_INFO,
    MENU_HISTORY_OPINION_ITEM: MENU_HISTORY_OPINION_ITEM,
    MENU_ATTACHMENT_ITEM: MENU_ATTACHMENT_ITEM,
    MENU_ATTACHMENT_TITLE: MENU_ATTACHMENT_TITLE,
    MENU_HISTORY_OPINION_TITLE: MENU_HISTORY_OPINION_TITLE,
    GROUP_DISPLAY_KEY: GROUP_DISPLAY_KEY,
    MENU_DISPLAY_KEY: MENU_DISPLAY_KEY,
    GROUP_SUB_PAGE_KEY: GROUP_SUB_PAGE_KEY,
    PAGE_IS_LIST_KEY: PAGE_IS_LIST_KEY,
    PAGE_NAME_KEY: PAGE_NAME_KEY,
    PAGE_ID_KEY: PAGE_ID_KEY,
    PARAMS_ARR_KEY: PARAMS_ARR_KEY,
    PRODUCT_FLOW_KEY: PRODUCT_FLOW_KEY,
    PAGE_PARENT_ID_KEY: PAGE_PARENT_ID_KEY,
    MENU_CHANGE_EVENT: MENU_CHANGE_EVENT,
    MENU_INFO_CHANGE_EVENT: MENU_INFO_CHANGE_EVENT,
    handleMenuInfos: _handleMenuInfos,
    ATTACHMENT_PAGE_ID: ATTACHMENT_PAGE_ID,
    PAGE_STYLE_KEY: PAGE_STYLE_KEY,
};