import React, {Component} from 'react';
import {
    View,
    Text,
    ListView,
    Image,
    Alert,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    InteractionManager,
    Platform,
    StyleSheet,
} from 'react-native';

import NavigationBar from '../../components/navigator/NavBarView';
import RNButton from '../../components/rnButton/rnButton';
import Icon from 'react-native-vector-icons/Ionicons';
import FlowAction from '../../actions/FlowActions';
import AttachmentUploadPage from './attachmentUploadPage';
import AttachmentDetailPage from './attachmentDetailPage';
import CommonLink from '../../modules/CommonLink';
import EmptyData from '../../components/emptyData/emptyData';
import ProgressView from '../../components/progressView/ProgressView';
import CommonStyle from '../../modules/CommonStyle';
import CommonFunc from '../commonStyle/commonFunc';
import CommonButtons from '../commonStyle/commonButtons';

const WINDOW_WIDTH = Dimensions.get('window').width;
import FSManager from '../../modules/fsManager';
import DownloadPage from '../commonStyle/downloadPage';
import CustomImageView from './CustomImageView';

const {
    FS_NONE,
    FS_DOWNLOADING,
    FS_EXISTS,
    EVENT_FILE_DOWNLOAD_SUCCESS,
    EVENT_FILE_DOWNLOAD_PROGRESS,
} = FSManager;

const styles = StyleSheet.create({
    progressStyle: {
        borderWidth: 0.5,
        borderColor: 'transparent',
        width: 50,
        height: 35,
        borderRadius: 5,
        backgroundColor: '#82DB47',
        justifyContent: 'center',
        alignItems: 'center',
    },
    staticImg: {
        resizeMode: 'stretch', height: 60, width: 60, backgroundColor: 'transparent',
        alignItems: 'center', justifyContent: 'center', borderRadius: 5
    },
    img: {
        resizeMode: 'contain', height: 60, width: 60, backgroundColor: 'transparent',
        alignItems: 'center', justifyContent: 'center', borderRadius: 5
    },
});

export default class AttachmentListPage extends Component {
    constructor(props) {
        super(props);
        this._toPage = this._toPage.bind(this);
        this._emptyData = this._emptyData.bind(this);
        this._renderRow = this._renderRow.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._renderBarRightBtn = this._renderBarRightBtn.bind(this);
        this._attachmentUploadCallback = this._attachmentUploadCallback.bind(this);
        this._progressChangeListener = this._progressChangeListener.bind(this);
        this._downloadSuccessListener = this._downloadSuccessListener.bind(this);
        this._reloadData = this._reloadData.bind(this);
        this._renderImageIndicator = this._renderImageIndicator.bind(this);
        this._onLoadImgStateChange = this._onLoadImgStateChange.bind(this);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            testTitle: '附件信息',
            attachments: [],
            fileStateUpdateIndex: 0,
            loadImgCount: 0,
        };
        this.attachmentState = {};
    }

    componentDidMount () {
        this._fetchData();
        CommonFunc.addListenerAndType(this._reloadData, 'reloadAttachmentList');
        CommonFunc.addListenerAndType(this._progressChangeListener, EVENT_FILE_DOWNLOAD_PROGRESS);
        CommonFunc.addListenerAndType(this._downloadSuccessListener, EVENT_FILE_DOWNLOAD_SUCCESS);
    }

    componentWillUnmount () {
        CommonFunc.removeListenerAndType(this._reloadData, 'reloadAttachmentList');
        CommonFunc.removeListenerAndType(this._progressChangeListener, EVENT_FILE_DOWNLOAD_PROGRESS);
        CommonFunc.removeListenerAndType(this._downloadSuccessListener, EVENT_FILE_DOWNLOAD_SUCCESS);
    }

    _reloadData () {
        this._fetchData();
    }

    _progressChangeListener (progressInfo) {
        this.setState({fileStateUpdateIndex: this.state.fileStateUpdateIndex + 1});
    }

    _downloadSuccessListener (progressInfo) {
        this.setState({fileStateUpdateIndex: this.state.fileStateUpdateIndex + 1});
    }

    _getDiskFileList () {
        FSManager.fetchDiskFiles();
    }

    _fetchData () {
        InteractionManager.runAfterInteractions(() => {
            FlowAction.getAllAttachmentUploadData({
                objectNo: this.props.param.objectNo,
                pageIndex: this.pageIndex || 1,
            }, (response) => {
                let body = response.datas || [];
                const attachments = this._handleAttachmentList(body);
                this.setState({
                    attachments: attachments,
                });
                this._getDiskFileList();
            }, (error) => {
                CommonFunc.alert(error);
            });
        });
    }

    _handleAttachmentList (originalDatas) {
        const ret = [];
        const listDatas = CommonFunc.handleListDatas(originalDatas);
        listDatas.forEach(item => {
            const fileList = CommonFunc.getValueByKeyArr(item.listData, ['filelist', 'value']) || '{}';
            const fileJson = JSON.parse(fileList);
            for (let key in fileJson) {
                const fileObj = fileJson[key];
                let index = fileObj.filename.lastIndexOf(".");
                //获取后缀 
                var ext = fileObj.filename.substr(index+1);
                if (this.isImage(ext)) {
                    fileObj.fileType = 'image';
                } else {
                    fileObj.fileType = 'file';
                }
                ret.push(fileObj);
            }
        });
        return ret;
    }
    isImage (ext) {
        return ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'].indexOf(ext.toLowerCase()) !== -1;
    }

    _toPage (route, argument) {
        this.props.navigator.push({
            id: '' + route,
            comp: route,
            param: argument
        }
        )
    }
    _onLoadImgStateChange () {
        const nextCount = this.state.loadImgCount + 1;
        this.setState({loadImgCount: nextCount});
    }

    _renderImageIndicator (rowData) {
        return (
            <CustomImageView
                imageUrl={this._getFileDownloadUrl(rowData)}
                imageStyle={styles.img}
            />
        )
    }

    _renderImage (rowData, sectionID, rowID) {
        return (
            <TouchableOpacity
                onPress={() => this._toPage(AttachmentDetailPage, rowData)}
            >
                <View
                    style={
                        {
                            minHeight: 80,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            paddingHorizontal: 15,
                            paddingVertical: 10,
                            borderBottomWidth: 1,
                            borderColor: '#e7e7e7'
                        }
                    }
                >
                    {this._renderImageIndicator(rowData)}
                    <View style={{marginHorizontal: 10, flex: 1, justifyContent: 'space-between'}}>

                        <Text
                            style={{fontSize: 13, color: '#3877bc', }}
                            ellipsizeMode="tail"
                        >
                            {rowData.filename}
                        </Text>
                        <Text style={{marginVertical: 10}}>
                            {this._renderFileSize(rowData.FileSize)}
                        </Text>
                        {this._showOtherTextAndTips('拍摄地址', rowData.address)}
                        {this._showOtherTextAndTips('拍摄时间', rowData.timestamp)}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    _showOtherTextAndTips (tips, text) {
        if (text !== 'false' && text != undefined) {
            return (
                <Text style={{fontSize: 13}}>
                    {tips}:{text}
                </Text>
            )
        }
        return;
    }
    _getDownloadParams (fileInfo) {
        const fileId = fileInfo.id;
        const fileName = fileInfo.filename;
        const fileSize = fileInfo.FileSize;
        return {
            fileId: fileId,
            fileName: fileName,
            fileSize: fileSize
        };
    }

    _toDownloadPage (downloadParam) {
        this.props.navigator.push({
            id: 'DownloadPage',
            comp: DownloadPage,
            param: {
                downloadParam: downloadParam,
            }
        });
    }

    _downloadFile (rowData) {
        const downloadParam = this._getDownloadParams(rowData);
        const fileId = downloadParam.fileId;
        const fileSize = downloadParam.fileSize;
        const fileName = downloadParam.fileName;
        if (false) {//浏览器下载
            CommonFunc.downloadFile(fileId);
        }
        if (true) {//下载页面下载
            this._toDownloadPage(downloadParam);
        }
        if (false) {//应用哪下载
            FSManager.downloadOrOpenFile(downloadParam.fileId, downloadParam.fileSize, downloadParam.fileName);
        }
    }

    _renderTypedImg (fileName = '') {
        const lastDotIdx = fileName.lastIndexOf('.');
        const extName = lastDotIdx > -1 ? fileName.substr(lastDotIdx).toLowerCase() : 'unknown';
        switch (extName) {
            case '.doc':
            case '.docx':
                return <Image style={styles.staticImg}
                    source={require('../../image/attachments/attachment_word.png')} />;
                break;
            case '.xls':
            case '.xlsx':
                return <Image style={styles.staticImg}
                    source={require('../../image/attachments/attachment_excel.png')} />;
                break;
            case '.ppt':
            case '.pptx':
                return <Image style={styles.staticImg} source={require('../../image/attachments/attachment_ppt.png')} />;
                break;
            case '.pdf':
                return <Image style={styles.staticImg} source={require('../../image/attachments/attachment_pdf.png')} />;
                break;
            case 'unknown':
            default:
                return <Image style={styles.staticImg}
                    source={require('../../image/attachments/attachment_unknown.png')} />;
                break;
        }
    }

    _renderFile (rowData, sectionID, rowID) {
        const fileName = rowData.filename || '';
        const fileId = rowData.id;
        const fs = FSManager.getFileStateByFileId(fileId);
        const fileExist = fs == FS_EXISTS;
        const fileNameColor = fileExist ? '#82DB47' : '#3877bc';
        return (
            <View
                style={{
                    minHeight: 80, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
                    paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#e7e7e7'
                }}
            >
                {this._renderTypedImg(fileName)}
                <View style={{marginHorizontal: 10, flex: 1, justifyContent: 'space-between'}}>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => this._downloadFile(rowData)}
                    >
                        <Text
                            style={{fontSize: 13, color: fileNameColor, }}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {fileName}
                        </Text>
                    </TouchableOpacity>
                    <Text
                        style={{marginVertical: 10, }}
                    >
                        {this._renderFileSize(rowData.FileSize)}
                    </Text>
                    {this._showOtherTextAndTips('拍摄地址', rowData.address)}
                    {this._showOtherTextAndTips('拍摄时间', rowData.timestamp)}
                </View>
            </View>
        );
    }

    _renderFileSize (bytes) {
        return FSManager.getReadableFileSize(bytes);
    }

    _getFileDownloadUrl (rowData) {
        let fileUrl = CommonLink.downloadAttachment(rowData.id);
        fileUrl = encodeURI(fileUrl);
        return fileUrl;
    }

    _renderRow (rowData, sectionID, rowID) {
        let result = null;
        switch (rowData.fileType) {
            case 'image':
                result = this._renderImage(rowData, sectionID, rowID);
                break;
            case 'file':
                result = this._renderFile(rowData, sectionID, rowID);
                break;
        }
        return result;
    }

    _emptyData () {
        const showEmpty = this.state.attachments.length <= 0;
        const marginTop = this.props.asInnerPage ? 5 : 0;
        if (showEmpty) {
            return (
                <View style={{flex: 1, justifyContent: 'space-between'}}>
                    <EmptyData
                        style={[{flex: 1, backgroundColor: '#F0F0F0', }, CommonStyle.backgroundColor]}
                        refreshStyle={{
                            borderColor: '#F4F4F4', height: 30, marginTop: 20,
                            borderWidth: 1, borderRadius: 5
                        }}
                        title="暂无附件信息"
                        textStyle={{fontSize: 14, height: 30, marginTop: 10}}
                        onPress={() => this._fetchData()}
                    />
                </View>
            );
        }
        return (
            <View style={{flex: 1, backgroundColor: '#e7e7e7', marginTop: marginTop}}>
                <ListView
                    style={[{backgroundColor: '#e7e7e7', flex: 1, }, CommonStyle.backgroundColor]}
                    dataSource={this.ds.cloneWithRows(this.state.attachments)}
                    renderRow={this._renderRow}
                    automaticallyAdjustContentInsets={false}
                    enableEmptySections={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }

    _attachmentUploadCallback () {
        this.setState({attachments: []});
        this._fetchData();
    }

    _toUploadPage () {
        const param = {
            callback: this._attachmentUploadCallback,
            ...this.props.param,
        };
        this._toPage(AttachmentUploadPage, param);
    }

    _renderBarRightBtn () {
        return (
            <TouchableOpacity
                style={{alignItems: 'flex-end'}}
                onPress={() => this._toUploadPage()}
            >
                <Icon
                    name="md-add"
                    size={25}
                    color="#F5F5F5"
                    style={{
                        height: 30,
                        width: 30,
                    }}
                />
            </TouchableOpacity>
        );
    }

    render () {
        if (this.props.asInnerPage) {
            return this._emptyData();
        } else {
            return (
                <View style={{flex: 1, }}>
                    <NavigationBar
                        navigator={this.props.navigator}
                        title={this.state.testTitle}
                        goBack={true}
                        contentMarginBottom={24}
                    >
                        {this._emptyData()}
                    </NavigationBar>
                </View>
            );
        }
    }
}