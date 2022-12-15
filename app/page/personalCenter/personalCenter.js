/**
 * Created by Administrator on 2016/11/4.
 */
import React from 'react';
import {
    View,
    Text,
    Dimensions,
    Platform,
    TouchableOpacity,
    Switch,
    Image,
    InteractionManager,
    ScrollView,
    Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome'
import AppStore from '../../stores/AppStore';
import LoginActions from '../../actions/LoginActions';
import SetGesturePwd from './setgesturePwd';
import SetLogPwd from './setlogPwd';
import CodePage from './codePage';
import AboutPage from './aboutPage';
import RNFSManager from 'react-native-fs';
import LoginPage from '../login/login';
import CommonFunc from '../commonStyle/commonFunc';
import FSManager from '../../modules/fsManager';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
const ITEM_WIDTH = (WINDOW_WIDTH - 15) / 2;

const ITEM_MARGIN = 14;
const SPACE_BETWEEN_ITEM = 20;
const ITEM_HEIGHT = 51;
const ITEM_FONT_SIZE = 19;
const ITEM_ICON_SIZE = 27;
const USER_BG_HEIGHT = 250;
const USER_ICON_SIZE = 70;
const NOTIFICATION_HEIGHT = 0;//暂定通知栏高度为( 50px ---> 25dp,320dpi)

export default class PersonalCenter extends React.Component {

    constructor(props) {
        super(props);
        this.toQRCodePage = this._toQRCodePage.bind(this);
        this.toAboutPage = this._toAboutPage.bind(this);
        this.toSetGuestPwd = this._toSetGuestPwd.bind(this);
        this.toSetLoginPwd = this._toSetLoginPwd.bind(this);
        this._toWeeklyReportPage = this._toWeeklyReportPage.bind(this);
        this._logout = this._logout.bind(this);
        this._toLogIn = this._toLogIn.bind(this);
        this._alert = this._alert.bind(this);
        this._deleteCaches = this._deleteCaches.bind(this);
        this.state = {
            user: AppStore.getUser(),
            useGesturePwd: false,
            gesturePwd: null,
        };
    }

    componentDidMount () {
        InteractionManager.runAfterInteractions(() => {
            this._fetchdata();
        })
    }

    _fetchdata () {
        LoginActions.getGestureInfo({
            userid: AppStore.getUserID(),
        }, (response) => {
            let data = response.enablegesture;
            let flag = data === '1';
            this.setState({
                useGesturePwd: flag,
                gesturePwd: '',
            });
        }, (error) => {
            Alert.alert(
                '提示',
                error,
                [{text: '确定'}]
            );
        });
    }

    _toQRCodePage () {
        this.props.navigator.push({
            id: 'CodePage',
            comp: CodePage,
        });
    }

    _toAboutPage () {
        this.props.navigator.push({
            id: 'AboutPage',
            comp: AboutPage,
        });
    }

    _toSetGuestPwd () {
        this.props.navigator.push({
            id: 'SetGuestPwd',
            comp: SetGesturePwd,
            param: {
                title: this.state.useGesturePwd ? '修改手势密码' : '设置手势密码',
                callback: (status, password) => this._cbUpdateGesturePwdStatus(status, password)
            }
        });
    };


    _toSetLoginPwd () {
        this.props.navigator.push({
            id: 'SetLoginPwd',
            comp: SetLogPwd,
            param: {
                title: this.state.useLoginPwd ? '修改登录密码' : '设置登录密码',
                callback: (status, password) => this._cbUpdateLoginPwdStatus(status, password)
            }
        });
    };

    _cbUpdateGesturePwdStatus (status, password) {
        this.setState({
            useGesturePwd: status,
            gesturePwd: password,
        });
    }

    _cbUpdateLoginPwdStatus (status, password) {
        this.setState({
            useLoginPwd: status,
            loginPwd: password,
        });
    }

    _updateGesturePwdStatus = (value) => {
        let tem = '0';
        if (value) tem = '1';
        LoginActions.updateGestureStatus({
            userid: AppStore.getUserID(),
            enablegesture: tem
        }, (response) => {
            this.setState({
                useGesturePwd: value
            });
        }, (error) => {

        })
    };

    renderSwitch = () => {
        if (!this.state.useGesturePwd) {
            return (<View />
            )
        }
        return (
            <View
                style={{
                    height: ITEM_HEIGHT, width: WINDOW_WIDTH, backgroundColor: '#FFFFFF',
                }}
            >
                <View style={{
                    height: ITEM_HEIGHT, width: WINDOW_WIDTH, borderWidth: 1, borderBottomColor: '#D3D3D3',
                    flexDirection: 'row', alignItems: 'center', marginLeft: ITEM_MARGIN,
                    borderColor: '#FFFFFF',
                }}>
                    <Image
                        style={{
                            width: ITEM_ICON_SIZE,
                            height: ITEM_ICON_SIZE,
                            resizeMode: 'contain',
                        }}
                        source={require('../../image/user_landing.png')}
                    />
                    <View style={{flex: 1}}>
                        <Text
                            style={{marginLeft: ITEM_MARGIN + 1, fontSize: ITEM_FONT_SIZE, color: '#666666'}}
                        >手势密码登录</Text>
                    </View>
                    <Switch
                        onValueChange={(value) => this._updateGesturePwdStatus(value)}
                        value={this.state.useGesturePwd}
                        style={{
                            marginRight: ITEM_MARGIN
                        }}
                    />
                </View>
            </View>
        )
    };

    renderSetgesturePwdView = () => {
        // if (!this.state.useGesturePwd && this.state.gesturePwd) {
        //     return (
        //         <View/>
        //     );
        // }
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={() => this.toSetGuestPwd()}>
                <View
                    style={{
                        height: ITEM_HEIGHT, width: WINDOW_WIDTH, backgroundColor: '#FFFFFF',
                    }}
                >
                    <View style={{
                        height: ITEM_HEIGHT,
                        width: WINDOW_WIDTH,
                        borderWidth: 1,
                        borderBottomColor: '#D3D3D3',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginLeft: ITEM_MARGIN,
                        borderColor: '#FFFFFF',
                        paddingRight: ITEM_MARGIN,
                    }}>
                        <Image
                            style={{
                                width: ITEM_ICON_SIZE,
                                height: ITEM_ICON_SIZE,
                                resizeMode: 'contain',
                            }}
                            source={require('../../image/user_revise.png')}
                        />
                        <View style={{flex: 1}}>
                            <Text
                                style={{marginLeft: ITEM_MARGIN + 1, fontSize: ITEM_FONT_SIZE, color: '#666666'}}
                            >{this.state.useGesturePwd ? '修改手势密码' : '设置手势密码'}</Text>
                        </View>
                        <Icon
                            name="angle-right"
                            size={ITEM_ICON_SIZE}
                            color="#cccccc"
                            style={{
                                height: ITEM_ICON_SIZE,
                                width: ITEM_ICON_SIZE,
                            }}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    renderSetloginPwdView = () => {
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={() => this.toSetLoginPwd()}>
                <View
                    style={{
                        height: ITEM_HEIGHT, width: WINDOW_WIDTH, backgroundColor: '#FFFFFF',
                    }}
                >
                    <View style={{
                        height: ITEM_HEIGHT,
                        width: WINDOW_WIDTH,
                        borderWidth: 1,
                        borderBottomColor: '#D3D3D3',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginLeft: ITEM_MARGIN,
                        borderColor: '#FFFFFF',
                        paddingRight: ITEM_MARGIN,
                    }}>
                        <Image
                            style={{
                                width: ITEM_ICON_SIZE,
                                height: ITEM_ICON_SIZE,
                                resizeMode: 'contain',
                            }}
                            source={require('../../image/user_revise.png')}
                        />
                        <View style={{flex: 1}}>
                            <Text
                                style={{marginLeft: ITEM_MARGIN + 1, fontSize: ITEM_FONT_SIZE, color: '#666666'}}
                            >{this.state.useLoginPwd ? '修改登录密码' : '修改密码'}</Text>
                        </View>
                        <Icon
                            name="angle-right"
                            size={ITEM_ICON_SIZE}
                            color="#cccccc"
                            style={{
                                height: ITEM_ICON_SIZE,
                                width: ITEM_ICON_SIZE,
                            }}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    _alert () {
        return (
            Alert.alert(
                '提示',
                '是否注销',
                [
                    {text: '取消', onPress: () => {}, style: 'cancel'},
                    {text: '确定', onPress: () => this._logout()},
                ]
            )
        );
    }

    _toLogIn () {
        if (AppStore.isForceLogout()) {
            Promise.resolve()
                .then(() => {
                    this.refs.navigator.resetTo({
                        comp: LoginPage
                    });
                })
                .catch(() => {
                    Alert.alert('系统异常');
                });
        }
    }

    _logout () {
        InteractionManager.runAfterInteractions(() => {
            LoginActions.getLogOut({}, (response) => {
                this.setState({
                    onPress: () => this._toLogIn()
                });

            }, (error) => {
                Alert.alert(
                    '提示',
                    error,
                    [{text: '确定'}]
                );
            });
        });

    }

    _renderAbout () {
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={() => this.toAboutPage()}>
                <View
                    style={{
                        height: ITEM_HEIGHT, width: WINDOW_WIDTH, backgroundColor: '#FFFFFF',
                    }}
                >
                    <View
                        style={{
                            height: ITEM_HEIGHT,
                            width: WINDOW_WIDTH,
                            borderWidth: 1,
                            borderBottomColor: '#D3D3D3',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginLeft: ITEM_MARGIN,
                            borderColor: '#FFFFFF',
                            paddingRight: ITEM_MARGIN,
                        }}
                    >
                        <Image
                            style={{
                                width: ITEM_ICON_SIZE,
                                height: ITEM_ICON_SIZE,
                                resizeMode: 'contain',
                            }}
                            source={require('../../image/user_about.png')}
                        />
                        <View style={{flex: 1}}>
                            <Text
                                style={{marginLeft: ITEM_MARGIN + 1, fontSize: ITEM_FONT_SIZE, color: '#666666'}}
                            >关于</Text>
                        </View>
                        <Icon
                            name="angle-right"
                            size={ITEM_ICON_SIZE}
                            color="#cccccc"
                            style={{
                                height: ITEM_ICON_SIZE,
                                width: ITEM_ICON_SIZE,
                            }}
                        />
                    </View>
                </View>
            </TouchableOpacity>

        );
    }

    _toWeeklyReportPage (comp) {
        const idStr = comp + '';
        this.props.navigator.push({
            id: idStr,
            comp: comp,
        });
    }

    _renderWeekReport (title, comp) {
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={() => this._toWeeklyReportPage(comp)}>
                <View
                    style={{
                        height: ITEM_HEIGHT, width: WINDOW_WIDTH, backgroundColor: '#FFFFFF',
                    }}
                >
                    <View
                        style={{
                            height: ITEM_HEIGHT,
                            width: WINDOW_WIDTH,
                            borderWidth: 1,
                            borderBottomColor: '#D3D3D3',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginLeft: ITEM_MARGIN,
                            borderColor: '#FFFFFF',
                            paddingRight: ITEM_MARGIN,
                        }}
                    >
                        <Image
                            style={{
                                width: ITEM_ICON_SIZE,
                                height: ITEM_ICON_SIZE,
                                resizeMode: 'contain',
                            }}
                            source={require('../../image/user_about.png')}
                        />
                        <View style={{flex: 1}}>
                            <Text
                                style={{marginLeft: ITEM_MARGIN + 1, fontSize: ITEM_FONT_SIZE, color: '#666666'}}
                            >{title}</Text>
                        </View>
                        <Icon
                            name="angle-right"
                            size={ITEM_ICON_SIZE}
                            color="#cccccc"
                            style={{
                                height: ITEM_ICON_SIZE,
                                width: ITEM_ICON_SIZE,
                            }}
                        />
                    </View>
                </View>
            </TouchableOpacity>

        );
    }

    _deleteCaches () {
        Alert.alert(
            null,
            '确定清除缓存的文件',
            [
                {
                    text: '取消',
                },
                {
                    text: '确定', onPress: () => {
                        const fileSavePath = this._getFileSavePath();
                        RNFSManager.readDir(fileSavePath).then((files) => {
                            let count = 0;
                            files.forEach((item, i) => {
                                let deleteFlag = true;
                                if (Platform.OS === 'ios') {
                                    if (item.isDirectory() && (item.name == 'RCTAsyncLocalStorage_V1' || item.name == 'homeIcons')) {
                                        //跳过保存，用户信息的文件目录
                                        deleteFlag = false;
                                    }
                                } else {

                                }
                                if (deleteFlag) {
                                    count++;
                                    RNFSManager
                                        .unlink(item.path)
                                        .then((res) => {
                                        })
                                        .catch(error => {
                                        });
                                }
                            });
                            FSManager.clearAllDatas();
                            CommonFunc.alert('缓存清除完成');
                        }).catch((err) => {
                            CommonFunc.alert('缓存清除完成');
                        })
                    }
                }
            ]
        )
    }

    _getFileSavePath () {
        if (Platform.OS === 'ios') {
            // return RNFSManager.MainBundlePath;
            // return RNFSManager.MainBundlePath;
            return RNFSManager.DocumentDirectoryPath;
        } else {
            return RNFSManager.ExternalDirectoryPath;
        }
    }

    _renderDelCache () {
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={() => this._deleteCaches()}>
                <View
                    style={{
                        height: ITEM_HEIGHT, width: WINDOW_WIDTH, backgroundColor: '#FFFFFF',
                    }}
                >
                    <View
                        style={{
                            height: ITEM_HEIGHT,
                            width: WINDOW_WIDTH,
                            borderWidth: 0,
                            borderBottomColor: '#D3D3D3',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginLeft: ITEM_MARGIN,
                            borderColor: '#FFFFFF',
                            paddingRight: ITEM_MARGIN,
                        }}
                    >
                        <Image
                            style={{
                                width: ITEM_ICON_SIZE,
                                height: ITEM_ICON_SIZE,
                                resizeMode: 'contain',
                            }}
                            source={require('../../image/user_trash.png')}
                        />
                        <View style={{flex: 1}}>
                            <Text
                                style={{marginLeft: ITEM_MARGIN + 1, fontSize: ITEM_FONT_SIZE, color: '#666666'}}
                            >清除缓存</Text>
                        </View>
                        {/*<Icon*/}
                        {/*name="angle-right"*/}
                        {/*size={ITEM_ICON_SIZE}*/}
                        {/*color="#cccccc"*/}
                        {/*style={{*/}
                        {/*height: ITEM_ICON_SIZE,*/}
                        {/*width: ITEM_ICON_SIZE,*/}
                        {/*}}*/}
                        {/*/>*/}
                    </View>
                </View>
            </TouchableOpacity>

        );
    }

    _renderCodePage () {
        return (
            <TouchableOpacity activeOpacity={0.6} onPress={() => this.toQRCodePage()}>
                <View
                    style={{
                        height: ITEM_HEIGHT, width: WINDOW_WIDTH, backgroundColor: '#FFFFFF',
                    }}
                >
                    <View
                        style={{
                            height: ITEM_HEIGHT,
                            width: WINDOW_WIDTH,
                            borderWidth: 1,
                            borderBottomColor: '#D3D3D3',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginLeft: ITEM_MARGIN,
                            borderColor: '#FFFFFF',
                            paddingRight: ITEM_MARGIN,
                        }}
                    >
                        <Image
                            style={{
                                width: ITEM_ICON_SIZE,
                                height: ITEM_ICON_SIZE,
                                resizeMode: 'contain',
                            }}
                            source={require('../../image/user_QRCode.png')}
                        />
                        <View style={{flex: 1}}>
                            <Text
                                style={{marginLeft: ITEM_MARGIN + 1, fontSize: ITEM_FONT_SIZE, color: '#666666'}}
                            >二维码</Text>
                        </View>
                        <Icon
                            name="angle-right"
                            size={ITEM_ICON_SIZE}
                            color="#cccccc"
                            style={{
                                height: ITEM_ICON_SIZE,
                                width: ITEM_ICON_SIZE,
                            }}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    _renderUserInfo () {
        return (
            <View
                style={{
                    height: (USER_BG_HEIGHT - NOTIFICATION_HEIGHT), width: WINDOW_WIDTH, flexDirection: 'row',
                    justifyContent: 'center', marginBottom: SPACE_BETWEEN_ITEM,
                }}>
                {/* <Image
                    style={{
                        height: (USER_BG_HEIGHT - NOTIFICATION_HEIGHT),
                        width: WINDOW_WIDTH,
                    }}
                    source={require('../../image/user_bg_pic@2x.png')}
                > */}
                    <View style={{marginTop: (75 - NOTIFICATION_HEIGHT), alignItems: 'center'}}>
                        <Image
                            style={{
                                height: USER_ICON_SIZE,
                                width: USER_ICON_SIZE,
                                resizeMode: 'contain',
                            }}
                            source={require('../../image/user_image.png')}
                        />
                        <View style={{backgroundColor: 'transparent', }}>
                            <View style={{alignItems: 'center'}}>
                                <Text style={{fontSize: 20, color: '#1BA0E5', marginTop: 21, }}>
                                    {this.state.user.username}
                                </Text>
                            </View>
                            <View style={{alignItems: 'center', marginTop: 9}}>
                                <Text style={{fontSize: 14, color: '#1BA0E5'}}>{this.state.user.orgname}</Text>
                            </View>
                        </View>
                    </View>
                {/* </Image> */}
            </View>

        );
    }

    render () {
        return (
            <View
                /*style={{height: 60, width: WINDOW_WIDTH, backgroundColor: '#F1F2F7'}}*/
                style={{flex:1, backgroundColor: '#F1F2F7'}}
            >
                <ScrollView style={{flex: 1}}
                    contentContainerStyle={{backgroundColor: '#F1F2F7'}}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    automaticallyAdjustContentInsets={false}
                    scrollEnabled={true}
                >
                    <View style={{backgroundColor: '#F1F2F7', flex: 1}}>
                        {/*<!--用户信息-->*/}
                        {this._renderUserInfo()}

                        {/*<!--手势密码登录-->*/}
                        {this.renderSwitch()}

                        {/*<!--设置手势密码/修改手势密码-->*/}
                        {this.renderSetgesturePwdView()}

                        {/*<!--设置登录密码/修改登录密码-->*/}
                        {/*{this.renderSetloginPwdView()}*/}

                        {/*<!--二维码-->*/}
                        {/*{this._renderCodePage()}*/}

                        {/*<!--关于-->*/}
                        {this._renderAbout()}

                        {/*清除缓存*/}
                        {this._renderDelCache()}

                        {/*<!--退出登录-->*/}
                        <TouchableOpacity activeOpacity={0.6} onPress={() => this._alert()}>
                            <View
                                style={{
                                    height: ITEM_HEIGHT, width: WINDOW_WIDTH, backgroundColor: 'white',
                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                    marginTop: SPACE_BETWEEN_ITEM, marginBottom: SPACE_BETWEEN_ITEM,
                                }}
                            >
                                <Text style={{fontSize: ITEM_FONT_SIZE, color: '#5D5D5D'}}>退出登录</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }
}
