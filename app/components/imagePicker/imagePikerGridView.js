/**
 * Created by cui on 11/17/16.
 */

import React, {Component, PropTypes} from 'react';
import {
    View,
    Text,
    Image,
    ListView,
    Dimensions,
    TouchableOpacity
} from 'react-native';

import ImagePickerView from './imagePickerView';
import Icon from 'react-native-vector-icons/Ionicons';

const WINDOW_WIDTH = Dimensions.get('window').width;
const IMAGE_ITEM_WIDTH = ( WINDOW_WIDTH - 80 ) / 5;

class ImagePikerGridView extends Component {
    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            imageSource: {},
            imageSourceArr: ['+'],
            imageState: 'unSelect',
        }
    }

    static propsTypes = {
        maxLength: PropTypes.number,
        onSelected: PropTypes.func,
        deleteSelected: PropTypes.func,
        addSelected: PropTypes.func
    };

    static defaultProps = {
        maxLength: 5
    };

    _onSelected = (obj) => {
        if (this.props.addSelected) {
            this.props.addSelected(obj);
        }

        const objTemp = Object.assign({}, obj, {imageState: 'loadSuccess'});
        const selectArr = this.state.imageSourceArr;
        const insertAt = this.state.imageSourceArr.length - 1;
        selectArr.splice(insertAt, 0, objTemp);
        if (selectArr.length > this.props.maxLength) {
            selectArr.pop();
        }

        this.setState({imageSourceArr: selectArr});

        if (this.props.onSelected) {
            const outputArr = selectArr.slice(0);
            if (outputArr[outputArr.length - 1] === '+') {
                outputArr.pop();
            }
            this.props.onSelected(outputArr);
        }
    };

    _deleteSelected = (index) => {
        const selectArr = this.state.imageSourceArr;
        selectArr.splice(index, 1);
        const addIndex = selectArr.length;
        if (selectArr.length < this.props.maxLength && selectArr[addIndex - 1] !== '+') {
            selectArr.push('+');
        }

        this.setState({imageSourceArr: selectArr});

        if (this.props.deleteSelected) {
            const outputArr = selectArr.slice(0);
            if (outputArr[outputArr.length - 1] === '+') {
                outputArr.pop();
            }
            this.props.deleteSelected(outputArr);
        }
    };

    _renderImageStateMark = (imageState) => {
        switch (imageState) {
            case 'unSelect':
                return <Icon name={'md-add'} size={35} color="#a4a4a4"/>;
            case 'loading':
                return <ActivityIndicator style={{height: 36, alignSelf: 'stretch'}} color="#3877bc"/>;
            case 'loadSuccess':
                return null;
            case 'loadFail':
                return <Icon name={'md-close'} size={35} color="red"/>;
            default:
                return <Icon name={'md-add'} size={35} color="#a4a4a4"/>;
        }
    };

    _renderRow = (rowData, sectionID, rowID) => {
        if (rowData === '+') {
            return (
                <ImagePickerView
                    key={rowID}
                    type="all"
                    mediaType="photo"
                    onSelected={(response) => this._onSelected(response)}
                    title="选择一张图片以上传"
                    allowsEditing={false}
                    style={{margin: 5}}
                >
                    <View style={{
                        width: IMAGE_ITEM_WIDTH, height: IMAGE_ITEM_WIDTH, borderWidth: 0.5,
                        borderColor: 'transparent'
                    }}>
                        <Image
                            resizeMethod={'resize'}
                            resizeMode={'contain'}
                            style={{width: IMAGE_ITEM_WIDTH, height: IMAGE_ITEM_WIDTH}}
                            source={require('./camera_add.png')}
                        />
                    </View>
                </ImagePickerView>
            );
        }
        let imageUri = (rowData.imgPath||rowData.uri);
        return (
            <View
                key={rowID}
            >
                <View style={{
                    width: IMAGE_ITEM_WIDTH, height: IMAGE_ITEM_WIDTH, borderWidth: 0.5,
                    borderColor: '#a4a4a4', margin: 5
                }}>
                    <Image
                        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
                        source={{uri: imageUri, isStatic: true}}
                    >
                        {this._renderImageStateMark(rowData.imageState)}
                    </Image>
                </View>
                <View style={{position: 'absolute', backgroundColor: 'transparent', top: -2, right: -2}}>
                    <TouchableOpacity onPress={() => this._deleteSelected(rowID)}>
                        <Icon
                            name={'md-close-circle'}
                            size={18}
                            color="#ee3539"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    render() {
        return (
            <ListView
                contentContainerStyle={{
                    alignItems: 'flex-start',
                    flexDirection: 'row',
                    flexWrap: 'wrap'
                }}
                style={{marginHorizontal: 10, marginTop: 15, width: WINDOW_WIDTH - 20}}
                dataSource={this.ds.cloneWithRows(this.state.imageSourceArr)}
                renderRow={this._renderRow}
            />
        );
    }
}

export default ImagePikerGridView;
