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
import RentListStylePage from './rentListStylePage';
import CommonStyle from '../../modules/CommonStyle'
import CommonFunc from '../commonStyle/commonFunc';
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
    PAGE_STYLE_KEY,
} from './menuHandler';
import CommonButtons from "../commonStyle/commonButtons";
import SignOpinions from "./signOpinions";

export default class GroupInfoPage extends Component {
    constructor(props) {
        super(props);
        this._fetchFlowMenuInfo = this._fetchFlowMenuInfo.bind(this);
        this._toFormDetailPage = this._toFormDetailPage.bind(this);
        this._getCommonFlowParams = this._getCommonFlowParams.bind(this);
        this._sendChangedMenus = this._sendChangedMenus.bind(this);
        this._onMenuInfoChange = this._onMenuInfoChange.bind(this);
        this._toSignOpinionPage = this._toSignOpinionPage.bind(this);
        this._endReadingTask = this._endReadingTask.bind(this);

        this.state = {
            dataSource: [],
            menuGroups: [],
            menuInfo: null,
            groups: [],
            button: '',
        };
        //重新调整，list 、基本表单后的标记，默认分组为空（排除 附件信息分组），
        this.fetchSuccessful = false;
        this.allEmpty = true;//未配置分组信息，或者获取失败 标记
        this.title = this.props.param.flowname;//获取流程的标题
        this.flowModelInfo = {};
    }

    componentDidMount () {
        InteractionManager.runAfterInteractions(() => this._fetchFlowMenuInfo());
        CommonFunc.addListenerAndType(this._onMenuInfoChange, MENU_INFO_CHANGE_EVENT);
    }

    componentWillUnmount () {
        CommonFunc.removeListenerAndType(this._onMenuInfoChange, MENU_INFO_CHANGE_EVENT);
    }

    _fetchFlowMenuInfo () {
        const {serialNo, objectNo} = this._getCommonFlowParams();
        TodoTaskActions.getFlowMenuInfos({
            serialNo: serialNo,
            objectNo: objectNo,
        }, (responseData) => {
            const buttons = responseData.button || '';
            const opinionsRequired = responseData.opinionsRequired !== 'N';
            const menuGroups = handleMenuInfos(responseData);
            console.log(menuGroups);
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
            this.flowModelInfo = CommonFunc.handleArr2Obj(CommonFunc.getValueByKeyArr(responseData, ['flowModel', 'dataElements']) || []);
            console.log( this.flowModelInfo)
            this.fetchSuccessful = true;
            this.setState({...menus, buttons: buttons, opinionsRequired: opinionsRequired});
            // this._fetchSummaryInfo(menus);
        }, (error) => {
            this.fetchSuccessful = false;
            CommonFunc.alert(error);
        });
    }

    _fetchSummaryInfo (menus) {
        const param = this._getCommonFlowParams();
        TodoTaskActions.fetchSummaryInfo(param
            , (response) => {
                const buttons = response.button || '';
                const opinionsRequired = response.opinionsRequired !== 'N';
                // const summaryDatas = this._handleSummaryInfo(response);
                this.fetchSuccessful = true;
                // this.setState({datas: summaryDatas, buttons: buttons, opinionsRequired: opinionsRequired});
                this.setState({...menus, buttons: buttons, opinionsRequired: opinionsRequired});
            }, (error) => {
                this.fetchSuccessful = false;
                CommonFunc.alert(error);
            });
    }

    //发送菜单变更通知
    _sendChangedMenus (changedMenus) {
        CommonFunc.dispatchActionType(MENU_CHANGE_EVENT, changedMenus);
    }

    _onMenuInfoChange (menuInfo) {
        this.setState({menuInfo: menuInfo, groups: menuInfo[GROUP_SUB_PAGE_KEY]});
    }

    _getCommonFlowParams () {
        const listData = this.props.param.listData;
        const flowNo = CommonFunc.getValueByKeyArr(listData, ['FLOWNO', 'itemno']);
        const serialNo = CommonFunc.getValueByKeyArr(listData, ['SERIALNO', 'itemno']);
        const objectNo = CommonFunc.getValueByKeyArr(listData, ['OBJECTNO', 'itemno']);
        return {flowNo: flowNo, serialNo: serialNo, objectNo: objectNo, flowInfoText: this.props.param.flowInfoText};
    }

    _handlePostParam (postParam, paramKeys) {
        const listData = this.props.param.listData;
        paramKeys.forEach(paramKey => {
            const temp = this._getValueByKey(listData, paramKey);
            if (temp) {
                postParam[paramKey] = temp;
            }
        });
    }

    _getValueByKey (listData, key = '') {
        let value = null;
        const lowerKey = key.toLowerCase();
        for (let listKey in listData) {
            const tempKey = listKey.toString().toLowerCase();
            if (lowerKey == tempKey) {
                value = CommonFunc.getValueByKeyArr(listData, [listKey, 'itemno']);
            }
        }
        return value;
    }

    _toFormDetailPage (groupInfo, isProduct, flowKey) {
        const postParam = this._getCommonFlowParams();
        postParam.flowKey = flowKey || '';
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
            const style = groupInfo[PAGE_STYLE_KEY];
            const isRentListPage = style == 'list';
            const Comp = isRentListPage ? RentListStylePage : ListFormPage;
            const detailPageInfo = groupInfo.detailPageInfo;
            this.props.navigator.push({
                id: '' + Comp,
                comp: Comp,
                param: {
                    listDepth: 1,
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

    _renderCommonGroup (rowData, isProduct, flowKey) {
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
                    <View style={{flexDirection: 'row', alignItems: 'center', }}>
                        {
                            isAttachment ?
                                <Image source={require('../../image/list_icon_blue.png')} />
                                :
                                <Image source={require('../../image/list_icon.png')} />
                        }
                        <Text style={{
                            marginLeft: 10,
                            color: '#000',
                            marginVertical: 12,
                        }}>{displayText}</Text>
                    </View>
                    <Icon name={'angle-right'} size={25} color={'#767A8B'} />
                </View>
            </TouchableOpacity>

        );
    }

    _renderGroups () {
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

    _toSignOpinionPage () {
        const navigator = this.props.navigator;
        if (navigator) {
            const param = this._getCommonFlowParams();
            // //意见必填
            // param.opinionRequired = this.state.opinionRequired;
            // const buttons = this.state.buttons.toLowerCase();
            // //可否退回
            // param.allowBack = buttons.indexOf('backstep') > -1;
            //意见必填
            param.opinionRequired = CommonFunc.getValueByKeyArr(this.flowModelInfo, ['OPINIONSREQUIRED', 'value']) !== 'N';
            const buttons = CommonFunc.getValueByKeyArr(this.flowModelInfo, ['ATTRIBUTE1', 'value']).toLowerCase();
            param.flowModelInfo = this.flowModelInfo;
            //可否退回
            param.allowBack = buttons.indexOf('backstep') > -1;
            navigator.push({
                id: 'SignOpinions',
                comp: SignOpinions,
                param: param,
            });
        }
    };

    _endReadingTask () {
        const listData = this.props.param.listData;
        const readerId = CommonFunc.getValueByKeyArr(listData, ['v.readerId', 'value']);
        const param = {
            id: readerId,
        };
        TodoTaskActions.endReadingTask(param, (response) => {
            CommonFunc.goBack(this);
        }, (error) => {
            CommonFunc.alert(error);
        });
    }

    _isShowBtn () {
        return !!(this.fetchSuccessful && (this.props.param.editable || this.props.param.isReading));
    }

    _getPaddingBottom () {
        return Platform.OS === 'android' ? 24 : 10;
    }

    _renderNextBtn () {
        const text = this.props.param.isReading ? '结束传阅' : '签署意见';
        const func = this.props.param.isReading ? () => CommonFunc.confirm('确定结束传阅?', this._endReadingTask) : this._toSignOpinionPage;
        const btns = [{text: text, onPress: () => func()}];
        const showBtns = this._isShowBtn();
        const bottom = this._getPaddingBottom();
        return (
            <CommonButtons
                containerStyle={{
                    backgroundColor: 'transparent',
                    position: 'absolute',
                    bottom: bottom,
                }}
                buttons={btns}
                show={showBtns}
            />
        );
    }

    _renderDataAndGroup () {
        const editable = !!this.props.param.editable;
        if (!this.fetchSuccessful || !this.state.menuInfo) {
            return (
                <EmptyData
                    style={{flex: 1, backgroundColor: '#F0F0F0', }}
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
            <View>
                {this._renderGroups()}
            </View>
        );
    }

    render () {
        const paddingBottom = this._getPaddingBottom();
        const contentPaddingBottom = this._getPaddingBottom() + (this._isShowBtn() ? 50 : 0);
        return (
            <View
                style={{flex: 1, paddingBottom: paddingBottom}}
            >
                <ScrollView
                    style={[{flexDirection: 'column', backgroundColor: 'transparent'}, CommonStyle.backgroundColor]}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{flex: 1, justifyContent: 'space-between', paddingBottom: contentPaddingBottom}}>
                        {this._renderDataAndGroup()}
                    </View>
                </ScrollView>
                {this._renderNextBtn()}
            </View>
        );
    }
}