import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
} from 'react-native';

import ScrollableTabView from '../../components/ScrollableTabView/ScrollableTabView';
import DefaultTabBar from '../../components/ScrollableTabView/DefaultTabBar';
import NavigationBar from '../../components/navigator/NavBarView';
import OptionalModalView from '../../components/optionalModal/optionalModalView';
import CommonFunc from '../commonStyle/commonFunc';
import SummaryInfoPage from './summaryInfoPage';
import ApproveOpinion from './historyOpinionPage';
import BusinessForm from './businessFormPage';
import GroupInfoPage from './groupInfoPagePage';
import UploadPage from './attachmentUploadPage';
import Icon from 'react-native-vector-icons/Ionicons';

import {
    MENU_DISPLAY_KEY,
    MENU_CHANGE_EVENT,
    MENU_INFO_CHANGE_EVENT,
} from './menuHandler';

export default class BusinessDetailPage extends Component {
    constructor(props) {
        super(props);
        this._renderBarRightBtn = this._renderBarRightBtn.bind(this);
        this._onPageChange = this._onPageChange.bind(this);
        this._onMenuGroupChange = this._onMenuGroupChange.bind(this);
        this._onMenuItemClicked = this._onMenuItemClicked.bind(this);
        this._toUploadPage = this._toUploadPage.bind(this);
        this._getFlowInfoText = this._getFlowInfoText.bind(this);
        this._renderFlowInfo = this._renderFlowInfo.bind(this);
        this.state = {
            showRightAction: false,//显示右上角按钮
            pageIndexForBtn: -1,//记录对应按钮对应的页面索引,不用页签可能显示不同按钮
            currentGroupIndex: 0,
            menuGroups: [],//菜单处理，数据不再以分组展现，只显示【流程表单 | 附件详情】
        };
        this.fetchSuccessful = false;
    }

    componentDidMount() {
        CommonFunc.addListenerAndType(this._onMenuGroupChange, MENU_CHANGE_EVENT);
    }

    componentWillUnmount() {
        CommonFunc.removeListenerAndType(this._onMenuGroupChange, MENU_CHANGE_EVENT);
    }

    _onMenuGroupChange(menus) {
        this.setState({menuGroups: menus, currentGroupIndex: 0});
    }

    _onMenuItemClicked(menuItem, rowId) {
        //附件信息虚拟菜单
        if (rowId >= 0 && rowId < this.state.menuGroups.length) {
            this.setState({currentGroupIndex: rowId});
        }
        CommonFunc.dispatchActionType(MENU_INFO_CHANGE_EVENT, menuItem);
    }

    //跳转上传页面
    _toUploadPage() {
        const param = this._getCommonFlowParam();
        this.props.navigator.push({
            id: 'UploadPage',
            comp: UploadPage,
            param: param,
        });
    }

    _renderBarRightBtn() {
        // return null;
        const showUploadBtn = this.state.pageIndexForBtn == 2;//显示上传按钮
        const editable = this.props.param.editable && !this.props.param.isReading; // 可编辑 & 待办
        // if (!(this.state.showRightAction && (this.state.menuGroups.length > 0 || showUploadBtn))) {
        if (!(this.state.showRightAction && (showUploadBtn && editable))) {
            return null;
        }
        if (showUploadBtn) {
            return (
                <TouchableOpacity
                    style={{alignItems: 'flex-end', paddingRight: 5,}}
                    onPress={this._toUploadPage}
                >
                    <Icon name={'md-add'} size={25}/>
                </TouchableOpacity>
            );
        }
        return null;
        return (
            <TouchableOpacity
                style={{alignItems: 'flex-end', padding: 15,}}
                onPress={() => this.refs.OptionalModalView.open()}
            >
                <Image
                    source={require('../../image/group_more.png')}
                    style={{width: 20, height: 20,}}
                />
            </TouchableOpacity>
        );
    }

    _getCommonFlowParam() {
        const listData = this.props.param.listData;
        const flowNo = CommonFunc.getValueByKeyArr(listData, ['FLOWNO', 'itemno']);
        const serialNo = CommonFunc.getValueByKeyArr(listData, ['SERIALNO', 'itemno']);
        const objectNo = CommonFunc.getValueByKeyArr(listData, ['OBJECTNO', 'itemno']);
        return {flowNo: flowNo, serialNo: serialNo, objectNo: objectNo};
    }

    _onPageChange(changeInfo) {
        const fromPage = changeInfo.from;
        const toPage = changeInfo.i;
        const idxs = [0, 2];//显示按钮的页面索引
        this.setState({showRightAction: idxs.some(idx => idx == toPage), pageIndexForBtn: toPage});
    }

    _getFlowInfoText () {
        const listData = this.props.param.listData;
        const projName = CommonFunc.getValue(listData, 'proj_name');
        const flowName = CommonFunc.getValue(listData, 'FLOWNAME');
        const phaseName = CommonFunc.getValue(listData, 'PHASENAME');
        const text = `${flowName}-->${phaseName}-->>${projName}`;
        return text;
    }

    _renderFlowInfo () {
        const text = this._getFlowInfoText();
        return (
            <View
                style={{paddingHorizontal: 14, paddingVertical: 10,}}
            >
                <Text>{text}</Text>
            </View>
        );
    }

    render() {
        const param = this._getCommonFlowParam();
        const title = this._getFlowInfoText();
        const pageParam = {
            ...param,
            ...this.props.param,
            flowInfoText: title,
        };
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title={this.props.param.title || '业务详情'}
                goBack={true}
                rightAction={this._renderBarRightBtn}
            >
                <View style={{flex: 1, backgroundColor: '#F4F4F4'}}>
                    {this._renderFlowInfo()}
                    <ScrollableTabView
                        style={{backgroundColor: 'transparent'}}
                        bounces={false}
                        scrollWithoutAnimation={true}
                        tabBarBackgroundColor="white"
                        tabBarUnderlineColor="white"
                        tabBarActiveTextColor="red"
                        tabBarInactiveTextColor="#000"
                        onChangeTab={this._onPageChange}
                        renderTabBar={()=>
                            <DefaultTabBar
                                style={{height: 45, borderColor: 'white',}}
                                underlineStyle={{height: 2, backgroundColor: 'red',}}
                                backgroundColor='rgba(255, 255, 255, 0.7)'
                                textStyle={{fontSize: 15,}}
                                tabStyle={{paddingBottom: 0,}}
                            />
                        }
                    >
                        {/*<SummaryInfoPage*/}
                        {/*tabLabel="核心信息"*/}
                        {/*navigator={this.props.navigator}*/}
                        {/*param={pageParam}*/}
                        {/*/>*/}
                        <GroupInfoPage
                            tabLabel="基本信息"
                            navigator={this.props.navigator}
                            param={pageParam}
                        />
                        <ApproveOpinion
                            tabLabel="流转意见"
                            navigator={this.props.navigator}
                            param={pageParam}
                            fromCompleted={true}
                        >
                        </ApproveOpinion>
                        <BusinessForm
                            tabLabel="附件信息"
                            navigator={this.props.navigator}
                            param={pageParam}
                            fromCompleted={true}
                        />

                    </ScrollableTabView>
                    <OptionalModalView
                        ref="OptionalModalView"
                        dataSource={this.state.menuGroups}
                        displayKey={MENU_DISPLAY_KEY}
                        clickOnPress={this._onMenuItemClicked}
                        onRequestClose={
                            () => this.refs.OptionalModalView.close()
                        }
                    />
                </View>
            </NavigationBar>
        );
    }
}