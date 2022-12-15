/**
 * Created by cui on 11/10/16.
 */

import React from 'react';
import {isIphoneX} from '../../modules/ScreenUtil';
import {
    View,
    Text,
    ListView,
    ScrollView,
    Platform,
    Image,
    Alert,
    Dimensions,
    TouchableOpacity,
    InteractionManager,
    RefreshControl,
    NativeModules,
    NativeAppEventEmitter,
    NativeEventEmitter,
    DeviceEventEmitter,
    StatusBar
} from 'react-native';
import NavigationBar from '../../components/navigator/NavBarView';
import AppStore from '../../stores/AppStore';
import TipsNumberView from '../../components/TipsWithNumber/TipsWithNumberView'
import StatementCenter from '../statementCenter/statementCenter';

import EventDic from '../../modules/eventDic';
const {
    REFRESH_DATA,
} = EventDic;
const flowArray = [
    {
        flowCount: '0.0',
        flowName: '项目立项流程',
        flowNo: 'ProjectApprovalFlow'
    },
    {
        flowCount: '0.0',
        flowName: '项目变更流程',
        flowNo: 'ProjectChangeFlow'
    },
    {
        flowCount: '0.0',
        flowName: '合同审批流程',
        flowNo: 'ContractApprovalFlow'
    },
    {
        flowCount: '0.0',
        flowName: '合同变更流程',
        flowNo: 'ContractChangeFlow'
    },
    {
        flowCount: '0.0',
        flowName: '合同交接流程',
        flowNo: 'ContractHandoverFlow'
    },
    {
        flowCount: '0.0',
        flowName: '合同起租流程',
        flowNo: 'ContractOnhireFlow'
    },
    {
        flowCount: '0.0',
        flowName: '快速报单放款申请',
        flowNo: 'GreenChannelPayment'
    },
    {
        flowCount: '0.0',
        flowName: '快速报单',
        flowNo: 'GreenChannelApplyFlow'
    }]

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

const ITEM_WIDTH = (WINDOW_WIDTH - 14 * 2) / 4;
const ITEM_WIDTH_MORE = (WINDOW_WIDTH - 14 * 2) / 5;
const ITEM_HEIGHT = (WINDOW_WIDTH - 14 * 2) / 3;
const XiMiPushManager = NativeModules.XiMiPushManager;
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import TodoTaskListPage from '../todoTasks/todoTaskListPage';
import FlowActions from '../../actions/FlowActions';
import CommonFunc from '../commonStyle/commonFunc';
import TaskDetailPage from '../todoTasks/todoTaskDetailPage';
let subscription = null;
const LineIconCount = 4;
const HOME_PAGE_TODOLIST_COUNT = 30;
const showTypeIcons = false;//显示流程图标/流程待办

export default class Workbench extends React.Component {
    constructor(props) {
        super(props);
        this._fetchFlowCountInfo = this._fetchFlowCountInfo.bind(this);
        this._fetchTodoListData = this._fetchTodoListData.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._dataChangeListener = this._dataChangeListener.bind(this);
        this._renderRow = this._renderRow.bind(this);
        this._XiMiPushListener = this._XiMiPushListener.bind(this);
        this._renderListRow = this._renderListRow.bind(this);
        this._toBusinessDetailPage = this._toBusinessDetailPage.bind(this);
        this._toTodoListPage = this._toTodoListPage.bind(this);
        this._onMoreChange = this._onMoreChange.bind(this);
        this._onPullRefresh = this._onPullRefresh.bind(this);
        this._toGeneralStatementPage = this._toGeneralStatementPage.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.lastFetchSuccessful = false;
        this.lastFetchReturn = true;
        this.state = {
            dataSource: [],
            tipsDataSource: Object.assign([], flowArray),
            refreshing: false,
            isShowingMore: true,
        };
    }

    componentDidMount () {

        this._fetchData();
        AppStore.addChangeListener(this._dataChangeListener, REFRESH_DATA);
        if (Platform.OS === 'ios') {
            XiMiPushManager.startReceiveNotification(XiMiPushManager.receiveNotificationName);
            subscription = NativeAppEventEmitter.addListener('XiMiNews', this._XiMiPushListener);
        } else {
            //Android
            subscription = DeviceEventEmitter.addListener('XiMiNews', this._XiMiPushListener);
        }
    }

    _XiMiPushListener (reminder) {
        AppDispatcher.dispatch({actionType: AppConstants.REFRESH_DARA});
    }

    componentWillUnmount () {
        AppStore.removeChangeListener(this._dataChangeListener, REFRESH_DATA);
        if (Platform.OS === 'ios') {
            subscription.remove();
        } else {
            //Android
            subscription.remove();
        }
    }
    _alertRegId = (regId) => {
        let msg = (Platform.OS === 'ios' ? 'ios' : 'android') + ',注册小米regId:' + regId;
        console.log(msg);
        // Alert.alert(null, msg);
    };
    _fetchData11 () {
        InteractionManager.runAfterInteractions(() => {
            if (showTypeIcons) {
                this._fetchFlowCountInfo();
            } else {
                this._fetchTodoListData();
            }
        });
    }

    // 下拉刷新
    _onPullRefresh () {
        if (this.lastFetchReturn) {
            this.lastFetchReturn = false;
            this._fetchData();
        }

    }

    _dataChangeListener () {
        this._fetchData();
    }

    _fetchData () {
        // this._fetchFlowCountInfo();
        // this._fetchTodoListData();
        this.setState({refreshing: true});
        const getTodoTaskListByPage = new Promise((resolve, reject) => {
            FlowActions.getTodoTaskListByPage({}, (response) => {
                resolve(response)
            }, (error) => {
                reject(error)
            });
        }).then(result => result)


        const getTodoTaskCount = new Promise((resolve, reject) => {
            FlowActions.getTodoTaskCount({}, (response) => {
                resolve(response)
            }, (error) => {
                reject(error)
            });
        }).then(result => result)

        Promise.all([getTodoTaskListByPage, getTodoTaskCount]).then(data => {
            const flowCountObj = CommonFunc.handleListDatas(data[0].datas || []);
            const handledDs = this._handleWorkListData(flowCountObj);
            var flowCountArr = data[1].flowDesc || [];
            flowCountArr = flowCountArr.filter(function (item) {
                for (var flowItem of flowArray) {
                    if (item.flowNo == flowItem.flowNo) {
                        flowItem.flowCount = item.flowCount
                    }
                }
            })
            this.lastFetchReturn = true;
            this.lastFetchSuccessful = true;
            this.setState({
                tipsDataSource: Object.assign([], flowArray),
                dataSource: handledDs,
                refreshing: false
            });
        }).catch(error => {
            console.log(error)
            this.lastFetchReturn = true;
            this.lastFetchSuccessful = false;
            this.setState({refreshing: false});
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
    }
    //获取待办列表数据
    _fetchTodoListData () {
        this.setState({refreshing: true});
        FlowActions.getTodoTaskListByPage({}, (response) => {
            const flowCountObj = CommonFunc.handleListDatas(response.datas || []);
            const handledDs = this._handleWorkListData(flowCountObj);
            this.lastFetchReturn = true;
            this.lastFetchSuccessful = true;
            this.setState({
                dataSource: handledDs,
                refreshing: false
            });
        }, (error) => {
            this.lastFetchReturn = true;
            this.lastFetchSuccessful = false;
            this.setState({refreshing: false});
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
    }

    //获取流程数量信息
    _fetchFlowCountInfo () {
        this.setState({refreshing: true});
        FlowActions.getTodoTaskCount({}, (response) => {
            let flowCountArr = response.flowDesc || [];
            flowCountArr = flowCountArr.filter(function (item) {
                for (var flowItem of flowArray) {
                    if (item.flowNo == flowItem.flowNo) {
                        flowItem.flowCount = item.flowCount
                    }
                }
            })
            this.lastFetchReturn = true;
            this.lastFetchSuccessful = true;
            this.setState({
                tipsDataSource: Object.assign([], flowArray),
                refreshing: false
            });
        }, (error) => {
            this.lastFetchReturn = true;
            this.lastFetchSuccessful = false;
            this.setState({refreshing: false});
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
    }

    _handleWorkListData (data) {
        let array = [];
        data.forEach(function (item) {
            let rowData = {};
            rowData.flag = 'true';
            rowData.pending = item;
            array.push(rowData);
        });
        if (array.length == 0) {
            let rowData = {};
            rowData.flag = "false";
            array.push(rowData);
        }
        return array;
    }

    //流程数量
    _getFlowItemCount (flowNo) {
        let flowCountInfo = null;
        const tipsPending = this.state.tipsDataSource;
        for (let i = 0; i < tipsPending.length; i++) {
            if (tipsPending[i].flowNo === flowNo) {
                flowCountInfo = tipsPending[i];
                break;
            }
        }
        if (!flowCountInfo) {
            return 0;
        } else {
            return (Number.parseInt(flowCountInfo.flowCount || '') || 0);
        }
    }

    _toTodoListByCategory (rowData) {
        const flowName = rowData.flowName;
        this.props.navigator.push({
            id: 'TodoTaskListPage',
            comp: TodoTaskListPage,
            param: {
                title: flowName,
                flowNo: rowData.flowNo,
                flowName: flowName,
                showTitleBar: true,
                showSearchBar: false,
            }
        });
    }

    _renderRow (rowData, isShowMore = false) {
        const tipsNum = this._getFlowItemCount(rowData.flowNo);
        const flowName = rowData.flowName;
        const width = isShowMore ? ITEM_WIDTH_MORE : ITEM_WIDTH;
        return (
         <TouchableOpacity activeOpacity={0.6} style={{width: width,paddingVertical:10}} onPress={() => this._toTodoListByCategory(rowData)} >
                <View style={{justifyContent: 'center', alignItems: 'center'}} >
                    <TipsNumberView
                        tipsNum={tipsNum}
                    >
                        {this._getImage(rowData)}
                    </TipsNumberView>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                            marginTop: 10,
                            paddingHorizontal: 0,
                            color: '#222328',
                            fontSize: 13,
                        }}>{flowName}</Text>

                </View>
                </TouchableOpacity>

        );
    }

    _getImage (rowData) {
        const imageStyle = {width: 40, height: 40}
        switch (rowData.flowNo) {
            case '项目立项流程':
            case 'ProjectApprovalFlow':
                return <Image style={imageStyle} source={require('../../image/otherImage/icon_1.png')} />;
            case '项目变更流程':
            case 'ProjectChangeFlow':
                return <Image style={imageStyle} source={require('../../image/otherImage/icon_2.png')} />;
            case '合同审批流程':
            case 'ContractApprovalFlow':
                return <Image style={imageStyle} source={require('../../image/otherImage/icon_3.png')} />;
            case '合同变更流程':
            case 'ContractChangeFlow':
                return <Image style={imageStyle} source={require('../../image/otherImage/icon_4.png')} />;
            case '合同交接流程':
            case 'ContractHandoverFlow':
                return <Image style={imageStyle} source={require('../../image/otherImage/icon_5.png')} />;
            case '快速报单放款申请':
            case 'GreenChannelPayment':
                return <Image style={imageStyle} source={require('../../image/otherImage/icon_6.png')} />;
            case '快速报单':
            case 'GreenChannelApplyFlow':
                return <Image style={imageStyle} source={require('../../image/otherImage/icon_7.png')} />;
            default:
                return <Image style={imageStyle} source={require('../../image/otherImage/icon_8.png')} />;

        }
    }

    _taskListIcon () {
        return (
            <Image source={require('../../image/home_list_icon.png')} />
        );
    }

    _toBusinessDetailPage (listObjData) {
        const listData = listObjData.listData;
        const flowName = CommonFunc.getValueByKeyArr(listData, ['FLOWNAME', 'value']);
        const flowNo = CommonFunc.getValueByKeyArr(listData, ['FLOWNO', 'itemno']);
        const phaseNo = CommonFunc.getValueByKeyArr(listData, ['PHASENO', 'itemno']);
        const serialNo = CommonFunc.getValueByKeyArr(listData, ['SERIALNO', 'itemno']);
        const objectNo = CommonFunc.getValueByKeyArr(listData, ['OBJECTNO', 'itemno']);
        const param = {flowNo: flowNo, serialNo: serialNo, objectNo: objectNo,phaseNo:phaseNo};
        FlowActions.getTodoTaskCheck(param, (response) => {
            if (response.STATUS == 'SUCCESS') {
                this.props.navigator.push({
                    id: 'TaskDetailPage',
                    comp: TaskDetailPage,
                    param: {
                        title: flowName,
                        listData: listData,
                        editable: true,
                    }
                })
            }else if(response.MSG){
                Alert.alert(
                    '提示',
                    response.MSG,
                    [{text: '确定',onPress: () => AppDispatcher.dispatch({actionType: AppConstants.REFRESH_DATA})}]
                );
            }
        }, (error) => {
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
    }

    _renderListRow (rowData, sectionID, rowID) {
        if (rowData.flag == "true") {
            const listData = rowData.pending.listData;
            const displayText = CommonFunc.getValueByKeyArr(listData, ['flowName', 'value']);
            const startTime = CommonFunc.getValueByKeyArr(listData, ['BEGINTIME', 'value']);
            const projectName = CommonFunc.getValueByKeyArr(listData, ['proj_name', 'value']);
            return (
                <TouchableOpacity activeOpacity={0.6}
                    onPress={() => this._toBusinessDetailPage(rowData.pending)}>
                    <View style={{flexDirection: 'row', marginLeft: 15, paddingVertical: 10, borderBottomColor: '#E4E7F0', borderBottomWidth: 0.5}}>
                        {this._taskListIcon(rowData, sectionID, rowID)}
                        <View style={{flexDirection: 'column', flex: 1, paddingLeft: 10, }}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, }}>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode='tail'
                                    style={{
                                        color: '#000',
                                        fontSize: 13,
                                        flex: 1,
                                    }}>{displayText}</Text>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode='tail'
                                    style={{
                                        flex: 1,
                                        color: '#999',
                                        fontSize: 13,
                                        marginRight: 15,
                                        textAlign: 'right',
                                    }}>{startTime}</Text>
                            </View>
                            <Text
                                numberOfLines={1}
                                ellipsizeMode='tail'
                                style={{
                                    color: '#666',
                                    fontSize: 12,
                                    marginRight: 15,
                                    marginTop: 3,
                                }}>{projectName}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (
                <View style={{height: 55, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: '#666666', fontSize: 15}}>暂无待办</Text>
                </View>
            );
        }
    }

    _renderSubTitle (title, onPress) {
        let clickPress = onPress ? () => onPress() : null;
        const titleData = {
            '业务流程': {
                icon: require('../../image/home_process.png'),
                more: false,
                marginTop: false,
            },
            '待办任务': {icon: require('../../image/home_process.png'), more: true, marginTop: false, },
        };
        let titleMarginTop = titleData[title].marginTop ? 10 : 0;
        const bottomColor = titleData[title].bottomColor ? titleData[title].bottomColor : '#E4E7F0';
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={clickPress}>
                <View style={{
                    flex:1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    marginTop: titleMarginTop,
                    borderBottomColor: bottomColor,
                    paddingHorizontal: 15,
                    justifyContent: 'space-between',
                    backgroundColor: 'white',
                }}>
                    <View style={{flexDirection: 'row', }}>
                        <Text style={{fontSize: 15, marginLeft: 5, color: '#22232880'}}>{title}</Text>
                    </View>
                    {
                        titleData[title].more ?
                            <View style={{
                                justifyContent: 'space-between',
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                                <Text style={{marginRight: 5, color: '#CCCCCC', }}>更多</Text>
                                <Image source={require('../../image/home_arrow-.png')} />
                            </View>
                            :
                            null

                    }
                </View>
            </TouchableOpacity>
        );
    }

    _toTodoListPage () {
        this.props.navigator.push({
            id: 'TodoTaskListPage',
            comp: TodoTaskListPage,
            param: {
                showTitleBar: true,
                showSearchBar: true,
            },
        })
    }

    _renderTodoList () {
        const paddingBottom = this.state.dataSource.length == 0 ? 0 : 10;
        return (
            <View style={{flex: 1}}>
                <View style={{backgroundColor: 'white', marginTop: 0, flex: 1, }}>
                    {this._renderSubTitle('待办任务', this._toTodoListPage)}
                    <ListView
                        // refreshControl={
                        //     <RefreshControl
                        //         enabled={true}
                        //         refreshing={this.state.refreshing}
                        //         tintColor="#cc0"
                        //         title="正在加载中……"
                        //         color="#ccc"
                        //         onRefresh={this._onPullRefresh}
                        //     />
                        // }
                        style={{flex: 1, backgroundColor: 'white', paddingBottom: paddingBottom, }}
                        dataSource={this.ds.cloneWithRows(this.state.dataSource.slice(0, HOME_PAGE_TODOLIST_COUNT))}
                        renderRow={this._renderListRow}
                        automaticallyAdjustContentInsets={false}
                        enableEmptySections={true}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        initialListSize={20}
                        pageSize={20}
                        onEndReachedThreshold={1000}
                        scrollRenderAheadDistance={1000}
                    />
                </View>
            </View>
        );
    }

    _renderCollipse () {
        if (this.state.isShowingMore) {
            return null;
        }
        return (
            <View style={{
                position: 'absolute',
                width: 30,
                height: 30,
                left: WINDOW_WIDTH - 40,
                top: WINDOW_HEIGHT * 0.65,
            }}>
                <TouchableOpacity onPress={this._onMoreChange}>
                    <Image source={require('../../image/home_btn_up.png')} />
                </TouchableOpacity>
            </View>

        );
    }

    _onMoreChange () {
        const prevShowMore = this.state.isShowingMore;
        this.setState({
            isShowingMore: !prevShowMore,
        })
    }

    // _renderMoreOrCollipse () {
    //     if (this.state.isShowingMore) {
    //         return (
    //             <TouchableOpacity activeOpacity={0.6} onPress={() => this._onMoreChange()}>
    //                 <View style={{
    //                     justifyContent: 'center',
    //                     alignItems: 'center',
    //                     flex: 1,
    //                     width: ITEM_WIDTH_MORE,
    //                     height: 80,
    //                 }}>
    //                     <Text numberOfLines={1} ellipsizeMode={'tail'}
    //                         style={{marginTop: 5, paddingHorizontal: 0, color: '#886F36', fontSize: 13, }}>more</Text>
    //                 </View>
    //             </TouchableOpacity>

    //         );
    //     } else {
    //         return (
    //             <View style={{
    //                 borderWidth: 1,
    //                 borderColor: 'red',
    //                 flex: 1,
    //                 flexDirection: 'row',
    //                 justifyContent: 'flex-end',
    //                 backgroundColor: 'transparent',
    //             }}>
    //                 <TouchableOpacity onPress={this._onMoreChange}>
    //                     <Image source={require('../../image/home_btn_up.png')} />
    //                 </TouchableOpacity>
    //             </View>
    //         );
    //     }
    // }

    _renderContent () {
        var strArr = this.state.tipsDataSource || [];
        if (strArr.length==0) {
            return;
        }
        const length = strArr.length;
        const modNum = length % LineIconCount; //6%4 2
        const rows = modNum == 0 ? (length / LineIconCount) : ((length - modNum) / LineIconCount) + 1;
        let rowContainer = [];
        // if (this.state.isShowingMore) {
        //     let rowOfChildren = [], count = 0;
        //     for (let j = 0; j < (LineIconCount) && j < length; j++) {
        //         rowOfChildren.push(<View key={'child-' + count}>{this._renderRow(strArr[count++], true)}</View>);
        //     }
        //     rowOfChildren.push(<View key="more" style={{flexDirection: 'row',}}>{this._renderMoreOrCollipse()}</View>)
        //     rowContainer.push(<View key={'row-' + i} style={{flexDirection: 'row',}}>{rowOfChildren}</View>);
        // } else {
        //     let count = 0, i = 0;
        //     for (i = 0; i < rows; i++) {
        //         let rowOfChildren = [];
        //         for (let j = 0; j < LineIconCount; j++) {
        //             rowOfChildren.push(<View key={'child-' + count}>{this._renderRow(strArr[count++])}</View>);
        //         }
        //         rowContainer.push(<View key={'row-' + i} style={{flexDirection: 'row',}}>{rowOfChildren}</View>);
        //     }
        //
        //     if (modNum != 0) {
        //         let rowOfChildren = [];
        //         for (let j = 0; j < modNum; j++) {
        //             rowOfChildren.push(<View key={'child-' + count}>{this._renderRow(strArr[count++])}</View>);
        //         }
        //         rowContainer.push(<View key={'row-' + i} style={{flexDirection: 'row',}}>{rowOfChildren}</View>);
        //     }
        // }
        let count = 0, i = 0;
        for (i = 0; i < rows; i++) {
            let rowOfChildren = [];
            for (let j = 0; j < LineIconCount && count < length; j++) {
                rowOfChildren.push(<View key={'child-' + count}>{this._renderRow(strArr[count++])}</View>);
            }
            rowContainer.push(<View key={'row-' + i} style={{flexDirection: 'row', flex: 1}}>{rowOfChildren}</View>);
        }
        return (
            <View style={{paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#E4E7F0'}}>
                {rowContainer}
            </View>
        );
    }

    _renderListContent () {
        if (showTypeIcons) {
            return null;
        }
        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <ScrollView
                    // 去掉顶部留白
                    automaticallyAdjustContentInsets={false}
                    refreshControl={
                        <RefreshControl
                            enabled={true}
                            refreshing={this.state.refreshing}
                            onRefresh={this._fetchData}
                            tintColor="#cc0"
                            title="正在加载中……"
                            color="#ccc"
                        />
                    }
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                >
                    {this._renderHerdView()}
                    {this._renderSubTitle('业务流程')}
                    {this._renderContent()}
                    {this._renderTodoList()}
                </ScrollView>
            </View>

        );
    }

    _renderIconContent () {
        if (!showTypeIcons) {
            return null;
        }
        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <ScrollView
                    // 去掉顶部留白
                    automaticallyAdjustContentInsets={false}
                    refreshControl={
                        <RefreshControl
                            enabled={true}
                            refreshing={this.state.refreshing}
                            onRefresh={this._fetchData}
                            tintColor="#cc0"
                            title="正在加载中……"
                            color="#ccc"
                        />
                    }
                >
                    {this._renderSubTitle2('process')}
                    {this._renderContent()}

                    {/* 报表 */}
                    {/* {this._renderStaticsContent()} */}
                </ScrollView>
            </View>

        );
    }
    _renderHerdView () {
        return (
            <View>
                <Image
                    style={{width: Dimensions.get('window').width,height: Dimensions.get('window').width/1476*715, resizeMode: 'stretch'}}
                    source={require('../../image/otherImage//headIMG.png')} />
            </View>
        )
    }
    _renderSubTitle2 (type) {
        const titleData = {
            process: {icon: require('../../image/ywlc.png'), text: '业务流程', more: false, marginTop: true, },
            report: {icon: require('../../image/home_statistics.png'), text: '报表中心', more: false, marginTop: true, },
        };
        const titleInfo = titleData[type]
        return (
            <View style={{
                flexDirection: 'row',
                height: 50,
                alignItems: 'center',
                borderBottomWidth: 0.5,
                borderBottomColor: '#E4E7F0',
                paddingLeft: 15
            }}>
                <Image source={titleInfo.icon} />
                <Text style={{fontSize: 15, marginLeft: 5, }}>{titleInfo.text}</Text>
            </View>
        );
    }

    _renderStaticsContent () {
        return (
            <View>
                {this._renderSubTitle2('report')}
                {this._renderStaticIcon()}
            </View>
        )
    }

    _toGeneralStatementPage () {
        this.props.navigator.push({
            id: 'StatementCenter',
            comp: StatementCenter,
            param: {
                goBack: true,
                page: 0
            }
        });
    }

    _renderStaticIcon () {
        const strArr = [
            {
                name: '表格报表',
                icon: require('../../image/home_btn_table.png'),
                onPress: this._toGeneralStatementPage,
            },
            // {
            //     name: '图形报表',
            //     icon: require('../../image/home_btn_pic.png'),
            //     onPress: this.toGraphStatementPage,
            // },
        ];

        return (
            <View style={{flex: 1, backgroundColor: 'white', }}>
                <View style={{flexDirection: 'row', paddingHorizontal: 14}}>
                    {this._renderReport(strArr[0])}
                    {/*{this._renderReport(strArr[0])}*/}
                </View>
            </View>
        );
    }

    _jumpToReportPage (rowData) {
        if (rowData.onPress) {
            rowData.onPress(rowData);
        }
    }

    _renderReport (rowData) {
        const ITEM_WIDTH2 = (WINDOW_WIDTH - 14 * 2) / 2;
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={() => this._jumpToReportPage(rowData)}>
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                    width: ITEM_WIDTH2,
                    paddingTop: 15,
                    borderWidth: 0,
                    borderColor: 'red',
                }}>
                    <Image source={rowData.icon} />
                    <Text style={{marginTop: 5, }}>{rowData.name}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    render () {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title="物产融租业务系统"
                isEmptBottom={true}
                naviBarStyle={{backgroundColor: '#1BA0E5'}}
                titleColor="white"
                goBack={this.props.param ? this.props.param.goBack : false}
            >
                <View style={{flex: 1, backgroundColor: 'white'}}>
                    {this._renderListContent()}
                    {this._renderIconContent()}
                    {this._renderCollipse()}
                </View>
            </NavigationBar>
        );
    }

}