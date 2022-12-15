import React, {Component} from 'react';
import {Alert, Dimensions, Text, TextInput, TouchableOpacity, View, Image, StyleSheet,Platform} from 'react-native';
import AppStore from "../../stores/AppStore";
import NavigationBar from '../../components/navigator/NavBarView';
import Login from '../login/login';
import LoginAction from '../../actions/LoginActions';
import AppDispatcher from '../../dispatcher/AppDispatcher';
import AppConstants from '../../constants/AppConstants';
import CommonLink from "../../modules/CommonLink";

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
    itemContainer: {
       // backgroundColor: 'white',
        flexDirection: 'row',
        alignSelf: 'center',
        borderBottomWidth: 0,
       /* marginVertical: 2,*/
        marginVertical: Platform.OS ==='ios' ? 20 :2,
        borderColor: '#F4F4F4',
        justifyContent: 'center',
         alignItems: 'center',
        backgroundColor:'transparent',
    },
    fullScreen: {
        height: deviceHeight,
        width: deviceWidth,
        flex: 1
    },
});


export class SetLogPwd extends Component {

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this._submit = this._submit.bind(this);
        this._updateLoginPwd = this._updateLoginPwd.bind(this);
        this._goLogin = this._goLogin.bind(this);
        this.state ={
            userid: AppStore.getUserID(),
            oldPwd:'',
            newPwd:'',
            newpwd2:''
        }
    }

    _submit(){
        if (this.state.oldPwd === '' ||this.state.newPwd === '' ||this.state.newPwd2 === '') {
            Alert.alert(
                '提示',
                '存在输入项为空！！！',
                [{text: '确定'}]
            );
            return;
        }
        if (this.state.newPwd!=this.state.newPwd2){
            Alert.alert(
                '提示',
                '两次输入密码不一致！！！',
                [{text: '确定'}]
            );
            return;
        }
        //request api
        this._updateLoginPwd(this.state.oldPwd,this.state.newPwd);
    }

    /**
     * 更新密码
     * @param oldPwd oldPwd
     * @param newPwd newPwd
     * @private res
     */
    _updateLoginPwd(oldPwd,newPwd){
        LoginAction.updateLogPwd({
            userid: AppStore.getUserID(),
            oldPwd: oldPwd,
            newPwd:newPwd,
        }, (response) => {
            Alert.alert(
                '提示',
                '登录密码修改成功!',
                [{text: '确定', onPress: this._goLogin}]
            );
        }, (error) => {
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
    }
    /**
     * 修改密码成功，返回上一个界面
     * @private
     */
/*    _goLogin () {
        const navigator = this.props.navigator;
        navigator.resetTo({
            comp: Login
        });
    };*/
    _goLogin () {
      this.props.navigator.pop();
      AppDispatcher.dispatch({actionType: AppConstants.PWD_CHANGED,data:{}});
    }

    _onPwdStateChange = () => {
        const prevState = this.state.isPwdReadable;
        this.setState({isPwdReadable: !prevState});
    };
    _renderPwdStateIcon = () => {
        let img = null;
        if (this.state.isPwdReadable) {
            img = <Image source={require('../../image/login_pwd_eye_close.png')}/>;
        } else {
            img = <Image source={require('../../image/login_pwd_eye.png')}/>;
        }
        return (
            <TouchableOpacity
                onPress={this._onPwdStateChange}
                style={{paddingHorizontal: 14, paddingVertical: 10, height:40,}}
            >
                {img}
            </TouchableOpacity>);
    };

    render(){
        const navigator = this.props.navigator;
        return (
            <Image
                style={styles.fullScreen}
                source={require('../../image/load_bg.png')}
            >

            <NavigationBar
                navigator={navigator}
                title="修改密码"
                goBack={true}
                style={{
                    backgroundColor: 'transparent',
                    borderBottomWidth: 0,
                }}
            >

                <View
                    style={{
                        marginTop: 80,
                      //  backgroundColor: 'white',
                        backgroundColor:'transparent',
                        borderRadius: 5,
                        justifyContent:'center',
                       // paddingHorizontal:50,
                        paddingLeft: 60,
                    }}
                >
                    <View>
                        <Text>原始密码</Text>
                        <View  style={styles.itemContainer}>
                        <TextInput
                            placeholder="请输入原始密码"
                            placeholderTextColor="#22232840"
                            name="oldPwd"
                            value={this.state.oldPwd}
                            secureTextEntry={!this.state.isPwdReadable}
                            onChangeText={(text) => this.setState({oldPwd: text})}
                            underlineColorAndroid="transparent"
                            width={180}
                        />
                        {this._renderPwdStateIcon()}
                        </View>
                    </View>
                    <View>
                        <Text>新密码</Text>
                        <View style={styles.itemContainer}>
                        <TextInput
                            placeholder="请输入新密码"
                            placeholderTextColor="#22232840"
                            name="newPwd"
                            value={this.state.newPwd}
                            secureTextEntry={!this.state.isPwdReadable}
                            onChangeText={(text) => this.setState({newPwd: text})}
                            underlineColorAndroid="transparent"
                            width={180}
                        />
                        {this._renderPwdStateIcon()}
                        </View>
                    </View>


                    <View>
                        <Text>确认新密码</Text>
                        <View style={styles.itemContainer}>
                        <TextInput
                            placeholder="请再次输入新密码"
                            placeholderTextColor="#22232840"
                            name="newPwd2"
                            value={this.state.newPwd2}
                            secureTextEntry={!this.state.isPwdReadable}
                            onChangeText={(text) => this.setState({newPwd2: text})}
                            underlineColorAndroid="transparent"
                            width={180}
                        />
                        {this._renderPwdStateIcon()}
                        </View>
                    </View>

                    <TouchableOpacity onPress={this._submit}>
                        <View
                            style={{
                                width: 280,
                                paddingVertical: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 20,
                                backgroundColor: '#D3232A',
                                borderRadius: 5,
                            }}
                        >
                            <Text style={{color: 'white', fontSize: 14, backgroundColor: 'transparent',}}>确认</Text>
                        </View>
                    </TouchableOpacity>

                </View>
            </NavigationBar>
            </Image>
        );
    }
}

module.exports = SetLogPwd;
