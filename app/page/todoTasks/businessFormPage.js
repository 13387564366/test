/**
 * Created by Administrator on 2016/11/15.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    InteractionManager,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';

import TodoTaskActions from '../../actions/FlowActions';
import EmptyData from '../../components/emptyData/emptyData';
import Icon from 'react-native-vector-icons/FontAwesome';
import FormDetailPage from './formDetailPage';
import FormDetailPageForSave from './formDetailPageForSave';
import ListFormPage from './listFormPage';
import CommonFunc from '../commonStyle/commonFunc';
import CommonStyles from '../../modules/CommonStyle';
import AttachmentListPage from './attachmentListPage';
import {
    GROUP_DISPLAY_KEY,
    GROUP_SUB_PAGE_KEY,
    PAGE_IS_LIST_KEY,
    PAGE_ID_KEY,
    PARAMS_ARR_KEY,
    PRODUCT_FLOW_KEY,
    MENU_CHANGE_EVENT,
    MENU_INFO_CHANGE_EVENT,
    handleMenuInfos,
    ATTACHMENT_PAGE_ID,
} from './menuHandler';

export default class BusinessForm extends Component {
    constructor(props) {
        super(props);
        this._fetchFlowMenuInfo = this._fetchFlowMenuInfo.bind(this);
        this._toFormDetailPage = this._toFormDetailPage.bind(this);
        this._getCommonFlowParams = this._getCommonFlowParams.bind(this);
        this._sendChangedMenus = this._sendChangedMenus.bind(this);
        this._onMenuInfoChange = this._onMenuInfoChange.bind(this);
        this.state = {
            dataSource: [],
            menuGroups: [],
            menuInfo: null,
            groups: [],
        };
        //重新调整，list 、基本表单后的标记，默认分组为空（排除 附件信息分组），
        this.fetchSuccessful = true;
        this.allEmpty = true;//未配置分组信息，或者获取失败 标记
        this.title = this.props.param.flowname;//获取流程的标题
    }

    componentDidMount() {
        // InteractionManager.runAfterInteractions(()=>this._fetchFlowMenuInfo());
        // CommonFunc.addListenerAndType(this._onMenuInfoChange, MENU_INFO_CHANGE_EVENT);
    }

    componentWillUnmount() {
        // CommonFunc.removeListenerAndType(this._onMenuInfoChange, MENU_INFO_CHANGE_EVENT);
    }

    _fetchFlowMenuInfo() {
        const {serialNo, objectNo} = this._getCommonFlowParams();
        TodoTaskActions.getFlowMenuInfos({
            serialNo: serialNo,
            objectNo: objectNo,
        }, (responseData)=> {
            const menuGroups = handleMenuInfos(responseData);
            const menus = {
                menuGroups: menuGroups,
            };
            const menuCount = menuGroups.length;
            if (menuCount > 0) {
                menus.menuInfo = menuGroups[0];
                if (menuCount > 1) {//多余一个菜单才显示
                    this._sendChangedMenus(menuGroups);
                }
            }
            this.fetchSuccessful = true;
            this.setState(menus);
        }, (error)=> {
            this.fetchSuccessful = false;
            CommonFunc.alert(error);
        });
    }

    //发送菜单变更通知
    _sendChangedMenus(changedMenus) {
        CommonFunc.dispatchActionType(MENU_CHANGE_EVENT, changedMenus);
    }

    _onMenuInfoChange(menuInfo) {
        this.setState({menuInfo: menuInfo, groups: menuInfo[GROUP_SUB_PAGE_KEY]});
    }

    _getCommonFlowParams() {
        const listData = this.props.param.listData;
        const flowNo = CommonFunc.getValueByKeyArr(listData, ['FLOWNO', 'itemno']);
        const serialNo = CommonFunc.getValueByKeyArr(listData, ['SERIALNO', 'itemno']);
        const objectNo = CommonFunc.getValueByKeyArr(listData, ['OBJECTNO', 'itemno']);
        return {flowNo: flowNo, serialNo: serialNo, objectNo: objectNo};
    }

    _toFormDetailPage(groupInfo, isProduct, flowKey) {
        const postParam = this._getCommonFlowParams();
        const pageId = groupInfo[PAGE_ID_KEY];
        if (pageId === ATTACHMENT_PAGE_ID) {
            this.props.navigator.push({
                id: 'AttachmentListPage',
                comp: AttachmentListPage,
                param: postParam,
            });
            return;
        }
        const displayName = groupInfo[GROUP_DISPLAY_KEY];
        const Comp = null;
        let pageType = '';
        let isList = groupInfo[PAGE_IS_LIST_KEY];
        const editable = this.props.param.editable && groupInfo.editable;
        postParam.pageId = pageId;
        if (isProduct) {
            postParam.flowKey = flowKey;
            postParam.flow_Key = flowKey;
        }
        const dowoloadable = groupInfo.downloadable;
        const downloadParam = groupInfo.downloadParam;
        CommonFunc.handlePostParam(postParam, groupInfo[PARAMS_ARR_KEY],this.props.param.listData);
        if (isList) {
            const detailPageInfo = groupInfo.detailPageInfo;
            this.props.navigator.push({
                id: 'ListFormPage',
                comp: ListFormPage,
                param: {
                    detailPageInfo: detailPageInfo,
                    title: displayName,
                    pageType: pageType,
                    postParam: postParam,
                    groupInfo: groupInfo,
                    downloadable: dowoloadable,
                    downloadParam: downloadParam,
                },
            });
        } else {
            let Comp = editable ? FormDetailPageForSave : FormDetailPage;
            this.props.navigator.push({
                id: '' + Comp,
                comp: Comp,
                param: {
                    editable: editable,
                    title: displayName,
                    pageType: pageType,
                    postParam: postParam,
                    groupInfo: groupInfo,
                },
            });
        }
    }

    _renderCommonGroup(rowData, isProduct, flowKey) {
        let displayText = rowData[GROUP_DISPLAY_KEY];
        const pageId = rowData[PAGE_ID_KEY];
        const isAttachment = pageId === ATTACHMENT_PAGE_ID;
        return (
            <TouchableOpacity
                onPress={() => this._toFormDetailPage(rowData, isProduct, flowKey)}
            >
                <View style={{
                    backgroundColor: 'white', paddingHorizontal: 14, flexDirection: 'row',
                    alignItems: 'center', marginTop: 5, justifyContent: 'space-between',
                }}>
                    <View style={{flexDirection: 'row', alignItems: 'center',}}>
                        {
                            isAttachment ?
                                <Image source={require('../../image/list_icon_blue.png')}/>
                                :
                                <Image source={require('../../image/list_icon.png')}/>
                        }
                        <Text style={{
                            marginLeft: 10,
                            color: '#000',
                            marginVertical: 12,
                        }}>{displayText}</Text>
                    </View>
                    <Icon name={'angle-right'} size={25} color={'#767A8B'}/>
                </View>
            </TouchableOpacity>

        );
    }

    _renderGroups() {
        const menuInfo = this.state.menuInfo;
        if (menuInfo) {
            const groups = menuInfo[GROUP_SUB_PAGE_KEY];
            const isProduct = menuInfo.isProduct;
            const flowKey = menuInfo[PRODUCT_FLOW_KEY];
            let length = groups.length;
            let pageArr = [];
            let i = 0;
            for (; i < length; i++) {
                let child = null;
                child = this._renderCommonGroup(groups[i], isProduct, flowKey);
                let itemContainer = (
                    <View key={i}>
                        {child}
                    </View>);
                pageArr.push(itemContainer);
            }
            return pageArr;
        } else {
            return null;
        }
    }

    _renderDataAndGroup() {
        const editable = !!this.props.param.editable;
        if (!this.fetchSuccessful) {
            return (
                <EmptyData
                    style={{flex: 1, backgroundColor: '#F0F0F0',}}
                    refreshStyle={{
                        borderColor: '#F4F4F4', height: 30, marginTop: 20,
                        borderWidth: 1, borderRadius: 5
                    }}
                    textStyle={{fontSize: 14, height: 30, marginTop: 10}}
                    onPress={() => this._fetchFlowMenuInfo()}
                />
            );
        }
        return (
            <ScrollView>
                <View>
                    {/*{this._renderGroups()}*/}
                    <AttachmentListPage
                        navigator={this.props.navigator}
                        param={this.props.param}
                        asInnerPage={true}
                        editable={editable}
                    />
                </View>
            </ScrollView>
        );
    }

    render() {
        return (
            <View style={[{flex: 1,}, CommonStyles.backgroundColor]}>
                {this._renderDataAndGroup()}
                <View style={{height: Platform.OS === 'ios' ? 0 : 30,}}/>
            </View>
        );
    }
}