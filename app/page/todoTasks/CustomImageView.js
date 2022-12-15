/**
 * Created by cui on 11/11/16.
 */

import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';

export default class CustomImageView extends Component {
  constructor(props) {
    super(props);
    this.state = {loaded: false, loadEnd: false};
  }

  static propTypes = {
    imageUrl: React.PropTypes.string,
    imageStyle: React.PropTypes.object
  };

  static defaultProps = {
    formHorizontal: false,
    imageStyle: {
      resizeMode: 'contain',
      height: 60,
      width: 60,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    }
  };

  render () {
    return (
      (!this.state.loaded && this.state.loadEnd)?this._renderLoadFailImage() : (<Image
        style={this.props.imageStyle}
        source={{uri: this.props.imageUrl,isStatic: true}}
        // onLoadStart={() => {
        //   this.setState({loaded: false, loadEnd: false});
        // }}
        onLoad={() => {
          this.setState({loaded: true});
        }}
        onLoadEnd={() => {
          this.setState({loadEnd: true});
        }}
      >
        {this._renderActivityIndicator()}
      </Image>)
    );
  }
  _renderLoadFailImage(){
    return(
      <Image style={this.props.imageStyle} source={require('../../image/attachments/attachment_fialure.png')} />
    )
  }
  _renderActivityIndicator () {
    if (!this.state.loadEnd) {
      return <ActivityIndicator
        style={{
          height: 36,
          flex: 1,
          alignSelf: 'stretch'
        }}
        color="#CF5656"
      />;
    } else {
      return null;
    }
  }
}