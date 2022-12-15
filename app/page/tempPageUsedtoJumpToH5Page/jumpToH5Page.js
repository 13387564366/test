/**
 * Created by tenwa on 16/11/23.
 */

import React, { Component } from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    Image,
    Dimensions,
    Button,
} from 'react-native';

import NavigationBar from '../../components/navigator/NavBarView';
import RNButton from '../../components/rnButton/rnButton';
// 为了嵌入H5页面
// import {WebView} from 'react-native-webview';



const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

class JumpToH5Page extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static propTypes = {
        title: React.PropTypes.string,
        textStyle: React.PropTypes.any,
        imageStyle:React.PropTypes.any,
        style:React.PropTypes.any,
        imageUrl:React.PropTypes.any,
        refreshStyle:React.PropTypes.any,
    };

    static defaultProps = {
        title: '暂无数据',
        imageUrl:require('../../image/empty@2x.png')
    };


    //// 分标题栏＋内容2部分

    render() {
        const renderTitleBar = this.props.showTitleBar || (this.props.param ? this.props.param.showTitleBar : false);
        if (renderTitleBar) {
            const title = (this.props.param && this.props.param.title) || '待办列表';
            return (
                <NavigationBar
                    title={title}
                    navigator={this.props.navigator}
                    goBack={true}
                >
                    {/* {this._renderSearchContent()} */}
                    {this._renderContent()}
                </NavigationBar>
            );
        } else {
            return (
                <View
                    style={{flex: 1}}
                >
                    {this._renderContent()}
                </View>
            );
        }
    }

    //// 渲染webview

    _renderContent() {
        let h5Url ='http://10.112.50.60:81/reportForm/throwInReport';
        return (
            <View
                style={[{ alignItems: 'center', justifyContent: 'center',alignSelf:'center'},this.props.style]}
                {...this.props}>

            {/* <WebView
                style={webView_style}
                scrollEnabled={false} 
                javaScriptEnabled={true}  
                injectedJavaScript={'插入到h5页面中的js代码'}
        o       nMessage={event => {'接收h5页面传过来的消息'}}
                source={{uri: 'http://10.112.50.60:81/reportForm/throwInReport'}}
      ></WebView> */}

                <TouchableOpacity
                    {...this.props}
                    style={[{ justifyContent: 'center', alignItems: 'center', alignSelf:'center'}, this.props.refreshStyle]}

                >
                    <Text
                        style={[{ fontSize: 16, color: '#D3D3D3' }, this.props.textStyle]}
                    >
                        {this.props.title}
                        
                    </Text>
                <Text  > {this.props.title}</Text>
            {/* RN 0.35， 版本太低，用不了Button控件 
            https://stackoverflow.com/questions/41682306/element-type-is-invalid-expected-a-string-for-built-in-components*/}
  <RNButton title = "我是按钮" >  </RNButton>

                </TouchableOpacity>
            </View>
        );
    }

    ////

    _renderContent2() {
            return (
                <View
                    style={[{ alignItems: 'center', justifyContent: 'center',alignSelf:'center'},this.props.style]}
                    {...this.props}>
                        
                    {/* <Image
                        style={
                            [{width: WINDOW_WIDTH, resizeMode: 'contain',
                                marginTop: WINDOW_HEIGHT * 0.1},this.props.imageStyle]}
                        version="1"
                        source={this.props.imageUrl}
                    /> */}

                     
                    <TouchableOpacity
                        {...this.props}
                        style={[{ justifyContent: 'center', alignItems: 'center', alignSelf:'center'}, this.props.refreshStyle]}

                    >
                        <Text
                            style={[{ fontSize: 16, color: '#D3D3D3' }, this.props.textStyle]}
                        >
                            {this.props.title}
                            
                        </Text>
                    <Text  > {this.props.title}</Text>
                {/* RN 0.35， 版本太低，用不了Button控件 
                https://stackoverflow.com/questions/41682306/element-type-is-invalid-expected-a-string-for-built-in-components*/}
      <RNButton title = "我是按钮" >  </RNButton>

                    </TouchableOpacity>
                </View>
            );
        }


}

export default JumpToH5Page;
