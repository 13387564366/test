import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    Alert,
    Image,
} from 'react-native';

import {
    NavBarView,
} from '../../modules/ThirdPartyComponents';

import PasswordGesture from '../../components/gesturePassword/index';
import LoginAction from '../../actions/LoginActions';
import AppStore from '../../stores/AppStore';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    frame: {
        backgroundColor: 'transparent',
    },
    content: {
        height: Dimensions.get('window').height - 64,
    },
    fullScreen: {
        height: deviceHeight,
        width: deviceWidth
    },
});

export class SetGesturePwd extends Component {

    // 构造
    constructor(props) {
        super(props);
        this._alert = this._alert.bind(this);
        // 初始状态
        this.state = {
            message: '请输入手势密码',
            status: 'normal',
            interval: 0,
            useGestUre: '1',
            gesturePwd: '',
            Password1: ''
        };
    }

    _alert(title, msg) {
        Alert.alert(
            title,
            msg,
            [
                {text: '确定', onPress: () => this.props.navigator.pop()}
            ]
        );
    }

    _updateGesturePwd = (password) => {
        LoginAction.updateGesture({
            userid: AppStore.getUserID(),
            gesturePwd: password
        }, (response)=> {

            if (this.props.param.callback) {
                this.props.param.callback(true, password);
            }
            this.setState({
                status: 'right',
                message: '手势密码设置成功!',
                interval: 200,
            });
            this._alert('手势密码设置成功!');
            //AppActions.startRefresh();
            // this.props.navigator.pop();
        }, (error)=> {
            // AppActions.dismissLoading();
            this.setState({
                status: 'wrong',
                message: '手势密码设置失败!',
                interval: 200,
            });
        });
    };

    onEnd = (password) => {
        if (this.state.Password1 === '') {
            if (password.length >= 6) {
                // The first password
                this.setState({
                    status: 'normal',
                    message: '请再次输入密码',
                    interval: 200,
                    Password1: password,
                });
            } else {
                this.setState({
                    status: 'wrong',
                    message: '手势密码少于6个点,请重新输入!',
                    interval: 200
                });
            }
        } else {
            // The second password
            if (password === this.state.Password1) {
                this._updateGesturePwd(password);
                this.setState({
                    Password1: ''
                });
            } else {
                this.setState({
                    status: 'wrong',
                    message: '两次输入不一致,请重新输入!',
                    interval: 200,
                    Password1: '',
                });
            }
        }
    };

    onStart = () => {
        if (this.state.Password1 === '') {
            this.setState({
                status: 'normal',
                interval: 200,
                message: '请输入手势密码',
            });
        } else {
            this.setState({
                status: 'normal',
                message: '请再次输入密码'
            });
        }
    };

    _renderNavBarView = () => {
        const navigator = this.props.navigator;
        return (
            <View
            >
                <NavBarView
                    goBack={true}
                    title={this.props.param.title}
                    navigator={navigator}
                    style={{
                        backgroundColor: 'transparent',
                        borderBottomWidth: 0,
                    }}
                >
                    <View
                        style={{width: deviceWidth, paddingTop: 15,alignItems: 'center',}}
                    >
                        <Image
                            source={require('../../image/login_logo_amarsoft.png')}
                        />
                        {/*<Text*/}
                            {/*style={{*/}
                                {/*marginTop: 15,*/}
                                {/*backgroundColor: 'transparent',*/}
                                {/*color: '#22232860',*/}
                                {/*fontSize: 16,*/}
                            {/*}}*/}
                        {/*>业务系统</Text>*/}
                    </View>
                </NavBarView>
            </View>
        );
    };

    render() {
        return (
            <Image
                style={styles.fullScreen}
                source={require('../../image/load_bg.png')}
            >
                <PasswordGesture
                    ref="pg"
                    children={this._renderNavBarView()}
                    style={[styles.frame, styles.content]}
                    textStyle={{marginBottom: -deviceHeight * 0.25}}
                    rightColor="red"
                    wrongColor="yellow"
                    status={this.state.status}
                    message={this.state.message}
                    //onStart={() => this.onStart()}
                    interval={this.state.interval}
                    onEnd={(password) => this.onEnd(password)}
                    onStart={() => this.onStart()}
                />
            </Image>
        );
    }
}

module.exports = SetGesturePwd;
