/**
 * Created by tenwa on 16/11/14.
 */
import React, {Component} from 'react';
import {
    View,
    Image,
    Dimensions,
    Alert,
    TouchableWithoutFeedback,
} from 'react-native';


import NavigationBar from '../../components/navigator/NavBarView';
import DownloadApkPage from './downloadPage'

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

const DOWNLOAD_APK_URL = 'https://www.pgyer.com/rzzlapp';
// const DOWNLOAD_APK_URL = 'https://www.baidu.com';

class CodePage extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title="二维码"
                goBack={true}
            >
                <View style={{width: WINDOW_WIDTH, height: WINDOW_HEIGHT, alignItems: 'center',}}>
                    <View style={{flex: 1}}/>
                    <View style={{flex: 2}}/>
                </View>

            </NavigationBar>
        );
    }

    _showDownloadPage() {
        this.props.navigator.push({
            id: 'downloadApk',
            comp: DownloadApkPage,
            param: {
                url: DOWNLOAD_APK_URL,
            }
        })
    }
}
export  default CodePage;