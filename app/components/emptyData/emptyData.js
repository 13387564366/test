/**
 * Created by tenwa on 16/11/23.
 */

import React, { Component } from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    Image,
    Dimensions
} from 'react-native';


const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

class EmptyData extends Component {
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

    render() {
            return (
                <View
                    style={[{ alignItems: 'center', justifyContent: 'center',alignSelf:'center'},this.props.style]}
                    {...this.props}>
                    <Image
                        style={
                            [{width: WINDOW_WIDTH, resizeMode: 'contain',
                                marginTop: WINDOW_HEIGHT * 0.1},this.props.imageStyle]}
                        version="1"
                        source={this.props.imageUrl}
                    />
                    <TouchableOpacity
                        {...this.props}
                        style={[{ justifyContent: 'center', alignItems: 'center', alignSelf:'center'}, this.props.refreshStyle]}

                    >
                        <Text
                            style={[{ fontSize: 16, color: '#D3D3D3' }, this.props.textStyle]}
                        >
                            {this.props.title}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }


}

export default EmptyData;
