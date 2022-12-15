/**
 * Created by cui on 11/16/16.
 */

import React, {Component} from 'react';
import {
    View,
    Text,
    ListView,
    Image,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Alert,
    Platform,
    CameraRoll,
} from 'react-native';

import NavigationBar from '../../components/navigator/NavBarView';
import CommonLink from '../../modules/CommonLink';
var AndroidSaveFileModule = require('react-native').NativeModules.SaveFileModule;

const WINDOW_WIDTH = Dimensions.get('window').width;

class AttachmentDetailPage extends Component {
    constructor(props) {
        super(props);
        this._renderActivityIndicator = this._renderActivityIndicator.bind(this);
        this.state = {
            title: '附件详情',
        };
    }

    componentDidMount() {

    }

    _renderActivityIndicator() {
        if (!this.state.loadEnd) {
            return <ActivityIndicator
                style={{
                    height: 36,
                    flex: 1,
                    alignSelf: 'stretch'
                }}
                color="#CF5656"
            />;
        } else if (!this.state.loaded) {
            return <Text style={{color: '#CF5656'}}> ↻ 重新获取</Text>;
        } else {
            return null;
        }
    }

    _showAlert(data) {
        Alert.alert(
            null,
            '请选择...',
            [
                {
                    text: '保存到本地',
                    onPress: () => {
                        //this.setState({title: '保存到本地',});
                        this._saveImgToLocal(data.imageUrl);
                    }
                },
                {
                    text: '取消',
                    onPress: () => this.setState({title: '取消',})
                },
            ]
        );
    }

    _saveImgToLocal(url){
        if(Platform.OS === 'ios'){
            CameraRoll.saveToCameraRoll(encodeURI(url)).then(
                (data) => {
                    Alert.alert('已保存至相册');
                },
                (error) => {
                    Alert.alert("保存失败")
                });
        }else{
            //Alert.alert("Android正在桥接中，请等待");
            AndroidSaveFileModule.saveToFile(url).then(
                (filePath) => {
                    let relativePath = filePath.replace('/storage/emulated/0/','')
                    let msg = '已保存至 ' + relativePath;
                    Alert.alert(null,msg);
                },
                (error) => {
                    Alert.alert("保存失败")
                }
            );
        }
    }

    _getFileDownloadUrl(rowData) {
        let fileUrl = CommonLink.downloadAttachment(rowData.id);
        fileUrl = encodeURI(fileUrl);
        return fileUrl;
    }

    render() {
        const imageUrl = this._getFileDownloadUrl(this.props.param);
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title={this.state.title}
                goBack={true}
            >
                <View style={{
                    flex: 1, paddingHorizontal: 15, paddingVertical: 10,
                    alignItems: 'center'
                }}>
                    <TouchableWithoutFeedback onLongPress={() => {
                        this._showAlert({imageUrl: imageUrl});
                    }}>
                        <Image
                            style={{
                                resizeMode: 'contain',
                                height: WINDOW_WIDTH - 40,
                                width: WINDOW_WIDTH - 40,
                                backgroundColor: '#e7e7e7',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 20,
                                borderRadius: 5
                            }}
                            onLoad={() => this.setState({loaded: true,})}
                            onLoadEnd={() => this.setState({loadEnd: true})}
                            source={{uri: imageUrl, isStatic: true}}
                        >
                            {this._renderActivityIndicator()}
                        </Image>
                    </TouchableWithoutFeedback>
                    <Text style={{fontSize: 14, color: '#222', width: WINDOW_WIDTH - 40}}>
                        {this.props.param.remark}
                    </Text>
                </View>
            </NavigationBar>
        );
    }
}

export default AttachmentDetailPage;

