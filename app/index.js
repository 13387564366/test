/**
 * Created by tenwa on 16/10/22.
 */
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Navigator,
    Alert,
    Linking,
    Platform,
} from 'react-native';
import {
    AppStore,
    AppActions,
    CommonStyle,
    CommonLink
} from './modules/ThirdPartyComponents';

import Login from './page/login/login';
import LoadingView from './components/loadingView/loadingView';
import EventDic from  './modules/eventDic';
import SplashScreen from 'react-native-splash-screen';
import DeviceInfo from 'react-native-device-info';
import LoginActions from './actions/LoginActions';
import CommonFunc from './page/commonStyle/commonFunc';

const { USER_CHANGE } = EventDic;

class  Main extends Component{

   _getStateFromStores = () => {
        return {
            token: AppStore.getToken(),
            initState: AppStore.getInitState(),
            isLoadingVisible: AppStore.isLoadingVisible()
        };
    };

    constructor(props){
        super(props);
        AppActions.initProfile();
        this._renderScene = this._renderScene.bind(this);
        this.state = {
            token: AppStore.getToken(),
            initState: AppStore.getInitState(),
            isLoadingVisible: AppStore.isLoadingVisible()
        };
    }

    _renderScene(route, navigator) {
        let Comp = route.comp;
        const res = (<Comp
            param={route.param}
            navigator={navigator}
            callback={route.callback}
        />);
        return res;
    }

    componentDidMount() {
        CommonFunc.lockToPortrait();
        AppStore.addChangeListener(this._onChange);
        AppStore.addChangeListener(this._userStateChange, USER_CHANGE);
        setTimeout(() => {
            SplashScreen.hide();
        }, 1000);

    }

    componentWillUnmount() {
        AppStore.removeChangeListener(this._onChange);
        AppStore.removeChangeListener(this._userStateChange, USER_CHANGE);
    }

    _onChange = () => {
        this.setState(this._getStateFromStores());
    };

    _userStateChange = () => {
        if(AppStore.isLoginOut()){

            Promise.resolve().then(function(resolve){

                this.refs.navigator.resetTo({comp: Login})

            }.bind(this)).catch(function(e){
                Alert.alert("系统异常")
            })
        }
    };

    render() {
        const initComp = Login;
        if (this.state.initState) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>数据加载中,请稍后...</Text></View>
            );
        }

        return(
            <View
                style={{flex: 1,}}
            >
                <Navigator
                    ref="navigator"
                    renderScene={this._renderScene}
                    initialRoute={{comp:initComp}}

                    configureScene={(route) => ({// eslint-disable-line arrow-body-style
                        ...route.sceneConfig || Navigator.SceneConfigs.HorizontalSwipeJump,
                        gestures: route.gestures
                    })}
                    style={CommonStyle.fullscreen}
                />

                <LoadingView isVisible={this.state.isLoadingVisible} />
            </View>

        )
    }
}
module.exports = Main;
