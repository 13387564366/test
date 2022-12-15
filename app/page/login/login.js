/**
 * Created by tenwa on 16/10/22.
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Text,
    View,
    ScrollView,
    Image,
    TextInput,
    AlertIOS,
    Alert,
    Dimensions,
    InteractionManager,
    ActivityIndicator,
    Platform,
    Linking,
    NativeModules,
    NativeEventEmitter,
} from 'react-native';

import {
    CommonStyle,
    CommonLink,
    _,
    AppStore,
    AppActions
} from '../../modules/ThirdPartyComponents';
import LoginActions from '../../actions/LoginActions';
import MainContainer from '../mainContainer';
import PasswordGesture from '../../components/gesturePassword/index';
import RNButton from '../../components/rnButton/rnButton';
import DeviceInfo from 'react-native-device-info';
const XiMiPushSetModule = require('react-native').NativeModules.XiMiPushSetModule;
const XiMiPushModels = require('react-native').NativeModules.XiMiPushManager;
const NativeToJsModule = new NativeEventEmitter(NativeModules.RNToJSModel);
import CommonFunc from '../commonStyle/commonFunc';
import OptionalModalView from '../../components/optionalModal/optionalModalView';
import FSManager from '../../modules/fsManager';
const {
    FS_NONE,
    FS_DOWNLOADING,
    FS_EXISTS,
    EVENT_FILE_DOWNLOAD_SUCCESS,
    EVENT_FILE_DOWNLOAD_PROGRESS,
    EVENT_FILE_DOWNLOAD_FAIL,
} = FSManager;

import FileDownloader from '../workbench/homePageIconUtils';
const enableOpenServer = false;//是否可连接任意服务器
const isIos = Platform.OS === 'ios';//ios

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const downloadViewWidth = deviceWidth * 0.8;
const progressLineWidth = downloadViewWidth - 14 * 2;
const textColer = '#555'
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    logo: {
        marginTop: 100,
        marginBottom: 50,
        resizeMode: 'contain'
    },
    itemContainer: {
        backgroundColor: 'white',
        borderRadius: 4,
        width: deviceWidth * 0.8,
        height: 50,
        flexDirection: 'row',
        alignSelf: 'center',
        borderBottomWidth: 0.5,
        marginVertical: 2,
        borderColor: '#d7d7d7',
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemIcon: {
        marginLeft: 15,
        marginTop: 0,
        resizeMode: 'contain',
    },
    itemText: {
        color: textColer,
        width: 60,
        fontSize: 14,
        marginLeft: 15,
    },
    itemInput: {
        paddingLeft: 10,
        alignSelf: 'stretch',
        marginTop: 0,
        flex: 1,
        margin: 1,
        fontSize: 14,
        color: textColer
    },
    itemOperIcon: {
        height: 21,
        width: 21,
        marginRight: 10,
        resizeMode: 'contain',
    },
    loginText: {
        color: 'white',
        letterSpacing: 4,
        fontSize: 20,
    },
    bottomText: {
        color: '#f0f0f0',
        fontSize: 13,
    },
    imgIcon: {
        width: 13,
        height: 13,
        marginRight: 5,
        resizeMode: 'contain',
    },
    useIcon: {
        height: 60,
        width: 60,
    },
    userText: {
        marginTop: 10,
    },
    footer: {
        marginBottom: 10,
        alignSelf: 'flex-start',
        color: 'white',
        paddingRight: 10
    },
    frame: {
        backgroundColor: 'transparent'
    },
    fullScreen: {
        height: deviceHeight,
        width: deviceWidth
    },
});

class Login extends Component {
    constructor(props) {
        super(props);
        this._login = this._login.bind(this);
        this._submit = this._submit.bind(this);
        this._redirect = this._redirect.bind(this);
        this._setHostUrl = this._setHostUrl.bind(this);
        this._clearErrorMsg = this._clearErrorMsg.bind(this);
        this.state =
            _.assign({
                autoLogin: AppStore.autoLogin(),
                username: AppStore.getUserName(),
                password: '',
                hostUrl: AppStore.getHostUrl(),
                checkCode: '',
                loaded: false,
                loadError: false,
                useGestPwd: false,
                loginOut: AppStore.isLoginOut(),
                limit_times: 5,
                regId: '-',
                isPwdReadable: false,//密码是否可见
                downloadOk: false,//安装包下载成功标志
            });
        this.forceUpdate = null;
        this.newVersion = null;
        this.lastLoginReturn = true;//修复：多次点击登录，多次失败，错误对话框弹出多次的情况！
        this.homeIcons = [];//首页图标信息
        this.updateInfo = null;
    }

    _redirect (responseData) {

        const flowList = responseData.flowDesc || [];
        const mainParam = {flowList: flowList, homeIcons: this.homeIcons};
        AppStore.setMainParam(mainParam);
        this.props.navigator.resetTo({comp: MainContainer, param: {flowList: flowList, homeIcons: this.homeIcons}});
    }

    _redirectToReport(responseData){

    }

    _getRegIdFromNative () {
        if (Platform.OS === 'ios') {
            const that = this;
            this.listener = NativeToJsModule.addListener('getMiPushRegID', (data) => {
                that.setState({regId: data.regId});
                that._alertRegId(data.regId);
            });
            XiMiPushModels.getMiPushRegID((error, regId) => {
                if (regId) {
                    this.setState({regId: regId});
                    this._alertRegId(regId);
                }
            });
        } else {
            XiMiPushSetModule.getRegId().then(
                (regId) => {
                    this.setState({regId: regId});
                    this._alertRegId(regId);
                },
                (error) => {
                    this.setState({regId: '10000'});//无效id统一为：10000，
                }
            );
        }
    }

    _alertRegId = (regId) => {
        let msg = (Platform.OS === 'ios' ? 'ios' : 'android') + ',注册小米regId:' + regId;
        console.log(msg);
        // Alert.alert(null, msg);
    };

    componentDidMount () {
        CommonFunc.lockToPortrait();
        if (enableOpenServer) {//可使用任意服务
            CommonLink.setHostUrl(AppStore.getHostUrl());
        }
        InteractionManager.runAfterInteractions(() => {
            this._checkUpdate();
        });
        this._getRegIdFromNative();
        this._addDownloadListeners();
    }

    _addDownloadListeners = () => {
        if (!isIos) {
            CommonFunc.addListenerAndType(this._progressChangeListener, EVENT_FILE_DOWNLOAD_PROGRESS);
            CommonFunc.addListenerAndType(this._downloadSuccessListener, EVENT_FILE_DOWNLOAD_SUCCESS);
            CommonFunc.addListenerAndType(this._downloadFailListener, EVENT_FILE_DOWNLOAD_FAIL);
        }
    };

    _removeDownloadListeners = () => {
        if (!isIos) {
            CommonFunc.removeListenerAndType(this._progressChangeListener, EVENT_FILE_DOWNLOAD_PROGRESS);
            CommonFunc.removeListenerAndType(this._downloadSuccessListener, EVENT_FILE_DOWNLOAD_SUCCESS);
            CommonFunc.removeListenerAndType(this._downloadFailListener, EVENT_FILE_DOWNLOAD_FAIL);
        } else {
            this.listener.remove();
        }
    };

    _progressChangeListener = (progressInfo) => {
        this.setState({downloadUpdateIndex: this.state.downloadUpdateIndex + 1});
    };

    _downloadSuccessListener = (progressInfo) => {
        this.setState({downloadUpdateIndex: this.state.downloadUpdateIndex + 1, });
        this.refs.OptionalModalView.close();
    };

    _downloadFailListener = (progressInfo) => {
        this.setState({downloadUpdateIndex: this.state.downloadUpdateIndex + 1});
        this.refs.OptionalModalView.close();
    };

    componentWillUnmount () {
        this._removeDownloadListeners();
    }


    _downloadHomeIcons () {
        const homeIcons = this.homeIcons;
        homeIcons.forEach(item => {
            let url = CommonLink.downloadFile(item.id.value);
            let filePath = item.filepath.value;
            let downloadOptions = {
                fileName: item.filename.value,
                fileUrl: url,
                fileSize: item.filesize.value,
                fileSaveName: filePath.substring(filePath.lastIndexOf('/') + 1),
            };
            FileDownloader.downloadFile(downloadOptions);
        });
    }

    _checkUpdate = () => {
        const curBuildVersion = DeviceInfo.getBuildNumber();
        const devOs = Platform.OS === 'ios' ? 'ios' : 'android';
        LoginActions.fetchAppVersionInfo({
            devOs: devOs,
            versionCode: curBuildVersion,
        },
            (response) => {
                let updateState = response.upgradecode || '0';
                this.homeIcons = response.flowinit || [];
                this._downloadHomeIcons();
                //yhf 为了防止后端更新，app显示更新的麻烦，不然每次要去gradle改version号
                // if (updateState != '0') {
                if (false) {
                    const versionInfo = response.versionconstant || {};
                    this.forceUpdate = versionInfo.mustupdate == 'Y';
                    this.newVersion = true;//强制需要升级
                    const versionCode = versionInfo.versioncode;
                    const versionName = versionInfo.versionname;
                    const fileName = versionInfo.filename;
                    const fileSize = versionInfo.filesize || '0';
                    const downloadInfo = {
                        fileId: versionName,
                        fileSize: fileSize,
                        fileName: fileName,
                    };
                    this.updateInfo = downloadInfo;
                    this._updateApp(downloadInfo);
                } else {
                    this.newVersion = false;//不需要升级
                    this._fetchdata();//不需要升级，获取手势密码状态
                }
            },
            (err) => {
                Alert.alert(null, err);
            });
    };


/**

  _login (userName, passWord, autoLogin = false) {
        if (this.lastLoginReturn) {//上次点击登录按钮返回后，才能再次请求网络
            this.lastLoginReturn = false;
        } else {
            return;
        }
        LoginActions.login({
            autoLogin: autoLogin,
            username: userName,
            password: passWord,
            psttype: 'common',
            regId: this.state.regId,
            devType: Platform.OS === 'ios' ? 'ios' : 'android',
        }, (responseData) => {
            this.lastLoginReturn = true;
            this._redirect(responseData);
        }, (err) => {
            this.lastLoginReturn = true;
            Alert.alert(
                null,
                err,
                [{text: '确定'}]
            );
        });
    }
*/

        _checkPermission = () => {
//            const curBuildVersion = DeviceInfo.getBuildNumber();
//            const devOs = Platform.OS === 'ios' ? 'ios' : 'android';
            LoginActions.getPermission({
                userid: this.state.username
            },
                (response) => {
                    console.log(response);
                },
                (err) => {
                    Alert.alert(null, err);
                });
        };

    _downloadApp = (downloadInfo) => {
        const isAppExists = FSManager.isAppExist(downloadInfo.fileId, downloadInfo.fileSize, downloadInfo.fileName);
        if (!isAppExists) {
            this.refs.OptionalModalView.open();
        }
        FSManager.downloadApp(downloadInfo.fileId, downloadInfo.fileSize, downloadInfo.fileName);
    };

    _onDownloadPress = () => {
        const downloadInfo = this.updateInfo;
        if (isIos) {
            const downloadPage = CommonLink.fetchDownloadPage();
            Linking.canOpenURL(downloadPage).then((supported) => {
                if (supported) {
                    Linking.openURL(downloadPage);
                }
            }).catch((err) => {

            });
        } else {
            this._downloadApp(downloadInfo);
        }
    };

    _updateApp = () => {
        if (this.newVersion && this.forceUpdate) {
            Alert.alert(
                '新版本',
                '新版本添加了新功能，请更新到最新版本',
                [
                    {
                        text: '下载', onPress: () => this._onDownloadPress(),
                    }
                ],
                {
                    cancelable: false,
                }
            );
        } else if (this.newVersion) {
            Alert.alert(
                '新版本',
                '新版本添加了新功能，请更新到最新版本',
                [
                    {
                        text: '下载', onPress: () => this._onDownloadPress(),
                    },
                    {
                        text: '下次', onPress: () => {
                        }
                    }
                ],
            )
        }
    };

    _fetchdata () {
        let userId = AppStore.getUserID();
        if (userId) {//用户登录过，才获取手势密码信息。
            LoginActions.getGestureInfo({
                userid: userId,
            }, (response) => {
                let data = response.enablegesture;
                let flag = data === '1';
                this.setState({
                    useGestPwd: flag,
                });
                if (!flag) {
                    const password = AppStore.getPassword();
                    if (this.state.autoLogin === true && this.state.username && password) {
                        const autoLogin = this.state.autoLogin;
                        const username = this.state.username;
                        this._login(username, password, true);
                    }
                }
            }, (error) => {
                Alert.alert(
                    '提示',
                    error,
                    [{text: '确定'}]
                );
            });
        }
    }

    _login (userName, passWord, autoLogin = false) {
        if (this.lastLoginReturn) {//上次点击登录按钮返回后，才能再次请求网络
            this.lastLoginReturn = false;
        } else {
            return;
        }
        LoginActions.login({
            autoLogin: autoLogin,
            username: userName,
            password: passWord,
            psttype: 'common',
            regId: this.state.regId,
            devType: Platform.OS === 'ios' ? 'ios' : 'android',
        }, (responseData) => {
            this.lastLoginReturn = true;
            this._redirect(responseData);
        }, (err) => {
            this.lastLoginReturn = true;
            Alert.alert(
                null,
                err,
                [{text: '确定'}]
            );
        });
    }

    _goLogin = () => {
        this.props.navigator.replace({
            comp: Login,
        });
    };

    _submit () {
        if (this.newVersion && this.forceUpdate) {
            this._updateApp();
        } else if (this.newVersion === null) {
            this._checkUpdate();
        } else {
            if (this.state.username === '') {
                Alert.alert(
                    '提示',
                    '请输入用户名',
                    [{text: '确定'}]
                );
            } else if (this.state.password === '') {
                Alert.alert(
                    '提示',
                    '请输入密码',
                    [{text: '确定'}]
                );
            } else {
                this._login(this.state.username, this.state.password);
            }
        }
    }

    _unLockOnStart () {
        this.setState({
            status: 'normal',
            message: ''
        });
    }

    _updateGesturePwd () {
        LoginActions.updateGestureStatus({
            userid: AppStore.getUserID(),
            enablegesture: '0'
        }, (response) => {
            this.setState({useGestPwd: false})
        }, (error) => {
        });
    }

    _clearErrorMsg () {
        try {
            this.refs.pg.resetActive();
        } catch (e) {

        }
    }

    _unLockOnEnd (password) {
        if (this.state.limit_times > 0) {
            LoginActions.login({
                username: AppStore.getUserName(),
                password: password,
                psttype: 'hand',
                regId: this.state.regId,
                devType: Platform.OS === 'ios' ? 'ios' : 'android',
            }, (responseData) => {
                this._redirect(responseData);
            }, () => {
                const limitTimes = this.state.limit_times - 1;
                this.setState({
                    limit_times: limitTimes,
                    status: 'wrong',
                    message: '手势密码错误,还可重试' + limitTimes + '次',
                    interval: 200
                });
                this._clearErrorMsg();
                if (limitTimes < 1) {
                    this._updateGesturePwd();
                    Alert.alert(
                        '解锁失败',
                        '连续5次解锁失败,请重新登录开启手势密码!',
                        [{text: '确定', onPress: this._goLogin}]
                    );
                }
            });
        } else {
            Alert.alert(
                '解锁失败',
                '连续5次解锁失败,请重新登录开启手势密码!',
                [{text: '确定', onPress: this._goLogin}]
            );
        }
    }

    _renderChangeHostUrl () {
        if (!enableOpenServer) {
            return null;
        }
        return (
            <View style={{
                height: 50,
                flexDirection: 'row',
                alignSelf: 'center',
                borderBottomWidth: 1,
                marginVertical: 2,
                borderColor: '#F4F4F4',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <TextInput
                    style={styles.itemInput}
                    autoCorrect={false}
                    placeholder="服务器地址"
                    placeholderTextColor="#22232840"
                    name="hostUrl"
                    value={this.state.hostUrl}
                    clearButtonMode="always"
                    autoCapitalize="none"
                    onChangeText={(text) => this.setState({hostUrl: text})}
                    underlineColorAndroid="transparent"
                />
                <RNButton
                    style={{
                        backgroundColor: 'green', paddingHorizontal: 10,
                        borderWidth: 1, borderColor: '#00428A', borderRadius: 5,
                        justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
                    }}
                    textStyle={{color: 'white', fontSize: 18}}
                    title="设置"
                    onPress={() => this._setHostUrl()}
                />

            </View>

        );
    }

    _setHostUrl () {
        CommonLink.setHostUrl(this.state.hostUrl);
    }

    renderUserHead = () => (
        <View style={[CommonStyle.column, {width: deviceWidth, paddingTop: deviceHeight * 0.09, }, CommonStyle.center]}>
            <Image
                source={require('../../image/login_logo_amarsoft.png')}
            />
            <Text
                style={{
                    marginTop: 30,
                    backgroundColor: 'transparent',
                    color: '#22232860',
                    fontSize: 16,
                }}
            >业务系统</Text>
        </View>
    );

    _renderLoginByGesture = () => (
        <Image
            style={[styles.frame, styles.fullScreen]}
            source={require('../../image/load_bg.png')}
        >
            <PasswordGesture
                ref="pg"
                children={this.renderUserHead()}
                style={styles.frame}
                rightColor="red"
                wrongColor="yellow"
                textStyle={{marginBottom: -deviceHeight * 0.25}}
                status={this.state.status}
                message={this.state.message}
                interval={this.state.interval}
                onEnd={(password) => this._unLockOnEnd(password)}
                onStart={() => this._unLockOnStart()}
            />
            <View style={{marginBottom: deviceHeight * 0.05, alignItems: 'flex-end', }}>
                <TouchableOpacity onPress={() => this.setState({useGestPwd: false, })}>
                    <Text style={[CommonStyle.btnLabel, styles.footer]}>{'使用账户密码登陆'}</Text>
                </TouchableOpacity>
            </View>
        </Image>
    );

    _onPwdStateChange = () => {
        const prevState = this.state.isPwdReadable;
        this.setState({isPwdReadable: !prevState});
    };

    _renderPwdStateIcon = () => {
        let img = null;
        if (this.state.isPwdReadable) {
            img = <Image source={require('../../image/login_pwd_eye_close.png')} />;
        } else {
            img = <Image source={require('../../image/login_pwd_eye.png')} />;
        }
        return (
            <TouchableOpacity
                onPress={this._onPwdStateChange}
                style={{paddingHorizontal: 10, paddingVertical: 10, }}
            >
                {img}
            </TouchableOpacity>);
    };

    _renderProgressLine () {
        let total = this.updateInfo.fileSize || 0;
        const fileId = this.updateInfo.fileId;
        const cur = FSManager.getFileDownloadProgress(fileId);
        const percentVal = (cur / total * 100).toFixed(0) + '%';
        const progressWidth = progressLineWidth * cur / total;
        const readableCurSize = FSManager.getReadableFileSize(cur);
        const readableTotalSize = FSManager.getReadableFileSize(total);
        const downloadSizeText = readableCurSize + '/' + readableTotalSize;
        return (
            <View
                style={{width: progressLineWidth, alignItems: 'center', marginTop: 20, }}
            >
                <View
                    style={{
                        width: progressLineWidth,
                        backgroundColor: '#DDDCDF',
                        height: 3,
                        alignItems: 'flex-start',
                        marginTop: 20,
                    }}
                >
                    <View
                        style={{width: progressWidth, backgroundColor: '#9bDB3B', height: 3, }}
                    />
                </View>
                <View
                    style={{flexDirection: 'row', justifyContent: 'space-between', width: progressLineWidth, }}
                >
                    <Text>{percentVal}</Text>
                    <Text>{downloadSizeText}</Text>
                </View>
            </View>
        );
    }

    _renderDownloadView = () => {
        if (!this.updateInfo) {
            return null;
        }
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }}
            >
                <View
                    style={{width: downloadViewWidth, padding: 14, backgroundColor: 'white', borderRadius: 5, }}
                >
                    <Text>正在下载更新</Text>
                    {this._renderProgressLine()}
                </View>
            </View>
        );
    };

    _renderDownloadInfo = () => {
        if (isIos) {
            return null;
        }
        return (
            <OptionalModalView
                ref="OptionalModalView"
                renderContentView={this._renderDownloadView}
            />
        );
    };

    renderLoginByCount = () => (
        <ScrollView scrollEnabled={false}>
            <View style={[CommonStyle.contentFull, {backgroundColor: 'white'}]}>
                <View style={{flex: 1, alignItems: 'center'}}>
                    <View style={{flex: 2,marginTop:40+(isIos ? 20 : 0), alignItems: 'center', justifyContent: 'center'}}>
                        <View style={{paddingBottom:20}}>
                            <Image resizeMode={'contain'} source={require('../../image/login_logo_icon.png')} style={{width: 100, height: 100}} />
                        </View>
                        <View style={{paddingBottom:15}}><Text style={{backgroundColor: 'transparent', fontSize: 25, color: textColer,fontWeight: '900'}}>物产融资租赁</Text></View>
                        <View><Text style={{backgroundColor: 'transparent', fontSize: 16, color: textColer,}}>产业金融最佳伙伴</Text></View>
                    </View>

                    <View style={{flex: 3, alignItems: 'center', justifyContent: 'center'}}>

                        <View style={styles.itemContainer}>
                            {/* <Image
                                style={styles.itemIcon}
                                source={require('../../image/login_name_icon.png')}
                            /> */}
                            <Text style={styles.itemText}>用户名</Text>
                            <TextInput
                                style={styles.itemInput}
                                autoCorrect={false}
                                placeholder="请输入用户名"
                                placeholderTextColor="#22232840"
                                name="username"
                                value={this.state.username}
                                clearButtonMode="always"
                                autoCapitalize="none"
                                onChangeText={(text) => this.setState({username: text})}
                                underlineColorAndroid="transparent"
                            />
                        </View>
                        <View style={styles.itemContainer}>
                            {/* <Image
                                style={styles.itemIcon}
                                source={require('../../image/login_password_icon.png')}
                            /> */}
                            <Text style={styles.itemText}>密码</Text>
                            <TextInput
                                style={styles.itemInput}
                                autoCorrect={false}
                                placeholder="请输入密码"
                                placeholderTextColor="#22232840"
                                name="password"
                                value={this.state.password}
                                clearButtonMode="always"
                                autoCapitalize="none"
                                secureTextEntry={!this.state.isPwdReadable}
                                onChangeText={(text) => this.setState({password: text})}
                                underlineColorAndroid="transparent"
                            />
                            {/* {this._renderPwdStateIcon()} */}
                        </View>
                        {this._renderChangeHostUrl()}

                        <TouchableOpacity onPress={this._submit}>
                            <View
                                style={{
                                    width: deviceWidth * 0.8,
                                    height: 45,
                                    paddingVertical: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: 50,
                                    backgroundColor: '#1BA0E5',
                                    borderRadius: 5,
                                }}
                            >
                                <Text style={{color: 'white', fontSize: 18, backgroundColor: 'transparent', fontWeight: '600'}}>登 录</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{height: Platform.OS === 'ios' ? 60 : 80, width: deviceWidth}}>
                        <View style={{
                            position: 'absolute',
                            bottom: Platform.OS === 'ios' ? 20 : 40,
                            width: deviceWidth,
                            alignItems: 'center',
                        }}>
                            <Text
                                numberOfLines={2}
                                style={{color: textColer, fontSize: 13, textAlign: 'center', lineHeight: 20}}
                            >Copyright 2020,{'\n'} 浙江物产融资租赁有限公司.</Text>
                        </View>

                    </View>
                </View>
                {this._renderDownloadInfo()}
            </View>
        </ScrollView>
    );

    render () {
        if (this.state.useGestPwd) {
            return this._renderLoginByGesture()
        }
        return this.renderLoginByCount()
    }
}
module.exports = Login;