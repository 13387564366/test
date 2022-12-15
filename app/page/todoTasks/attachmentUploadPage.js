/**
 * Created by cui on 11/9/16.
 */

import React, {Component} from 'react';
import {
    View,
    Text,
    Dimensions,
    ListView,
    Alert,
    InteractionManager,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator
} from 'react-native';

import NavigationBar from '../../components/navigator/NavBarView';
import CountTextInputNew from '../../components/counTextInput/countTextInputNew';
import ImagePikerGridView from '../../components/imagePicker/imagePikerGridView';
import FlowAction from '../../actions/FlowActions';
import RadioForm  from 'react-native-simple-radio-button';
import RNButton from '../../components/rnButton/rnButton';
import CommonStyle from '../../modules/CommonStyle';
import CommonFunc from '../commonStyle/commonFunc';

const WINDOW_WIDTH = Dimensions.get('window').width;

export default class AttachmentUploadPage extends React.Component {

    constructor(props) {
        super(props);
        this._uploadImage = this._uploadImage.bind(this);
        this._renderContent = this._renderContent.bind(this);
        this._saveAndPop = this._saveAndPop.bind(this);
        this._renderAttachmentTypes = this._renderAttachmentTypes.bind(this);
        this._notifyChange = this._notifyChange.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            attachUploadType: '',
            attachUploadRemark: '',
            imageSourceArr: new Array(),
            attachmentTypeArr: []
        };
    }

    componentDidMount() {
        // this._fetchData();
    }

    _fetchData() {
        InteractionManager.runAfterInteractions(() => {
            FlowAction.getAttachmentUploadData({}, (response) => {
                const body = response.data || [];
                this.setState({
                    attachmentTypeArr: body
                });
            }, (error) => {
                Alert.alert(
                    '提示',
                    error,
                    [{text: '确定'}]
                );
            });
        });
    }

    _saveAndPop() {
        this._uploadImage();
    }

    _alert(msg) {
        Alert.alert(
            '提示',
            msg,
            [{text: '确定'}]
        );
    }

    _isAttachmentChecked() {
        let ret = true;
        if (false) {//暂时不需要
            if (!this.state.attachUploadType) {
                this._alert('请选择上传附件类型');
                ret = false;
                return ret;
            }
            let mark = this.state.attachUploadRemark || '';
            mark = mark.replace(/(^\s*)|(\s*$)/g, "");
            if (!mark) {
                ret = false;
                this._alert('请填写有效的描述信息');
                return ret;
            }
        }
        if (this.state.imageSourceArr.length <= 0) {
            this._alert('请选择上传的附件图片');
            ret = false;
            return ret;
        }
        return ret;
    }

    _notifyChange() {
        CommonFunc.dispatchActionType('reloadAttachmentList');
    }

    _uploadImage() {
        if (this._isAttachmentChecked()) {
            InteractionManager.runAfterInteractions(() => {
                FlowAction.uploadImage({
                    file: Object.assign([], this.state.imageSourceArr),
                    fileSize: this.state.imageSourceArr.length || 0,
                    remark: this.state.attachUploadRemark || ' ',
                    atttype: this.state.attachUploadType,
                    objectNo: this.props.param.objectNo,
                    serialNo: this.props.param.serialNo,
                }, (response) => {
                    const {navigator} = this.props;
                    if (navigator) {
                        navigator.pop();
                    }
                    this._notifyChange();
                }, (error) => {
                    Alert.alert(
                        '提示',
                        error,
                        [{text: '确定'}]
                    );
                });

            });
        }
    }

    _renderAttachmentTypes() {
        return null;
        return (
            <View style={{backgroundColor: 'white'}}>
                <View style={[{backgroundColor: '#EDECF2', paddingHorizontal: 14,}, CommonStyle.backgroundColor]}>
                    <Text style={{fontSize: 16, color: '#222', marginTop: 14, marginBottom: 8,}}>附件类型</Text>
                </View>
                <RadioForm
                    ref="RadioForm"
                    style={{marginLeft: 10, paddingVertical: 5,}}
                    labelStyle={{marginRight: 15}}
                    radio_props={radioArr}
                    initial={null}
                    formHorizontal={false}
                    buttonColor={'#3877bc'}
                    buttonSize={8}
                    labelColor={'gray'}
                    labelSize={50}
                    animation={false}
                    onPress={(value) => {
                        this.setState({attachUploadType: value})
                    }}
                />
            </View>

        );
    }

    _renderContent() {
        const radioArr = new Array();
        this.state.attachmentTypeArr.map((item, i) => {
            radioArr.push({label: item.display, value: item.code});
        });
        return (
            <ScrollView style={[{backgroundColor: '#e7e7e7', flex: 1}, CommonStyle.backgroundColor]}>
                {this._renderAttachmentTypes()}
                <View style={{backgroundColor: 'white'}}>
                    <View style={[{backgroundColor: '#EDECF2', paddingHorizontal: 14,}, CommonStyle.backgroundColor]}>
                        <Text style={{fontSize: 16, color: '#222', marginTop: 14, marginBottom: 8,}}>图片描述</Text>
                    </View>
                    <View style={{backgroundColor: 'white', paddingHorizontal: 14,}}>
                        <CountTextInputNew
                            callback={(text) => this.setState({attachUploadRemark: text,})}
                            stateCallback={() => {
                            }}
                            placeholder="说明信息..."
                        />
                    </View>
                </View>
                <View style={{backgroundColor: 'white'}}>
                    <View style={[{backgroundColor: '#EDECF2', paddingHorizontal: 14,}, CommonStyle.backgroundColor]}>
                        <Text style={{fontSize: 16, color: '#222', marginTop: 14, marginBottom: 8,}}>上传照片</Text>
                    </View>
                    <ImagePikerGridView
                        maxLength={5}
                        addSelected={(obj) => {
                        }}
                        onSelected={(array) => {
                            this.setState({imageSourceArr: array});
                        }}
                        deleteSelected={(array) => this.setState({imageSourceArr: array})}
                    />
                    <Text style={{fontSize: 12, color: 'gray', margin: 10}}>
                        {'请上传照片,最多5张,每张不超过5M,支持jpg,jpeg格式'}
                    </Text>
                </View>
            </ScrollView>
        );
    }

    render() {
        return (
            <NavigationBar
                navigator={this.props.navigator}
                title="附件上传"
                goBack={true}
                contentMarginBottom={24}
            >
                {this._renderContent()}
                <View
                    style={[{
                        backgroundColor: 'white', width: WINDOW_WIDTH, padding: 8,
                        flexDirection: 'row', alignItems: 'center',
                        justifyContent: 'space-around'
                    }, CommonStyle.backgroundColor]}
                >
                    <RNButton
                        style={{
                            width: (WINDOW_WIDTH - 20), height: 30, backgroundColor: '#3877bc',
                            borderRadius: 5
                        }}
                        textStyle={{color: 'white'}}
                        title="保存并返回"
                        onPress={() => this._saveAndPop()}
                    />
                </View>
            </NavigationBar>
        );
    }
}