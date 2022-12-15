/**
 * Created by tenwa on 16/12/6.
 */

import React from 'react';
import{
    View,
    WebView,
    Dimensions,
} from 'react-native';
import NavigationBar from '../../components/navigator/NavBarView'

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

export default class DownloadApkPage extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <NavigationBar
                title="下载"
                navigator={this.props.navigator}
                goBack={true}
            >
                <WebView
                    source={{url: this.props.param.url}}
                    style={{width: WINDOW_WIDTH, height: WINDOW_HEIGHT, backgroundColor: 'red',}}
                    startInLoadingState={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scalesPageToFit={true}
                >
                </WebView>
            </NavigationBar>
        );
    }
}

