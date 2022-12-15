/**
 * Created by cui on 11/10/16.
 */

import React, {Component} from 'react';
import {
    TextInput,
    AlertIOS,
    View,
    Image,
    TouchableOpacity,
    Platform,
    Dimensions,
    BackAndroid,
    ToastAndroid,
    NativeModules,
    NativeEventEmitter,
    DeviceEventEmitter
} from 'react-native';
import TabNavigator from 'react-native-tab-navigator';
import ScrollableTabView from '../components/ScrollableTabView/ScrollableTabView';
import AndroidTabBar from '../components/tabBar/androidTabBar';
import PersonalCenter from './personalCenter/personalCenter'
import TodoTask from './todoTasks/index';
import Workbench from './workbench/workbench';
import WorkbenchForReport from './workbench/workbenchForReport';
import LoginActions from '../actions/LoginActions';
import AppStore from '../stores/AppStore';
import CommonFunc from './commonStyle/commonFunc';
const NativeToJsModule = new NativeEventEmitter(NativeModules.RNToJSModel);
let getRegIDListener = null;
import {isIphoneX} from '../modules/ScreenUtil';

export class MainContainer extends Component {

    // 构造
    constructor(props) {
        super(props);
        this._handleHardwareBack = this._handleHardwareBack.bind(this);
        // 初始状态
        this.state = {
            selectedTab: 'workbench',
            notifCount: 0,
            presses: 0,
            searchText: ''
        };
    }
    componentDidMount() {
        CommonFunc.lockToPortrait();
        const that = this;
        if (Platform.OS === 'ios') {
            getRegIDListener = NativeToJsModule.addListener('getMiPushRegID', (data) => {
                console.log('getMiPushRegID regId = ' + data.regId);
                that._updateLogRegid(data.regId);
            })
        } else {
            getRegIDListener = DeviceEventEmitter.addListener('getMiPushRegID', (data) => {
                console.log('android-getMiPushRegID regId = ' + data.regId);
                that._updateLogRegid(data.regId);
            });
        }
        BackAndroid.addEventListener('hardwareBackPress', this._handleHardwareBack);
    }

    componentWillUnmount() {
        if (Platform.OS === 'ios') {
            getRegIDListener.remove();
        } else {
            getRegIDListener.remove();
        }
        BackAndroid.removeEventListener('hardwareBackPress', this._handleHardwareBack)
    }

    _handleHardwareBack() {
        const navigator = this.props.navigator;
        const routes = navigator.getCurrentRoutes();
        if (routes.length > 1) {
            navigator.pop();
            return true;
        } else {
            const now = Date.now();
            if (this.lastPressTime && now - this.lastPressTime <= 2000) {
                return false;
            } else {
                this.lastPressTime = now;
                ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
                return true;
            }
        }
    }
    _updateLogRegid(regId) {
        LoginActions.updateLogRegid({
            userid: AppStore.getUserID(),
            devType: Platform.OS === 'ios' ? 'ios' : 'android',
            regId: regId,
        }, (responseData) => { }, (err) => { })
    }
    render() {
        const navigator = this.props.navigator;
        if (Platform.OS === 'ios') {
            return (
                <TabNavigator
                    sceneStyle={{bottom: (isIphoneX() ? 34 : 0)}}
                    tabBarStyle={{bottom: (isIphoneX() ? 34 : 0), backgroundColor: "white"}}
                >
                    <TabNavigator.Item
                        title="首页"
                        selectedTitleStyle={{color: "red"}}
                        selected={this.state.selectedTab === 'workbench'}
                        renderIcon={() => <Image source={require('../image/tab_home.png')} />}
                        renderSelectedIcon={() => <Image source={require('../image/tab_Home_pre.png')} />}
                        onPress={() => {
                            this.setState({
                                selectedTab: 'workbench'
                            });
                        }}
                    >
                        <Workbench navigator={navigator} param={this.props.param} />
                    </TabNavigator.Item>

                    <TabNavigator.Item
                        title="流程事宜"
                        selectedTitleStyle={{color: "red"}}
                        selected={this.state.selectedTab === 'message'}
                        renderIcon={() => <Image source={require('../image/tab_process.png')} />}
                        renderSelectedIcon={() => <Image source={require('../image/tab_process_pre.png')} />}
                        onPress={() => {
                            this.setState({
                                selectedTab: 'message'
                            });
                        }}
                    >
                        <TodoTask navigator={navigator} />
                    </TabNavigator.Item>
                    <TabNavigator.Item
                        title="综合管理"
                        selectedTitleStyle={{color: "red"}}
                        selected={this.state.selectedTab === 'WorkbenchForReport'}
                        renderIcon={() => <Image source={require('../image/tab_integrated_management.png')} />}
                        renderSelectedIcon={() => <Image source={require('../image/tab_integrated_management_selected.png')} />}
                        onPress={() => {
                            this.setState({
                                selectedTab: 'WorkbenchForReport'
                            });
                        }}
                    >
                        <WorkbenchForReport navigator={navigator} param={this.props.param} />
                    </TabNavigator.Item>

                    <TabNavigator.Item
                        title="个人中心"
                        selectedTitleStyle={{color: "red"}}
                        selected={this.state.selectedTab === 'userCenter'}
                        renderIcon={() => <Image source={require('../image/tab_user.png')} />}
                        renderSelectedIcon={() => <Image source={require('../image/tab_user_pre.png')} />}
                        onPress={() => {
                            this.setState({
                                selectedTab: 'userCenter',
                            });
                        }}
                    >
                        <PersonalCenter navigator={navigator} />
                    </TabNavigator.Item>
                </TabNavigator>
            );
        }

        return (
            <ScrollableTabView
                style={{backgroundColor: 'transparent'}}
                bounces={false}
                scrollWithoutAnimation={true}
                locked={true}
                tabBarPosition="bottom"
                tabBarBackgroundColor="#fcfcfc"
                tabBarUnderlineColor="#3e9ce9"
                tabBarActiveTextColor="red"
                tabBarInactiveTextColor="#aaaaaa"
                renderTabBar={() =>
                    <AndroidTabBar
                        textStyle={{fontSize: 12}}
                        style={{borderTopWidth: 0.5, borderTopColor: '#CCCCCC'}}
                    />
                }
            >
                <Workbench
                    navigator={navigator}
                    key={0}
                    param={this.props.param}
                    tabLabel="首页"
                    icon={require('../image/tab_home.png')}
                    selectedIcon={require('../image/tab_Home_pre.png')}
                />


                <TodoTask
                    navigator={navigator}
                    title="流程事宜"
                    key={1}
                    tabLabel="流程事宜"
                    icon={require('../image/tab_process.png')}
                    selectedIcon={require('../image/tab_process_pre@2x.png')}
                />
                <WorkbenchForReport
                    navigator={navigator}
                    key={2}
                    param={this.props.param}
                    tabLabel="综合管理"
                    icon={require('../image/tab_integrated_management.png')}
                    selectedIcon={require('../image/tab_integrated_management_selected.png')}
                />
                <PersonalCenter
                    navigator={navigator}
                    key={3}
                    tabLabel="个人中心"
                    icon={require('../image/tab_user.png')}
                    selectedIcon={require('../image/tab_user_pre.png')}
                />
            </ScrollableTabView>
        )

    }
}

module.exports = MainContainer;

