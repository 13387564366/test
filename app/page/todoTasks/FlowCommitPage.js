/**
 * Created by Administrator on 2016/11/8.
 */
import React from 'react';
import {
    View,
    Text,
    ListView,
    ScrollView,
    Dimensions,
    Alert,
    InteractionManager,
    TouchableOpacity,
    Platform,
} from 'react-native';

import NavigationBar from '../../components/navigator/NavBarView';
import RadioForm from '../../components/radioBtnForm/SimpleRadioButton';
import CheckBox from '../../components/checkBoxItem/checkBoxItem';
import FlowAction from '../../actions/FlowActions';
import CommonStyle from '../../modules/CommonStyle'
import CommonFunc from '../commonStyle/commonFunc';
import CommonButtons from '../commonStyle/commonButtons';
import CommonActions from '../../actions/AttachmentActions';
import Menu, {
    MenuContext,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import AppConstants from '../../constants/AppConstants';
import AppDispatcher from '../../dispatcher/AppDispatcher';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const BorderWidth = 0;
let userNamesArray = new Array();
const FETTH_COMMIT_ROUTE_SUCCESSFUL = '200';
const FETTH_SUCCESSFUL_WARM = '-500';
const DISPLAY_TIPS = '请选择处理节点';
const unSelectTips = {showAlert: true, msg: '请选择下一步处理节点'};
const SINGLE_PASSED = 'Single';//单人处理
const ALL_PASSED = 'AllPassed';//多人全部
const ONE_PASSED = 'OnePassed';//多人任一
const N_PASSED = 'NPassed';//N人处理【一般不用，默认同多人任一】

export default class CommitDirector extends React.Component {

    constructor(props) {
        super(props);
        this._fetchData = this._fetchData.bind(this);
        this._pushWorkFlowData = this._pushWorkFlowData.bind(this);
        this._popToHomePage = this._popToHomePage.bind(this);
        this._renderRow = this._renderRow.bind(this);
        this._renderContentView = this._renderContentView.bind(this);
        this._renderMenuOption = this._renderMenuOption.bind(this);
        this._menuOnSelect = this._menuOnSelect.bind(this);
        this._calculateSingleRouteValue = this._calculateSingleRouteValue.bind(this);
        this._goBack = this._goBack.bind(this);
        this._handlePushUsers = this._handlePushUsers.bind(this);
        this._isNodeUnselect = this._isNodeUnselect.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.nextsteps = CommonFunc.getValueByKeyArr(this.props.param.flowModelInfo, ['NEXTSTEPS', 'value']);
        this.isLastUser = [];
        this.state = {
            selectData: [],
            condition: '',
            selectedRoute: null,
            nextRouteNode: {},
            nextRouteNodeName: '',
            nextRouteNodeId: '',
            readUsersArray: null,
        };
        this.flowCondition = '';

        this.userNamesArray = {};
        this.updateIndex = 1;
        this.nextData = [];//下一步路由数据
        this.fetchSuccessful = null;
    }

    componentDidMount () {
        this._fetchData();
    }

    _popToHomePage () {
        const {navigator} = this.props;
        if (navigator) {
            const routes = navigator.getCurrentRoutes();
            // navigator.popToRoute(routes[0]);
            //变更：返回首页-->返回流程待办页面
            //流程页面，可能有不同入口进入，简单起见，为了统一返回页面 统一返回：首页
            navigator.popToRoute(routes[0]);
        }
        AppDispatcher.dispatch({actionType: AppConstants.REFRESH_DARA});
    }
    _fetchFlowMenuInfo (response) {
        this.response = response;
        console.log(this.nextsteps);
        CommonActions.getCodeDicts({
            type: 'code',
            source: response.condition,
        }, (responseData) => {
            console.log(responseData);
            this.updateIndex++;
            this.fetchSuccessful = true;
            const selectData = responseData.selectData;
            if (selectData.length > 0) {
                this.setState({selectData: selectData});
                this._conditionSelected(selectData[0])
            }else{
                this._handleNextRoute(response);
                this.setState({});
            }
        }, (error) => {
            this.fetchSuccessful = false;
            CommonFunc.alert(error);
        });
    }
    _fetchData () {
        const param = {
            serialNo: this.props.param.serialNo,
        };
        InteractionManager.runAfterInteractions(() => {
            FlowAction.fetchCommitList(param, (response) => {
                const routeType = response.routeType || '';
                this.routeType = routeType;
                if (this.routeType == 'commroute' || this.routeType == 'conditionroute') {
                    this._fetchFlowMenuInfo(response);
                } else {
                    this._handleNextRoute(response);
                    this.updateIndex++;
                    this.setState({});
                    this.fetchSuccessful = true;
                }
            }, (error) => {
                this.fetchSuccessful = false;
                this.updateIndex++;
                this.setState({});
                Alert.alert(
                    '提示',
                    error,
                    [{text: '确定'}]
                );
            });
        });
    }

    _handleNextRoute (body) {
        const nodes = this._handleRouteInfo(body);
        console.log(nodes);
        if (nodes.length > 0) {
            let nextData = nodes[0];
            this.setState({
                selectedRoute: nextData,
                nextRouteNode: nextData || {},
                nextRouteNodeName: nextData.display || '--',
            });
        } else {
            this.setState({
                selectedRoute: null,
                nextRouteNode: {},
                nextRouteNodeName: ''
            });
        }
    }

    //处理并组织数据格式
    _handleRouteInfo (body) {
        this.isLastUser = body.isLastUser == 'Yes';
        const readUsers = (body.readerList && body.readerList.readerList) || [];
        const readUsersArray = [];
        readUsers.forEach(item => {
            readUsersArray.push({'userName': item.display, 'userId': item.value, 'checked': true});
        });
        this.setState({readUsersArray: readUsersArray});
        const routes = body.phaseAction || [];//下一步节点s
        // const routeType = body.routeType || '';
        // this.routeType = routeType;
        const routeType = this.routeType;

        const isParallel = routeType == 'parallelroute', parallelNodes = [];
        let parallelDisplay = '';
        const isSelect = routeType == 'selectroute';
        const commonAndCondition = routeType == 'commroute' || routeType == 'conditionroute';
        const nodes = [];
        routes.forEach((routeItem, i) => {
            const phaseName = routeItem.display;//节点名称
            routeItem.phaseName = phaseName;
            const phaseNo = routeItem.value;//节点编号
            const phaseUsers = (routeItem.phaseDatas && routeItem.phaseDatas.userInfo) || [];
            const userNamesArray = [];
            phaseUsers.forEach(userItem => {
                const userStr = userItem.value || '';
                const userNamePair = userStr.split(' ');
                const userName = userNamePair[1] || '';
                userNamesArray.push({userId: userStr, userName: userName})
            });
            routeItem.userInfo = userNamesArray;
            routeItem.phaseNo = phaseNo;
            const processMode = routeItem.processMode || '01';
            let method = 'Single';
            switch (processMode) {
                case '01'://单人处理
                    method = SINGLE_PASSED;
                    break;
                case '02'://多人全部
                    method = ALL_PASSED;
                    break;
                case '03'://多人任一
                    method = ONE_PASSED;
                    break;
                case '04'://N人处理【一般不用，默认同多人任一】
                    method = N_PASSED;
                    break;
            }
            routeItem.dealMethod = method;
            //处理完成一条路径
            if (commonAndCondition || isSelect) {
                nodes.push({display: phaseName, nodes: [routeItem]});
            } else if (isParallel) {
                parallelDisplay += parallelDisplay ? ', ' + phaseName : phaseName;
                parallelNodes.push(routeItem);
            }
        });

        if (isParallel) {
            nodes.push({display: parallelDisplay, nodes: parallelNodes});
        }
        const length = nodes.length;//处理节点数量
        if (length > 1) {
            nodes.unshift({display: DISPLAY_TIPS, nodes: []});
        }
        this.nextData = nodes;
        return nodes;
    }

    _handleSelectedUsersCount (users) {
        let selectedUsersCount = 0;
        users.forEach((user) => {
            if (user.checked) {
                selectedUsersCount++;
            }
        });
        return selectedUsersCount;
    }

    //生成传送给后台的用户信息，格式：「节点名称1：username1#username2#username3，节点名称2：username1#username2#username3」
    _handlePushUsers (users) {
        if (this._getNextNodeTypes().indexOf('END') > -1) {
            return 'system';
        }
        let ret = '';
        const isParallel = this.routeType == 'parallelroute';//并行
        for (let key in users) {
            let phaseUsers = '';
            users[key].forEach((item) => {
                if (item.checked) {
                    if (phaseUsers) {
                        phaseUsers += '@';
                    }
                    phaseUsers += item.userId;// userId格式: 【userid username】
                }
            });
            if (isParallel) {
                ret += (key + '|' + phaseUsers);
            } else {
                ret = phaseUsers;
            }
        }
        console.log('处理人员：');
        console.log(users);
        console.log(ret);
        return ret;
    }

    _handlePushNodes (users) {
        let ret = '';
        for (let key in users) {
            if (ret) {
                ret += ';';
            }
            ret += key;
        }
        console.log('处理节点：');
        console.log(users);
        console.log(ret);
        return ret;
    }

    _handleReadUsers (users) {
        let ret = '';
        users.forEach((item) => {
            if (item.checked) {
                if (ret) {
                    ret += '@';
                }
                // ret += item.userId + " " + item.userName;
                ret += item.userId;
            }
        });
        return ret;
    }

    _shouldAlert (phaseMethod, phaseNo) {
        // 结束状态 ：dealMethod：null，
        // 不是结束状态，则必须选择，下一个路由处理人
        let alertMsg = null;
        let showAlert = false;
        const userNames = this.userNamesArray[phaseNo] || [];
        const userCount = userNames.length;
        const selectedCount = this._handleSelectedUsersCount(userNames) || 0;
        // '(单人处理)' : "(多人任一)";(多人全部)" : "(多人任意)"
        switch (phaseMethod) {
            case SINGLE_PASSED:
                showAlert = selectedCount != 1;
                alertMsg = '请选择 (单人处理) 中的处理人';
                break;
            case ONE_PASSED:
                showAlert = selectedCount <= 0;
                alertMsg = '请指定 (多人任一) 中的处理人';
                break;
            case ALL_PASSED:
                showAlert = selectedCount <= 0;
                alertMsg = '请选择 (多人全部) 中的全部处理人';
                break;
            case N_PASSED:
                showAlert = selectedCount <= 0;
                alertMsg = '请选择 (N人处理) 中的至少一个处理人';
            default:
                // showAlert = true;
                // alertMsg = '当前已是最终流程，手机没有处理权限';
                break;
        }
        alertMsg = '请选择下一步处理人';
        return {showAlert: showAlert, msg: alertMsg};
    }

    //获取节点号
    _getPhaseNos () {
        let phaseNos = '';
        const selectedRoute = this.state.selectedRoute || {nodes: []};
        selectedRoute.nodes.forEach(nodeItem => {
            if (phaseNos) {
                phaseNos += ';';//分割符
            }
            phaseNos += nodeItem.phaseNo;
        });
        return phaseNos;
    }

    //获取下一步的节点类型
    _getNextNodeTypes () {
        let nodeTypes = '';
        const selectedRoute = this.state.selectedRoute || {nodes: []};
        selectedRoute.nodes.forEach(nodeItem => {
            if (nodeTypes) {
                nodeTypes += ';';//分割符
            }
            nodeTypes += nodeItem.nodeType;
        });
        return nodeTypes;
    }

    //获取当前步骤的处理人数
    _getForkUsers () {
        let forkUsers = '1';
        const selectedRoute = this.state.selectedRoute || {nodes: []};
        selectedRoute.nodes.forEach(nodeItem => {
            forkUsers = nodeItem.forkNumber || '1';
        });
        return forkUsers;
    }

    /**
     * 节点是否选择
     * @private
     */
    _isNodeUnselect () {
        let selectedRoute = this.state.selectedRoute || {nodes: []};
        if (this.nextData.length > 1) {
            return selectedRoute.display == DISPLAY_TIPS || !this.fetchSuccessful;
        } else {
            return false;
        }
    }

    //计算处理人选择是否合规
    _calculateSingleRouteValue () {
        let selectedRoute = this.state.selectedRoute || {nodes: []};
        for (let i = 0; i < selectedRoute.nodes.length; i++) {
            let item = selectedRoute.nodes[i];
            let calculateResult = this._shouldAlert(item.dealMethod, item.phaseNo);
            if (calculateResult.showAlert) {
                return calculateResult;
            }
        }
        return {showAlert: false};
    }

    //判断是否需要选择处理人
    _needSelect () {
        // 节点未选择，直接提示
        if (this._isNodeUnselect()) {
            return true;
        }
        const nextNodeTypes = this._getNextNodeTypes();
        const forkUsers = this._getForkUsers();
        //非必须选择处理人情况：
        // 1）结束节点
        // 2）合并节点且非最后处理人员
        // 3）其它情况不是最后一个人
        const noNeedSelect = nextNodeTypes.indexOf('END') > -1 || (nextNodeTypes.indexOf('JOIN') > -1 && forkUsers > 1) || !this.isLastUser;
        return !noNeedSelect;
    }

    _pushWorkFlowData () {
        // 节点未选择，直接提示
        if (this._isNodeUnselect()) {
            CommonFunc.alert(unSelectTips.msg);
            return;
        }
        const param = {
            flowCondition: this.flowCondition || '',
            serialNo: this.props.param.serialNo,
            phaseAction: this._handlePushUsers(this.userNamesArray),
            phaseOpinion: this._getPhaseNos(), //user
            readUserIds: this._handleReadUsers(this.state.readUsersArray),
        };
        console.log('提交的路由信息');
        console.log(param);
        const needSelect = this._needSelect();
        let result = this._calculateSingleRouteValue();
        if (needSelect && result.showAlert) {
            CommonFunc.alert(result.msg);
        } else {
            FlowAction.submitWorkFlow(param, (response) => {
                Alert.alert(
                    '提示',
                    '流程提交成功',
                    [{text: '返回待办页面', onPress: () => this._popToHomePage()}]
                );
            }, (error) => {
                this.setState({});
                Alert.alert(
                    '提示',
                    error,
                    [{
                        text: '确定', onPress: () => {
                        }
                    }]
                );
            });
        }
    }

    _handleSinglePassed (items, selectedName) {
        items.forEach((item) => {
            item.checked = false;
            if (item.userId == selectedName) {
                item.checked = true;
            }
        });
        console.log(items);
    }

    _renderRow (rowData, rowId) {
        const processNmae = rowData.phaseName;
        const phaseNo = rowData.phaseNo;
        const userNamesArray = rowData.userInfo || [];
        const dealMethod = rowData.dealMethod;
        const isAllPass = dealMethod == ALL_PASSED;//多人全部
        const singleUser = dealMethod == SINGLE_PASSED;//单人处理
        const dealType = singleUser ? 'radio' : 'checkbox';//单选/多选
        const radioArr = [];
        userNamesArray
            .map((item, i) => {
                const userId = item.userId || '';
                const userName = item.userName || '';
                if (singleUser && i == 0) {
                    item.checked = true;
                }
                if (isAllPass) {
                    item.checked = true;
                }
                radioArr.push({label: userName, value: userId});
            });
        this.userNamesArray[phaseNo] = userNamesArray;
        let childView = null;
        switch (dealType) {
            case 'radio':
                childView = (
                    <RadioForm
                        key={"RadioForm" + '-' + this.updateIndex + '-' + rowId}
                        ref={"RadioForm" + rowId}
                        style={{marginLeft: 14, paddingVertical: 5, }}
                        labelStyle={{marginRight: 15}}
                        radio_props={radioArr}
                        initial={0}
                        formHorizontal={false}
                        buttonColor={'#3877bc'}
                        buttonSize={10}
                        labelColor={'gray'}
                        labelSize={50}
                        animation={false}
                        onPress={(value) => {
                            this._handleSinglePassed(userNamesArray, value)
                        }}
                    />);
                break;
            case 'checkbox':
                childView = (
                    <View
                        style={{
                            alignItems: 'flex-start',
                            marginHorizontal: 10,
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            width: WINDOW_WIDTH - 20, backgroundColor: 'white',
                        }}
                    >
                        {
                            userNamesArray.map((item, i) =>
                                <CheckBox
                                    key={this.updateIndex + '-' + rowId + '-' + i}
                                    ref={"userCheckBoxItem" + rowId + '-' + i}
                                    style={{padding: 5, marginRight: 10, }}
                                    onClick={(isChecked) => {
                                        item.checked = isChecked
                                    }}
                                    enabled={true}
                                    isChecked={item.checked}
                                    rightTextStyle={{marginRight: 10, }}
                                    rightText={item.userName}
                                />
                            )
                        }
                    </View>
                );
                break;
            default:
                return null;
        }
        return (
            <View style={{backgroundColor: 'white', marginTop: 5, }}>
                <View style={[{
                    backgroundColor: '#EDECF2',
                    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8,
                }, CommonStyle.backgroundColor]}>
                    <Text style={{fontSize: 16, color: '#222'}}>{processNmae}</Text>
                </View>
                {childView}
            </View>

        );
    }
    _renderCondition () {
        if ((this.routeType == 'commroute' || this.routeType == 'conditionroute') &&this.state.selectData.length>0){
            return (
                <View style={{backgroundColor: 'white'}}>
                    <View style={[{backgroundColor: '#EDECF2', paddingHorizontal: 14, }, CommonStyle.backgroundColor]}>
                        <Text
                            style={{fontSize: 16, color: '#222', marginTop: 14, marginBottom: 8, }}>{'审批策略 :'}</Text>
                    </View>
                    <View style={{backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 10, }}>
                        <Menu onSelect={(obj) => this._conditionSelected(obj)}>
                            <MenuTrigger customStyles={{backgroundColor: 'red'}}>
                                <View
                                    style={{
                                        height: 30, flexDirection: 'row', borderColor: '#2F86D5',
                                        borderWidth: 0.5, borderRadius: 5, alignItems: 'center', paddingHorizontal: 5
                                    }}
                                >
                                    <Text style={{fontSize: 14, color: '#222', flex: 1, }} ellipsizeMode={'tail'}
                                        numberOfLines={1}>{this.state.condition}</Text>
                                </View>
                            </MenuTrigger>
                            <MenuOptions
                                optionsContainerStyle={{width: WINDOW_WIDTH - 28, marginTop: -20}}
                            >
                                {
                                    this.state.selectData.map((item, i) =>
                                        this._renderMenuOption(item.itemname, item, i))
                                }
                            </MenuOptions>
                        </Menu>
                    </View>
                </View>
            )
        }
    }
    _conditionSelected (obj) {
        var response = Object.assign({}, this.response);;
        const nextsteps = eval('(' + this.nextsteps + ')')
        this.flowCondition = obj.itemno;
        response.phaseAction = response.phaseAction.filter(function (item) {
            return item.value == nextsteps[obj.itemno];
        })
        this._handleNextRoute(response);
        this.setState({condition: obj.itemname});
        this.updateIndex++;

    }
    _renderNextData () {
        if (this.nextData.length > 0) {
            return (
                <View style={{backgroundColor: 'white'}}>
                    <View style={[{backgroundColor: '#EDECF2', paddingHorizontal: 14, }, CommonStyle.backgroundColor]}>
                        <Text
                            style={{fontSize: 16, color: '#222', marginTop: 14, marginBottom: 8, }}>{'选择下一步路由 :'}</Text>
                    </View>
                    <View style={{backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 10, }}>
                        <Menu onSelect={(obj) => this._menuOnSelect(obj)}>
                            <MenuTrigger customStyles={{backgroundColor: 'red'}}>
                                <View
                                    style={{
                                        height: 30, flexDirection: 'row', borderColor: '#2F86D5',
                                        borderWidth: 0.5, borderRadius: 5, alignItems: 'center', paddingHorizontal: 5
                                    }}
                                >
                                    <Text style={{fontSize: 14, color: '#222', flex: 1, }} ellipsizeMode={'tail'}
                                        numberOfLines={1}>{this.state.nextRouteNodeName}</Text>
                                </View>
                            </MenuTrigger>
                            <MenuOptions
                                optionsContainerStyle={{width: WINDOW_WIDTH - 28, marginTop: -20}}
                            >
                                {
                                    this.nextData.map((item, i) =>
                                        this._renderMenuOption(item.display, item, i))
                                }
                            </MenuOptions>
                        </Menu>
                    </View>
                </View>
            )
        }
    }

    _renderReadUsers () {
        let readUsersArray = this.state.readUsersArray || [];
        console.log(readUsersArray);
        if (readUsersArray.length < 1) {
            return;
        }
        let readerView = (
            <ScrollView
                contentContainerStyle={{
                    alignItems: 'flex-start',
                    marginHorizontal: 10,
                    flexDirection: 'row',
                    flexWrap: 'wrap'
                }}
                style={{flex: 1, width: WINDOW_WIDTH - 20, backgroundColor: 'white', }}
            >
                {
                    readUsersArray.map((item, i) =>
                        <CheckBox
                            key={this.updateIndex + '-' + i}
                            ref={"userCheckBoxItem" + '-' + i}
                            style={{padding: 5, marginRight: 10, }}
                            onClick={(isChecked) => {
                                item.checked = isChecked
                            }}
                            enabled={false}
                            isChecked={item.checked}
                            rightTextStyle={{marginRight: 10, }}
                            rightText={item.userName}
                        />
                    )
                }
            </ScrollView>
        );
        return (
            <View style={{backgroundColor: 'white', borderColor: 'red', borderWidth: BorderWidth, marginTop: 5, }}>
                <View style={[{
                    backgroundColor: '#EDECF2',
                    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8,
                }, CommonStyle.backgroundColor]}>
                    <Text style={{fontSize: 16, color: '#222'}}>传阅人员</Text>
                </View>
                {readerView}
            </View>);
    }

    //清空用户已选记录
    _resetUsers (nodes) {
        const nodeArr = nodes || [];
        nodeArr.forEach(nodeItem => {
            const users = nodeItem.userInfo || [];
            users.forEach(userItem => {
                userItem.checked = false;
            });
        });
    }

    _menuOnSelect (obj) {
        //下拉切换时，清除数据
        this._resetUsers(obj.nodes);
        this.userNamesArray = {};
        this.updateIndex++;
        this.setState({
            selectedRoute: obj,
            nextRouteNode: obj,
            nextRouteNodeName: obj.display,
        });

    }

    _renderRouteDetails () {
        //需要显示路由信息的情况：
        // 1）合并节点且最后一人
        // 2）其它情况且是最后一人
        if (!this._needSelect()) {//
            return null;
        }
        if (this.state.selectedRoute) {
            return (
                <ScrollView
                    contentContainerStyle={{
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        borderColor: 'green',
                        borderWidth: BorderWidth,
                    }}
                    style={{
                        flex: 0,
                        width: WINDOW_WIDTH,
                        backgroundColor: 'white',
                        borderColor: 'red',
                        borderWidth: BorderWidth,
                    }}
                >
                    {
                        this.state.selectedRoute.nodes.map((item, i) => {
                            return (
                                <View key={'item' + i}
                                    style={{width: WINDOW_WIDTH, borderColor: 'gray', borderWidth: BorderWidth, }}>
                                    {this._renderRow(item, i)}
                                </View>)
                        })
                    }
                </ScrollView>
            );
        }
    }

    _renderMenuOption (name, value, i) {
        return (
            <MenuOption value={value} key={i}>
                <View
                    style={{
                        flexDirection: 'row', borderColor: '#2F86D5',
                        borderBottomWidth: 0.5, alignItems: 'center', padding: 10
                    }}
                >
                    <Text>{name}</Text>
                </View>
            </MenuOption>
        );
    }

    _renderContentView () {
        return (
            <MenuContext style={[{flex: 1, backgroundColor: '#e7e7e7'}, CommonStyle.backgroundColor]}>
                {this._renderCondition()}
                {this._renderNextData()}
                {this._renderRouteDetails()}
                {this._renderReadUsers()}
            </MenuContext>
        );
    }

    _goBack () {
        this.props.navigator.pop();
    }

    _renderSubmitBtn () {
        const btns = [{text: '确定提交', onPress: this._pushWorkFlowData}];
        return (
            <CommonButtons
                buttons={btns}
            />
        );
    }

    render () {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title="提交"
                goBack={true}
                contentMarginBottom={24}
            >
                <View style={{flex: 1, }}>
                    {this._renderContentView()}
                    {this._renderSubmitBtn()}
                </View>
            </NavigationBar>
        );
    }
}