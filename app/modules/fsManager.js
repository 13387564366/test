/**
 * Created by admin on 2018/7/9.
 */

import {
    Platform,
    Linking,
    IntentAndroid,
    NativeModules,
} from 'react-native';

import RNFSDownloader from 'react-native-fs';
import MimeTypeUtils from './mimeTypeUtil/mimeTypeUtil';
import FileOpener from 'react-native-file-opener';
import CommonLink from './CommonLink';
import CommonFunc from '../page/commonStyle/commonFunc';
import FilePreviewer from 'react-native-doc-viewer';
const ApkUtils = NativeModules.ApkUtils;
// const path = require('path');

//文件状态
const FS_NONE = 0;//不存在
const FS_DOWNLOADING = 1;//下载中
const FS_EXISTS = 2;//已存在
const DS_SUCCESS_MSG = '下载完成!';
const DS_DOWNLOADING_MSG = '下载中...';
const DS_FAIL_MSG = '文件不存在，或链接失效！';
// 事件更新
const EVENT_FILE_DOWNLOAD_SUCCESS = 'EVENT_FILE_DOWNLOAD_SUCCESS';
const EVENT_FILE_DOWNLOAD_FAIL = 'EVENT_FILE_DOWNLOAD_FAIL';
const EVENT_FILE_DOWNLOAD_PROGRESS = 'EVENT_FILE_DOWNLOAD_PROGRESS';//进度更新
const EVENT_DISK_FILE_CHANGED = 'EVENT_DISK_FILE_CHANGED';//磁盘文件状态更新

//fileId--->downloadingInfo
const downloadingFiles = {};
const emptyFile = {};
const isIos = Platform.OS === 'ios';

const _getDownloadingItem = (fileId) => {
    return downloadingFiles[fileId] || emptyFile;
};

//fileId-->fileInfo
let existsFiles = {};
//清空磁盘文件记录
const __emptyDiskFiles = ()=> {
    existsFiles = {};
};

let fileState = {};

const _clearCachedDiskFiles = () => {
    existsFiles = {};
};

const _clearDownloadingFiles = () => {
    for (let key in downloadingFiles) {
        downloadingFiles[key] = null;
    }
};

const _clearAllDatas = () => {
    fileState = {};
    _clearDownloadingFiles();
    _clearCachedDiskFiles();

};

//fileInfo = {fileId: XXX, fileSize: xxx};
const _addToFileState = (fileInfo)=> {
    const fileId = fileInfo.fileId;
    const fileSize = fileInfo.fileSize;
    if (fileId && !fileState[fileId]) {
        fileState[fileId] = {
            fileSize: fileSize
        };
    }
};

const _modifyFileState = (stateInfo, toState)=> {
    const fileId = stateInfo.fileId;
    if (fileId) {
        const oldFileIdState = fileState[fileId];
        if (oldFileIdState) {
            let nextFileIdState = {};
            const fileSize = oldFileIdState.fileSize;
            switch (toState) {
                case FS_DOWNLOADING:
                    nextFileIdState = {
                        exists: false,
                        downloading: true,
                        bytesWritten: stateInfo.bytesWritten,
                    };
                    break;
                case FS_EXISTS:
                    nextFileIdState = {
                        exists: true,
                    };
                    _removeFromDownloadingFiles(fileId);
                    break;
                case FS_NONE:
                    nextFileIdState = {
                        exists: false,
                        downloading: false,
                    };
                    _removeFromDownloadingFiles(fileId);
                    break;
            }
            nextFileIdState.fileSize = fileSize;
            fileState[fileId] = nextFileIdState;
        }
    }
};

const _onFileDownloadSuccess = (fileId, downloadItem = null) => {
    // _removeFromDownloadingFiles(fileId);
    _modifyFileState({fileId: fileId,}, FS_EXISTS);
    if (downloadItem) {
        //todo: 暂时不提示下载完成提示，直接提示打开文件
        // const fileName = downloadItem.fileName;
        // const msg = '[' + fileName + '] ' + '下载完成！';
        // const openActionInfo = {text: '打开', onPress: ()=>_openFile({...downloadItem})};
        // CommonFunc.confirmMsg(msg, openActionInfo);
        const isDownloadApp = downloadItem.downloadAppFlag;
        if (isDownloadApp) {
            _updateApp(downloadItem);
        } else {
            _openFile(downloadItem);
        }
    }
    CommonFunc.dispatchActionType(EVENT_FILE_DOWNLOAD_SUCCESS, fileId);
};

const _onFileDownloadFail = (fileId) => {
    // _removeFromDownloadingFiles(fileId);
    _modifyFileState({fileId: fileId,}, FS_NONE);
    CommonFunc.alert(DS_FAIL_MSG);
    CommonFunc.dispatchActionType(EVENT_FILE_DOWNLOAD_FAIL, fileId);
};

const _onFileExist = (fileId,) => {
    // _removeFromDownloadingFiles(fileId);
    _modifyFileState({fileId: fileId,}, FS_EXISTS);
};

const _onFileDownloadProgress = (fileId, bytesWritten) => {
    const payload = {fileId: fileId, bytesWritten: bytesWritten};
    _modifyFileState(payload, FS_DOWNLOADING);
    CommonFunc.dispatchActionType(EVENT_FILE_DOWNLOAD_PROGRESS, payload);
};

const _onDiskFileChange = (diskFiles) => {
    for (let fileId in fileState) {
        const diskFileSize = diskFiles[fileId] && diskFiles[fileId].fileSize || 0;
        const fileSize = fileState[fileId].fileSize;
        if (fileSize == diskFileSize) {
            _onFileExist(fileId);
        } else {
            _modifyFileState({fileId: fileId}, FS_NONE);
        }
    }
    CommonFunc.dispatchActionType(EVENT_DISK_FILE_CHANGED, existsFiles);
};


//获取磁盘文件
const _fetchExistFiles = (fetchAll = true, downloadItem = null) => {
    if (fetchAll) {
        __emptyDiskFiles();
        const fileSavePath = _getFileSavePath();
        RNFSDownloader.readDir(fileSavePath).then((fileArr) => {
            let count = 0;
            fileArr.forEach(fileItem => {
                if (fileItem.isFile()) {
                    const diskFileName = fileItem.name;
                    const lastDotIndex = diskFileName.lastIndexOf('.');
                    const prefixEndIndex = lastDotIndex <= 0 ? diskFileName.length : lastDotIndex;
                    let fileId = diskFileName.substring(0, prefixEndIndex);
                    if (!fileId) {
                        fileId = diskFileName;
                    } else {
                        count++;
                    }
                    existsFiles[fileId] = {
                        fileName: diskFileName,
                        filePath: fileItem.path,
                        fileSize: fileItem.size,
                    }
                }
            });
            if (count > 0) {
                _onDiskFileChange(existsFiles);
            }
        }).catch((error) => {
        });
    } else {
        let downloadSuccess = false;
        const fileId = downloadItem.fileId;
        const toFile = downloadItem.toFile;
        const fileSize = downloadItem.fileSize;
        RNFSDownloader.stat(toFile).then(fileInfo => {
            if (fileInfo.size == fileSize) {
                existsFiles[fileId] = {
                    fileName: downloadItem.fileName,
                    filePath: toFile,
                    fileSize: fileSize,
                };
                downloadSuccess = true;
            } else {
                existsFiles[fileId] = null;
            }
            if (downloadSuccess) {
                _onFileDownloadSuccess(fileId, downloadItem);
            } else {
                _onFileDownloadFail(fileId);
            }
        }).catch(error=> {
            CommonFunc.alert(DS_FAIL_MSG);
        });
    }
};
type
DownloadParam = {
    fileId: string,//下载文件Id
    fileSize: nubmer,//文件大小
    fileName: string, //文件名
};

const _getInnerFileState = (fileId) => {
    const exists = !!(fileState[fileId] && fileState[fileId].exists);
    if (exists) {
        return FS_EXISTS;
    }
    const downloading = !!(fileState[fileId] && fileState[fileId].downloading);
    if (downloading) {
        return FS_DOWNLOADING;
    }
    return FS_NONE;
};

const _getFileState = (fileItem) => {
    const fileId = fileItem.fileId;
    return _getInnerFileState(fileId);
    if (downloadingFiles[fileId]) {
        return FS_DOWNLOADING;
    } else if (existsFiles[fileId] && existsFiles[fileId].fileSize == fileItem.fileSize) {
        return FS_EXISTS;
    }
    return FS_NONE;
};

const _getFileDownloadProgress = (fileId) => {
    const fileInfo = fileState[fileId];
    const curLength = fileInfo && fileInfo.bytesWritten || 0;
    return curLength;
};

const _getFileSavePath = ()=> {
    if (isIos) {
        return RNFSDownloader.DocumentDirectoryPath;
    } else {
        return RNFSDownloader.ExternalDirectoryPath;
    }
};

const _getSavePathAndName = (fileId, fileName)=> {
    // const extName = path.extname(fileName);
    const extName = fileName.substr(fileName.lastIndexOf('.'));
    if (isIos) {
        return _getFileSavePath() + '/' + fileName;
    }
    return _getFileSavePath() + '/' + fileId + extName;
};

const _generateDownloadUrl = (fileId, isForApp = false) => {
    if (isForApp) {
        return CommonLink.downloadAndroid();
    }
    return CommonLink.downloadAttachment(fileId);
};

const _makeDownloadParam = (fileId, fileSize, fileName, isForApp = false)=> {
    const fromUrl = _generateDownloadUrl(fileId, isForApp);
    const saveToFile = _getSavePathAndName(fileId, fileName);
    const contentLength = fileSize;
    const jobId = null;
    const downloadParam = {
        fileId: fileId,
        fileSize: fileSize,
        fileName: fileName,
        fromUrl: fromUrl,
        toFile: saveToFile,
        jobId: jobId,
        contentLength: contentLength,
        bytesWritten: 0,
        downloadAppFlag: isForApp,//app下载
    };
    return downloadParam;
};

const _isFileExist = (downloadParam) => {
    return FS_EXISTS === _getFileState(downloadParam);
};
// app文件是否已经下载
const _isAppExist = (fileId, fileSize, fileName) => {
    const downloadParam = _makeDownloadParam(fileId,fileSize,fileName, true);
    return FS_EXISTS === _getFileState(downloadParam);
};

const _addToDownloadFiles = (downloadItem, beginOps) => {
    downloadItem.jobId = beginOps.jobId;
    downloadItem.contentLength = beginOps.contentLength;
    const fileId = downloadItem.fileId;
    downloadingFiles[fileId] = downloadItem;
};

const _removeFromDownloadingFiles = (fileId) => {
    downloadingFiles[fileId] = null;
};

const _modifyProgress = (downloadItem, progressOps) => {
    const fileId = downloadItem.fileId;
    const jobId = progressOps.jobId;
    const findDownloadingItem = downloadingFiles[fileId];
    if (findDownloadingItem && findDownloadingItem.jobId == jobId) {
        const curBytes = progressOps.bytesWritten;
        findDownloadingItem.bytesWritten = curBytes;
        _onFileDownloadProgress(fileId, curBytes);
    }
};

const _makeDownloadOptions = (downloadItem, callback, failure) => {
    const downloadOptions = {
        background: true,
        fromUrl: downloadItem.fromUrl,                       // URL to download file from
        toFile: downloadItem.toFile,              // Local filesystem path to save the file to
        headers: null,                      // An object of headers to be passed to the server
        progressDivider: 10,//progressCallback调用的，任务百分比，0 :下载一段，就回调，非 0 :每下载指定百分比｜｜下载完成，回调
        begin: (beginOps) => {
            if (!beginOps.statusCode == 200) {//连接失败
                CommonFunc.alert(DS_FAIL_MSG);
            } else {
                _addToDownloadFiles(downloadItem, beginOps);
            }
        },
        //为了性能考虑，屏蔽进度更新
        progress: (progressOps) => {
            _modifyProgress(downloadItem, progressOps);
        },
    };
    return downloadOptions;
};


const _downloadEnd = (downloadItem, isSuccess) => {
    const fileId = downloadItem.fileId;
    const saveToFile = downloadItem.toFile;
    if (!saveToFile) {
        return;
    }
    if (!isSuccess) {
        RNFSDownloader.unlink(saveToFile).then(
            () => {
            }
        ).catch(
            (error) => {
            });
        _onFileDownloadFail(fileId);
    } else {
        _fetchExistFiles(false, downloadItem);
    }
};

const __downloadFileByParam = (downloadParam, callback = null, failure = null) => {
    const downloadOptions = _makeDownloadOptions(downloadParam, callback, failure);
    const downloadResult = RNFSDownloader.downloadFile(downloadOptions);
    let promise = downloadResult.promise;
    promise.then((res) => {
        if (res.statusCode == 200) {//只要结果中的状态码［200］，即认为下载成功，否则失败
            _downloadEnd(downloadParam, true);
        } else {
            _downloadEnd(downloadParam, false);
        }
    }).catch((err) => {
        _downloadEnd(downloadParam, false);
    });
};

const _downloadFile = (fileId, fileSize, fileName, callback, failure)=> {
    const downloadParam = _makeDownloadParam(fileId, fileSize, fileName);
    __downloadFileByParam(downloadParam, callback, failure);
};

const _openFile = (fileItem) => {
    const filePath = fileItem.toFile;
    const fileName = fileItem.fileName;
    if (isIos) {
        __previewFile(filePath, fileName);
    } else {
        let mimeType = MimeTypeUtils.lookup(filePath);
        FileOpener.open(filePath, mimeType).catch((err) => {
            CommonFunc.alert('未检测到打开当前类型文件的应用，请安装后再试！！');
        });
    }
};

const __previewFile = (filePath, fileName) => {
    const openInfo = [{
        url: filePath,
        optionalFileName: fileName,
    }];
    FilePreviewer.openDoc(openInfo, ()=> {
    });
};

const _canOpenFile = (fileId, fileSize, fileName) => {
    const downloadingItem = _makeDownloadParam(fileId, fileSize, fileName);
    const fileState = _getFileState(downloadingItem);
    let fileExistFlag = false, alertMsg = DS_FAIL_MSG;
    switch (fileState) {
        case FS_NONE:
            break;
        case FS_DOWNLOADING:
            alertMsg = DS_DOWNLOADING_MSG;
            break;
        case FS_EXISTS:
            fileExistFlag = true;
            break;
    }
    if (!fileExistFlag) {
        CommonFunc.alert(alertMsg);
        return;
    }
    _openFile(downloadingItem);
};

const _downloadOrOpenFile = (fileId, fileSize, fileName) => {
    const downloadItem = _makeDownloadParam(fileId, fileSize, fileName);
    _addToFileState(downloadItem);
    const fileState = _getFileState(downloadItem);
    if (FS_EXISTS == fileState) {
        _openFile(downloadItem);
    } else if (FS_DOWNLOADING == fileState) {
        CommonFunc.alert(DS_DOWNLOADING_MSG);
    } else {
        __downloadFileByParam(downloadItem);
    }
};

const _downloadApp = (fileId, fileSize, fileName) => {
    const downloadItem = _makeDownloadParam(fileId, fileSize, fileName, true);
    _addToFileState(downloadItem);
    const fileState = _getFileState(downloadItem);
    if (FS_EXISTS == fileState) {
        _updateApp(downloadItem);
    } else if (FS_DOWNLOADING == fileState) {
        // CommonFunc.alert(DS_DOWNLOADING_MSG);
    } else {
        __downloadFileByParam(downloadItem);
    }
};

const _updateApp = (downloadInfo) => {
    const toFile = downloadInfo.toFile;
    ApkUtils.installApk(toFile).then(res=> {
    }).catch(e=> {
        CommonFunc.alert("安装失败");
    });
};

//获取当前磁盘文件
const _fetchDiskFiles = () => {
    _fetchExistFiles(true);
};

const _getReadableFileSize = (bytes = 0) => {
    let res = '0 B';
    let fixed = 1;
    const units = ['B', 'K', 'M', 'G', 'T'];
    let bytesInt = parseInt(bytes);
    if (!isNaN(bytesInt)) {
        let temp = bytesInt;
        let little = 0;
        let unitIndex = 0;
        while (temp > 1024) {
            unitIndex++;
            little = temp % 1024;
            temp /= 1024;
        }
        fixed = unitIndex > 1 ? 1 : 0;//B,K省略小数位
        res = temp.toFixed(fixed).toString() + '' + units[unitIndex];
    }
    return res;
};

//获取磁盘文件信息
// _fetchDiskFiles();

const FSManager = {
    FS_NONE: FS_NONE,
    FS_DOWNLOADING: FS_DOWNLOADING,
    FS_EXISTS: FS_EXISTS,
    EVENT_FILE_DOWNLOAD_SUCCESS: EVENT_FILE_DOWNLOAD_SUCCESS,
    EVENT_FILE_DOWNLOAD_FAIL: EVENT_FILE_DOWNLOAD_FAIL,
    EVENT_FILE_DOWNLOAD_PROGRESS: EVENT_FILE_DOWNLOAD_PROGRESS,
    EVENT_DISK_FILE_CHANGED: EVENT_DISK_FILE_CHANGED,
    downloadFile: _downloadFile,
    isFileExist: _isFileExist,
    isAppExist: _isAppExist,
    getFileState: _getFileState,
    getFileStateByFileId: _getInnerFileState,
    getFileDownloadProgress: _getFileDownloadProgress,
    openFile: _openFile,
    addToFileState: _addToFileState,
    fetchDiskFiles: _fetchDiskFiles,
    getReadableFileSize: _getReadableFileSize,
    downloadOrOpenFile: _downloadOrOpenFile,
    clearAllDatas: _clearAllDatas,
    downloadApp: _downloadApp,
};

module.exports = FSManager;

/*

 _getFileSavePathAndName(rowData) {
 let fileName = this._getRandomFileName(rowData);
 let fileSubUrl = rowData.filepath;

 let startIndex = fileSubUrl.lastIndexOf('/') + 1;
 let endIndex = fileSubUrl.lastIndexOf('.');
 let fileSuffix = fileSubUrl.substring(endIndex);
 let tempPath = fileSubUrl.substring(startIndex, endIndex);
 endIndex = tempPath.lastIndexOf('.');
 let subPath = tempPath.substring(0, endIndex);
 const useSubPath = false;
 let fileSavaPath = this._getFileSavePath();
 fileSavaPath = useSubPath ? (fileSavaPath + '/' + subPath) : fileSavaPath;
 let optional = {RNFSURLIsExcludedFromBackupKey: true};//IOS 配置选项
 RNFSDownloader.exists(fileSavaPath)
 .then((exist) => {
 if (exist) {
 return;
 }
 })
 .then(RNFSDownloader.mkdir(fileSavaPath, optional))
 .catch((err) => {
 });
 let saveToFile = fileSavaPath + '/' + fileName;// + fileSuffix;
 return saveToFile;
 }
 */