/**
 * Created by cui on 11/9/16.
 */

import React from 'react';
import {
    Platform,
    TouchableOpacity,
    PermissionsAndroid,
    InteractionManager,
    View
} from 'react-native';
import ActionSheet from 'react-native-actionsheet'
import RNThumbnail from 'react-native-thumbnail';
import ImagePicker from 'react-native-image-picker';
const haveLocation = false;

//获取定位权限
async function requestLocationPermission () {
    try {
        const granted = await PermissionsAndroid.requestPermission(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: '请打开应用定位权限',
                message: '为了提高定位的准确度，更好的为您服务，请打开GPS',
                buttonNeutral: '下次再说',
                buttonNegative: '取消',
                buttonPositive: '确定'
            }
        );
        return granted;
    } catch (err) {
        alert(err);
    }
}
//GPS地址解析
function getGeocodeData (location) {
    var url = `http://restapi.amap.com/v3/geocode/regeo?key=0137539e4bda0ce86ad9a4ad0cd98711&location=${location.longitude},${location.latitude}&radius=1000&extensions=all&batch=false&roadlevel=0`;
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: ``
        }).then((response) => response.json()).then((responseData) => {
            // alert(responseData.regeocode.formatted_address)
            resolve(responseData);
        }).catch((error) => {
            reject(error)
        }).done()
    })
}

class ImagePickerView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {options: ['拍照', '相册', '取消']};
        this._onPressSheet = this._onPressSheet.bind(this)
    }
    static propTypes = {
        type: React.PropTypes.oneOf(['all', 'library', 'camera']), // 全部 | 仅图库 | 仅拍照 
        mediaType: React.PropTypes.oneOf(['photo', 'video', 'mixed']),
        onSelected: React.PropTypes.func.isRequired,
        allowsEditing: React.PropTypes.bool,
        onError: React.PropTypes.func,
        fileId: React.PropTypes.string,
        title: React.PropTypes.string,
        maxWidth: React.PropTypes.number,
        maxHeight: React.PropTypes.number,
        aspectX: React.PropTypes.number,
        aspectY: React.PropTypes.number,
        longPress: React.PropTypes.func,
    };

    static defaultProps = {
        type: 'all',
        mediaType: 'photo',
        allowsEditing: false,
        title: '',
        maxWidth: Platform.OS === 'android' ? 1920 : 1920,
        maxHeight: Platform.OS === 'android' ? 1280 : 1280,
    };
    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.loadOptions();
        });
    }
    loadOptions(){
        var options = [];
        if (this.props.type === 'all') {
            if (this.props.mediaType === 'mixed') {
                options = ['拍照', '录像', '图库'];
            } else {
                options = [this.props.mediaType === 'photo' ? '拍照' : '录像', '图库'];
            }
        } else {
            options = [(this.props.type === 'library' ? '图库' : (this.props.mediaType === 'photo' ? '拍照' : '录像'))];
        }
        options.push('取消')
        this.setState({options: options});
    }
    showImagePicker = () => {
        this.ActionSheet.show();
    };
    //判断是否有GPS信息
    judgeGPSMessage (response) {
        if (!haveLocation) {
            this.loadResponseImage(response);
            return;
        }
        if (response.latitude && response.longitude) {
            getGeocodeData({longitude: response.longitude, latitude: response.latitude}).then((data) => {
                response.address = data.regeocode.formatted_address
                this.loadResponseImage(response);
            }).catch((err) => {
                this.loadResponseImage(response);
            })
        } else if (response.launch == 'Camera') {
            if (Platform.OS === 'ios') {
                this.onPressLocition().then((data) => {
                    response.address = data.regeocode.formatted_address
                    this.loadResponseImage(response);
                }).catch((error) => {
                    this.loadResponseImage(response);
                });
            } else {
                //获取定位权限
                requestLocationPermission().then((result) => {
                    if (result === true) {
                        this.onPressLocition().then((data) => {
                            response.address = data.regeocode.formatted_address
                            this.loadResponseImage(response);
                        }).catch((error) => {
                            this.loadResponseImage(response);
                        });
                    } else {
                        this.loadResponseImage(response);
                    }
                })
            }
        } else {
            this.loadResponseImage(response);
        }
    }
    loadResponseImage (response) {
        if (response.timestamp) {
            response.timestamp = this.timestampToLocalTime(response.timestamp);
        }
        var fileType = '';
        if (Platform.OS === 'ios') {
            fileType = response.uri.split('.').pop();
        } else {
            fileType = response.path.split('.').pop();
        }
        response.fileType = fileType;
        if (response.fileSize) { // only photo have fileSize
            if (this.props.onSelected) {
                this.props.onSelected(response);
            }
        } else {
            RNThumbnail.get(Platform.OS === 'ios' ? response.uri : response.path).then((result) => {
                response.imgPath = result.path;
                if (this.props.onSelected) {
                    this.props.onSelected(response);
                }
            });
        }
    }
    timestampToLocalTime (date) {
        var newDate = new Date(date).toJSON();
        return new Date(+new Date(newDate) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '');
    }
    //定位函数
    onPressLocition () {
        //获取经纬度
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                location => {
                    // console.log(result);
                    getGeocodeData({longitude: location.coords.longitude, latitude: location.coords.latitude}).then((data) => {
                        resolve(data)
                    }).catch((err) => {
                        reject(err)
                    })
                },
                error => {
                    alert("获取位置失败：" + error)
                    reject(error)
                }
            );
        });
    }
    
    _onPressSheet (index) {
        let options = {
            title: this.props.title, // specify null or empty string to remove the title
            cameraType: 'back', // 'front' or 'back'
            mediaType: this.props.mediaType, // 'photo'|'video'|'mixed'
            maxWidth: this.props.maxWidth, // photos only
            maxHeight: this.props.maxHeight, // photos only
            quality: 1.0, // photos only
            videoQuality: 'high', //'low', 'medium', or 'high' on iOS, 'low' or 'high' on Android
            durationLimit: 30, //Max video recording time, in seconds
            rotation: 0,//Photos only, 0 to 360 degrees of rotation, in the only android
            allowsEditing: this.props.allowsEditing, // Built in iOS functionality to resize/reposition the image
            noData: true, // photos only - disables the base64 `data` field from being generated (greatly improves performance on large photos)
            storageOptions: {
                /* If this key is provided, the image will get saved in the Documents directory on iOS,
                 and the Pictures directory on Android (rather than a temporary directory)*/
                skipBackup: true, // If true, the photo will NOT be backed up to iCloud
                path: 'Cache', // If set, will save image at /Documents/[path] rather than the root
                cameraRoll: true, // If true, the cropped photo will be saved to the iOS Camera Roll.
                waitUntilSaved: true //If true, will delay the response callback until after the photo/video was saved to the Camera Roll.
            },
            language: 'Chinese'
        };
        switch (this.state.options[index]) {
            case '录像':
                if (Platform.OS !== 'ios') {
                    options.mediaType = 'video'
                }
            case '拍照':
                ImagePicker.launchCamera(options, (response) => {
                    if (response.didCancel) {
                    } else if (response.error) {
                    } else if (response.customButton) {
                    } else {
                        response.launch = 'Camera';
                        this.judgeGPSMessage(response)
                    }
                })
                break;
            case '图库':
                ImagePicker.launchImageLibrary(options, (response) => {
                    if (response.didCancel) {
                    } else if (response.error) {
                    } else if (response.customButton) {
                    } else {
                        response.launch = 'Library';
                        this.judgeGPSMessage(response)
                    }
                })
                break;
            default:
                break;
        }
    }
    render () {
        return (
            <View>
                <TouchableOpacity
                    onLongPress={this.props.longPress}
                    style={this.props.style}
                    onPress={() => this.showImagePicker()}
                >
                    {this.props.children}
                </TouchableOpacity>
                <ActionSheet
                    ref={o => this.ActionSheet = o}
                    title={this.props.title}
                    options={this.state.options}
                    cancelButtonIndex={this.state.options.length - 1}
                    // destructiveButtonIndex={1}
                    onPress={(index) => {this._onPressSheet(index)}}
                />
            </View>
        );
    }
}

export default ImagePickerView;
