/**
 * Created by admin on 2018/7/17.
 */

import React from 'react';
import {
    View,
    Text,
    InteractionManager,
    StyleSheet,
    ProgressBarAndroid,
    ProgressViewIOS,
    Dimensions,
    Image,
} from 'react-native';

import NavigationBar from '../../components/navigator/NavBarView';
import FSManager from '../../modules/fsManager';
import CommonButtons from './commonButtons';
import CommonFunc from './commonFunc';
const {
    FS_NONE,
    FS_DOWNLOADING,
    FS_EXISTS,
    EVENT_FILE_DOWNLOAD_SUCCESS,
    EVENT_FILE_DOWNLOAD_PROGRESS,
} = FSManager;
const WINDOW_WIDTH = Dimensions.get('window').width;
const totalLength = WINDOW_WIDTH * 0.85;

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

export default class DownloadPage extends React.Component {
    constructor(props) {
        super(props);
        this._beginDownload = this._beginDownload.bind(this);
        this._openFile = this._openFile.bind(this);
        this._getFileName = this._getFileName.bind(this);
        this._handleFileDownloadInfo = this._handleFileDownloadInfo.bind(this);
        this._addDownloadInfo = this._addDownloadInfo.bind(this);
        this._renderFileSize = this._renderFileSize.bind(this);
        this._progressChangeListener = this._progressChangeListener.bind(this);
        this._downloadSuccessListener = this._downloadSuccessListener.bind(this);
        this._handleFileDownloadInfo();
        this.state = {
            fileStateUpdateIndex: 0,
        };
    }

    _handleFileDownloadInfo() {
        const downloadParam = this.props.param.downloadParam || {};
        this.fileId = downloadParam.fileId || '';
        this.fileName = downloadParam.fileName;
        this.fileSize = downloadParam.fileSize;
    }

    _addDownloadInfo() {
        FSManager.addToFileState({
            fileId: this.fileId,
            fileSize: this.fileSize,
        });
    }

    componentDidMount() {
        // this._addDownloadInfo();
        CommonFunc.addListenerAndType(this._progressChangeListener, EVENT_FILE_DOWNLOAD_PROGRESS);
        CommonFunc.addListenerAndType(this._downloadSuccessListener, EVENT_FILE_DOWNLOAD_SUCCESS);
    }

    componentWillUnmount() {
        CommonFunc.removeListenerAndType(this._progressChangeListener, EVENT_FILE_DOWNLOAD_PROGRESS);
        CommonFunc.removeListenerAndType(this._downloadSuccessListener, EVENT_FILE_DOWNLOAD_SUCCESS);
    }

    _progressChangeListener(progressInfo) {
        this.setState({fileStateUpdateIndex: this.state.fileStateUpdateIndex + 1});
    }

    _downloadSuccessListener(progressInfo) {
        this.setState({fileStateUpdateIndex: this.state.fileStateUpdateIndex + 1});
    }

    _beginDownload() {
        FSManager.downloadOrOpenFile(this.fileId, this.fileSize, this.fileName);
    }

    _openFile() {
        FSManager.downloadOrOpenFile(this.fileId, this.fileSize, this.fileName);
    }

    _renderTypedImg(fileName = '') {
        const lastDotIdx = fileName.lastIndexOf('.');
        const extName = lastDotIdx > -1 ? fileName.substr(lastDotIdx).toLowerCase() : 'unknown';
        switch (extName) {
            case '.doc':
            case '.docx':
                return <Image style={styles.staticImg}
                              source={require('../../image/attachments/attachment_word.png')}/>;
                break;
            case '.xls':
            case '.xlsx':
                return <Image style={styles.staticImg}
                              source={require('../../image/attachments/attachment_excel.png')}/>;
                break;
            case '.ppt':
            case '.pptx':
                return <Image style={styles.staticImg} source={require('../../image/attachments/attachment_ppt.png')}/>;
                break;
            case '.pdf':
                return <Image style={styles.staticImg} source={require('../../image/attachments/attachment_pdf.png')}/>;
                break;
            case 'unknown':
            default:
                return <Image style={styles.staticImg}
                              source={require('../../image/attachments/attachment_unknown.png')}/>;
                break;
        }
    }

    _getFileName() {
        const downloadParam = this.props.param.downloadParam || {};
        const fileName = downloadParam.fileName || '文件预览';
        return fileName;
    }

    _getFileState() {
        const fileId = this.props.param.downloadParam.fileId;
        const fs = FSManager.getFileStateByFileId(fileId);
        return fs;
    }

    _renderProgressLine(total, cur) {
        const progressWidth = totalLength * cur / total;
        return (
            <View
                style={{
                    width: totalLength,
                    backgroundColor: '#DDDCDF',
                    height: 5,
                    alignItems: 'flex-start',
                    marginTop: 20,
                }}
            >
                <View
                    style={{width: progressWidth, backgroundColor: '#9bDB3B', height: 5,}}
                />
            </View>);
    }

    _renderDownloadButtons() {
        const fs = this._getFileState();
        const downloading = FS_DOWNLOADING == fs, exists = FS_EXISTS == fs;
        let btns = [{text: '下载', onPress: this._beginDownload}];
        const showBtn = exists || !downloading;
        if (exists) {
            btns = [{text: '打开', onPress: this._openFile}];
        }
        if (downloading) {
            const fileSize = parseInt(this.fileSize);
            const curLength = FSManager.getFileDownloadProgress(this.fileId);
            return this._renderProgressLine(fileSize, curLength);
        }
        return (
            <CommonButtons
                containerStyle={{backgroundColor: 'transparent', marginTop: 20,}}
                buttons={btns}
                show={showBtn}
            />
        );
    }


    _renderFileSize() {
        const readableSize = FSManager.getReadableFileSize(this.fileSize);
        return (
            <Text>{readableSize}</Text>
        );
    }

    render() {
        const fileName = this._getFileName();
        return (
            <NavigationBar
                title={'附件下载'}
                navigator={this.props.navigator}
                goBack={true}
            >
                <View
                    style={{
                        paddingTop: 30,
                        alignItems: 'center',
                    }}
                >
                    {this._renderTypedImg(fileName)}
                    <Text
                        style={{marginVertical: 10, textAlign: 'center',}}
                    >{fileName}</Text>
                    {this._renderFileSize()}
                    {this._renderDownloadButtons()}
                </View>
            </NavigationBar>
        );
    }
}