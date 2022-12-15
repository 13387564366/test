/**
 * Created by tenwa on 16/11/15.
 */
import React, {Component} from 'react';
import {
    Image,
    View,
    Text,
    Dimensions,
    Alert,
    InteractionManager,
    Platform,
} from 'react-native'

import NavigationBar from '../../components/navigator/NavBarView';
import DeviceInfo from 'react-native-device-info';


const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

class AboutPage extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render () {
        const appVersionName = Platform.OS === 'ios' ? DeviceInfo.getBuildNumber() : DeviceInfo.getVersion();
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title="版本信息"
                goBack={true}
            >
                <View style={{flex: 1,alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f7f7'}}>
                    <Image
                        source={require('../../image/login_logo_amarsoft.png')}
                    />
                    <Text style={{fontSize: 14, color: '#999999', marginTop: 20}}>{appVersionName}</Text>
                    <Text style={{fontSize: 15, color: '#999999', marginTop: 20}}>融资租赁管理系统</Text>
                </View>
            </NavigationBar>
        );
    }
}
export default AboutPage;