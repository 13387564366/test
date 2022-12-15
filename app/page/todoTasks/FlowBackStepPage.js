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
import RadioForm  from '../../components/radioBtnForm/SimpleRadioButton';
import CheckBox  from '../../components/checkBoxItem/checkBoxItem';
import TodoTaskAction from '../../actions/FlowActions';
import CommonStyle from '../../modules/CommonStyle'
import CommonFunc from '../commonStyle/commonFunc';
import Menu, {
    MenuContext,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';

const WINDOW_WIDTH = Dimensions.get('window').width;
const BorderWidth = 0;
let userNamesArray = new Array();
import AppConstants from '../../constants/AppConstants';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import CommonButtons from '../commonStyle/commonButtons';
const DISPLAY_TIPS = '请选择处理节点';
const unSelectTips = {showAlert: true, msg: '请选择下一步处理节点'};

export default class BackStepDirector extends React.Component {
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
        this._handleBackSubmitPressed = this._handleBackSubmitPressed.bind(this);
        this._goBack = this._goBack.bind(this);
        this._renderSubmitBtn = this._renderSubmitBtn.bind(this);
        this._isNodeUnselect = this._isNodeUnselect.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.nextData = [];
        this.isLastUser = [];
        this.state = {
            dealMethod: null,
            userNames: '',
            nextRouteNode: {},
            nextRouteNodeName: '',
            nextRouteNodeId: '',
            backOptions: [],
            userCanSelect: true,
        };
        this.selectedRoute = null;
        this.userNamesArray = {};
        this.updateIndex = 1;
        this.fetchSuccessful = null;
    }

    componentDidMount() {
        this._fetchData();
    }

    _popToHomePage() {
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

    _fetchData() {
        const param = {
            serialNo: this.props.param.serialNo,
        };
        InteractionManager.runAfterInteractions(() => {
            TodoTaskAction.getBackStepDirector(param, (response) => {
                this._handleNextRoute(response);
                this.updateIndex++;
                this.fetchSuccessful = true;
                this.setState({});
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

    //处理并组织数据格式
    _handleRouteInfo(body) {
        const phaseAction = body.phaseAction || [];
        let nodes = [];
        phaseAction.forEach(phaseItem => {
            const display = phaseItem.display;
            const nodeArr = [];
            nodeArr.push(phaseItem);
            nodes.push({display: display, nodes: nodeArr});
        });
        const length = nodes.length;//处理节点数量
        if (length > 1) {
            nodes.unshift({display: DISPLAY_TIPS, nodes: []});
        }
        this.nextData = nodes;
        return nodes;
    }

    _handleBackSumbitOptions(body) {
        const backSubmitOptions = [];
        const directSubmit = CommonFunc.getValueByKeyArr(body, ['menuDirectSubmit']) || {};
        const stepSubmit = CommonFunc.getValueByKeyArr(body, ['menuStepApprove']) || {};
        backSubmitOptions.push(directSubmit);
        backSubmitOptions.push(stepSubmit);
        let canUserSelect = true;//用户可否选择
        backSubmitOptions.forEach(backOption => {
            canUserSelect = backOption.disabled == 'false';
            backOption.checked = backOption.checked == 'true';
        });
        const ret = {backSubmitOptions: backSubmitOptions, canUserSelect: canUserSelect};
        return ret;
    }

    _handleNextRoute(body) {
        const nodes = this._handleRouteInfo(body);
        const {backSubmitOptions, canUserSelect} = this._handleBackSumbitOptions(body);
        if (nodes.length > 0) {
            let nextData = nodes[0];
            this.selectedRoute = nextData;
            this.setState({
                nextRouteNode: nextData || {},
                nextRouteNodeName: nextData.display || '--',
                backOptions: backSubmitOptions,
                userCanSelect: canUserSelect,
            });
        }
    }

    _handleSelectedUsersCount(users) {
        let selectedUsersCount = 0;
        users.forEach((user) => {
            if (user.checked) {
                selectedUsersCount++;
            }
        });
        return selectedUsersCount;
    }

    //生成传送给后台的用户信息，格式：「节点名称1：username1#username2#username3，节点名称2：username1#username2#username3」
    _handlePushUsers(users, getKey) {
        let string = '';
        for (let key in users) {
            users[key].forEach((item) => {
                if (item.checked) {
                    string += item[getKey];
                }
            });
        }
        return string;
    }

    _shouldAlert(dealMethod, phaseNo) {
        // 结束状态 ：dealMethod：null，
        // 不是结束状态，则必须选择，下一个路由处理人
        let alertMsg = null;
        let showAlert = false;
        const userNames = this.userNamesArray[phaseNo] || [];
        const userCount = userNames.length;
        const selectedCount = this._handleSelectedUsersCount(userNames) || 0;
        // '(单人处理)' : "(多人任一)";(多人全部)" : "(多人任意)"
        switch (dealMethod) {
            case 'Single':
            case 'radio':
                showAlert = selectedCount != 1;
                alertMsg = '请选择 (单人处理) 中的处理人';
                break;
            case 'OnePassed':
                showAlert = selectedCount != 1;
                alertMsg = '请指定 (多人任一) 中的处理人';
                break;
            case 'AllPassed':
                showAlert = selectedCount != userCount;
                alertMsg = '请选择 (多人全部) 中的全部处理人';
                break;
            case 'NPassed':
            case 'checkbox':
                showAlert = selectedCount <= 0;
                alertMsg = '请选择 (多人任意) 中的至少一个处理人';
            default:
                // showAlert = true;
                // alertMsg = '当前已是最终流程，手机没有处理权限';
                break;
        }
        return {showAlert: showAlert, msg: alertMsg};
    }

    /**
     * 节点是否选择
     * @private
     */
    _isNodeUnselect() {
        let selectedRoute = this.selectedRoute || {nodes: []};
        if (this.nextData.length > 1) {
            return selectedRoute.display == DISPLAY_TIPS || !this.fetchSuccessful;
        } else {
            return false;
        }
    }

    _calculateSingleRouteValue() {
        // 节点未选择，直接提示
        let selectedRoute = this.selectedRoute || {nodes: []};
        for (let i = 0; i < selectedRoute.nodes.length; i++) {
            let item = selectedRoute.nodes[i];
            let calculateResult = this._shouldAlert(item.type, item.value);
            if (calculateResult.showAlert) {
                return calculateResult;
            }
        }
        const showAlert = this._getBackSubmitVal() == null;
        return {showAlert: showAlert, msg: '请选择退回提交方式'};
    }

    _getBackSubmitVal() {
        const backOptions = this.state.backOptions;
        let selectBackVal = null;
        backOptions.forEach(option => {
            if (option.checked) {
                selectBackVal = option.value;
            }
        });
        return selectBackVal;
    }

    _pushWorkFlowData() {
        if (this._isNodeUnselect()) {
            CommonFunc.alert(unSelectTips.msg);
            return;
        }
        const param = {
            serialNo: this.props.param.serialNo,
            returnTaskNo: this._handlePushUsers(this.userNamesArray, 'userId'),
            phaseAction: this._handlePushUsers(this.userNamesArray, 'userName'),
            backType: this._getBackSubmitVal(),
        };
        console.log(this.state.nextRouteNode);
        console.log(this.userNamesArray);
        console.log('提交的路由信息');
        console.log(param);
        let result = this._calculateSingleRouteValue();
        if (result.showAlert) {
            CommonFunc.alert(result.msg);
        } else {
            TodoTaskAction.backStepWorkFlow(param, (response) => {
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

    _handleSinglePassed(items, selectedName) {
        items.forEach((item) => {
            item.checked = false;
            if (item.userId == selectedName) {
                item.checked = true;
            }
        });
    }

    _renderRow(rowData, rowId) {
        const processNmae = rowData.display;
        const phaseNo = rowData.value;
        const phaseDatas = rowData.phaseDatas;
        if (!phaseDatas.display || !phaseDatas.value) {
            return null;
        }
        const dealMethod = rowData.type;
        const singleUser = dealMethod.toString().toLowerCase() == 'radio';
        const userNamesArray = [];
        userNamesArray.push(phaseDatas);
        const radioArr = [];
        userNamesArray.map((item, i) => {
            const userId = item.value;
            const userName = item.display;
            item.userId = userId;
            item.userName = userName;
            if (singleUser && i == 0) {
                item.checked = true;
            }
            radioArr.push({label: userName, value: userId});
        });

        this.userNamesArray[phaseNo] = userNamesArray;

        let childView = null;
        switch (dealMethod) {
            case 'radio':
                childView = (
                    <RadioForm
                        key={"RadioForm" + '-' + this.updateIndex}
                        ref={"RadioForm" + rowId}
                        style={{marginLeft: 14, paddingVertical: 5,}}
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
                    <ScrollView
                        contentContainerStyle={{
                            alignItems: 'flex-start',
                            marginHorizontal: 10,
                            flexDirection: 'row',
                            flexWrap: 'wrap'
                        }}
                        style={{flex: 1, width: WINDOW_WIDTH - 20, backgroundColor: 'white',}}
                    >
                        {
                            userNamesArray.map((item, i) =>
                                <CheckBox
                                    key={this.updateIndex + '-' + rowId + '-' + i}
                                    ref={"userCheckBoxItem" + rowId + '-' + i}
                                    style={{padding: 5, marginRight: 10,}}
                                    onClick={(isChecked) => {
                                        item.checked = isChecked
                                    }}
                                    isChecked={false}
                                    rightTextStyle={{marginRight: 10,}}
                                    rightText={item.userName}
                                />
                            )
                        }
                    </ScrollView>
                );
                break;
            default:
                return null;
        }
        return (
            <View style={{backgroundColor: 'white', borderColor: 'red', borderWidth: BorderWidth, marginTop: 5,}}>
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

    //清空用户已选记录
    _unsetUsers(nodes) {
        const nodeArr = nodes || [];
        nodeArr.forEach(nodeItem => {
            const phaseDatas = nodeItem.phaseDatas || {};
            if (phaseDatas.display && phaseDatas.value) {
                phaseDatas.checked = false;
            }
        });
    }

    _menuOnSelect(obj) {
        //下拉切换时，清除数据
        this._unsetUsers(obj.nodes);
        this.userNamesArray = {};
        this.selectedRoute = obj;
        this.updateIndex++;
        this.setState({
            nextRouteNode: obj,
            nextRouteNodeName: obj.display,
        });

    }

    _renderRouteDetails() {
        if (this.selectedRoute) {
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
                        this.selectedRoute.nodes.map((item, i) => {
                            return (
                                <View key={'item' + i}
                                      style={{width: WINDOW_WIDTH,}}>
                                    {this._renderRow(item, i)}
                                </View>)
                        })
                    }
                </ScrollView>
            );
        }
    }

    _renderMenuOption(name, value, i) {
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

    _renderSubTitle(text) {
        return (
            <View style={[{backgroundColor: '#EDECF2', paddingHorizontal: 14,}, CommonStyle.backgroundColor]}>
                <Text
                    style={{fontSize: 16, color: '#222', marginTop: 14, marginBottom: 8,}}>{text}</Text>
            </View>
        );
    }

    _renderContentView() {
        const optionsContainerHeight = this.nextData.length * 40;
        return (
            <MenuContext style={[{flex: 1, backgroundColor: '#e7e7e7'}, CommonStyle.backgroundColor]}>
                <View style={{backgroundColor: 'white'}}>
                    {this._renderSubTitle('选择下一步路由')}
                    <View style={{backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 10,}}>
                        <Menu onSelect={(obj) => this._menuOnSelect(obj)}>
                            <MenuTrigger customStyles={{backgroundColor: 'red'}}>
                                <View
                                    style={{
                                        height: 30, flexDirection: 'row', borderColor: '#2F86D5',
                                        borderWidth: 0.5, borderRadius: 5, alignItems: 'center', paddingHorizontal: 5
                                    }}
                                >
                                    <Text style={{fontSize: 14, color: '#222'}}>{this.state.nextRouteNodeName}</Text>
                                </View>
                            </MenuTrigger>
                            <MenuOptions
                                renderOptionsContainer={e=><ScrollView
                                    style={{height: optionsContainerHeight}}>{e}</ScrollView>}
                                optionsContainerStyle={{width: WINDOW_WIDTH - 28, marginTop: -30}}
                            >
                                {
                                    this.nextData.map((item, i) =>
                                        this._renderMenuOption(item.display, item, i))
                                }
                            </MenuOptions>
                        </Menu>
                    </View>
                </View>
                {this._renderRouteDetails()}
            </MenuContext>
        );
    }

    _goBack() {
        this.props.navigator.pop();
    }

    _handleBackSubmitPressed(items, selectedVal) {
        items.forEach((item) => {
            item.checked = false;
            if (item.value == selectedVal) {
                item.checked = true;
            }
        });
    }

    _renderBackOptions() {
        const radioArr = [];
        const backOptions = this.state.backOptions;
        let initial = 10000;//初始为无效值
        backOptions.forEach((option, i) => {
            const label = option.display;
            const value = option.value;
            if (option.checked === true) {
                initial = i;
            }
            radioArr.push({label: label, value: value});
        });
        if (radioArr.length <= 0) {
            return null;
        }
        const enabled = !!this.state.userCanSelect;
        console.log('_renderBackOptions');
        console.log(this.state.userCanSelect);
        console.log(enabled);
        return (
            <View>
                {this._renderSubTitle('退回后提交方式')}
                <RadioForm
                    key={"RadioForm-backRadio-" + this.updateIndex}
                    style={{marginLeft: 14, paddingVertical: 5,}}
                    labelStyle={{marginRight: 15}}
                    radio_props={radioArr}
                    initial={initial}
                    formHorizontal={true}
                    enabled={enabled}
                    buttonColor={'#3877bc'}
                    buttonSize={10}
                    labelColor={'gray'}
                    labelSize={50}
                    animation={false}
                    onPress={(value) => {
                        this._handleBackSubmitPressed(backOptions, value)
                    }}
                />
            </View>
        );
    }

    _renderSubmitBtn() {
        const btns = [{text: '确定提交', onPress: this._pushWorkFlowData}];
        return (
            <CommonButtons
                buttons={btns}
            />
        );
    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title="退回"
                goBack={true}
                contentMarginBottom={24}
            >
                <View
                    style={{flex: 1,}}
                >
                    <View style={{flex: 1,}}>
                        {this._renderBackOptions()}
                        {this._renderContentView()}
                    </View>
                    {this._renderSubmitBtn()}
                </View>
            </NavigationBar>
        );
    }
}