/**
 * Created by edz on 2017/6/26.
 */

import React, {Component} from 'react';
import {
    View,
    Text,
    ListView,
    Image,
    Alert,
    Dimensions,
    Platform,
} from 'react-native';

import CommonLink from '../../modules/CommonLink';
import RNFSDownloader from 'react-native-fs';

/**
 type allDiskFiles = {
  name: string;     // The name of the item
  path: string;     // The absolute path to the item
  size: string;     // Size in bytes
  isFile: () => boolean;        // Is the file just a file?
  isDirectory: () => boolean;   // Is the file a directory?
};
 */
let allDiskFiles = [];
/**
 type DownloadFileOptions = {
  fromUrl: string;          // URL to download file from
  toFile: string;           // Local filesystem path to save the file to
  headers?: Headers;        // An object of headers to be passed to the server
  background?: boolean;
  progressDivider?: number;
  begin?: (res: DownloadBeginCallbackResult) => void;
  progress?: (res: DownloadProgressCallbackResult) => void;
};
 */
let downloadingFiles = [];
let homeIcons_SubPath = 'homeIcons';//首页图标存放的子路径,

const _getDiskFileList = () => {
    let fileSavePath = _getFileSavePath();
    RNFSDownloader.readDir(fileSavePath).then((fileInfos) => {
        allDiskFiles = fileInfos;
    }).catch((error) => {
    });
};

const _getFileSavePath = (subPath) => {
    let filePath = '';
    if (Platform.OS === 'ios') {
        filePath = RNFSDownloader.DocumentDirectoryPath;
    } else {
        filePath = RNFSDownloader.ExternalDirectoryPath;
    }
    subPath = subPath ? subPath : homeIcons_SubPath;
    filePath += '/' + subPath;
    return filePath;
};

const _getFileSavePathAndName = (fileName) => {
    // let fileName = _getRandomFileName(fileUrl);
    let fileSavaPath = _getFileSavePath();
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
    let saveToFile = fileSavaPath + '/' + fileName;
    return saveToFile;
};

//获取 uuid 形式的文件名字。以该文件名字来作为文件的保存名字。
const _getRandomFileName = (fileUrl) => {
    const dbRelativeFilePath = fileUrl;
    let lastSlashIndex = dbRelativeFilePath.lastIndexOf('/');
    let firstAndFlagIndex = dbRelativeFilePath.indexOf('&');
    firstAndFlagIndex = firstAndFlagIndex == -1 ? dbRelativeFilePath.length : firstAndFlagIndex;
    let fileName = dbRelativeFilePath.substring(lastSlashIndex + 1, firstAndFlagIndex);
    return fileName;
};

//文件下载参数选项
// const downloadOptions = {
//     fileName: '',
//     fileUrl: '',
//     fileSize: '',
// };

const _downloadFile = (options) => {
    // const tempUrl = CommonLink.returnHostUrl() + downloadOptions.fileUrl;
    const tempUrl = options.fileUrl;
    const fileUrl = encodeURI(tempUrl);
    // const saveToFile = _getFileSavePathAndName(options.fileUrl);
    const saveToFile = _getFileSavePathAndName(options.fileSaveName);

    //判断文件本地是否存在
    RNFSDownloader.exists(saveToFile)
        .then((exist) => {
            if (exist) {
                return;
            } else {//文件不存在，开始下载
                let newDownItemInfo = {
                    fromUrl: fileUrl,
                    toFile: saveToFile,
                    jobId: null,
                    contentLength: options.fileSize,
                    bytesWritten: 0,
                };
                const downloadOptions = {
                    background: true,
                    fromUrl: fileUrl,                       // URL to download file from
                    toFile: saveToFile,              // Local filesystem path to save the file to
                    headers: null,                      // An object of headers to be passed to the server
                    progressDivider: 100,//progressCallback调用的，任务百分比，0 :下载一段，就回调，非 0 :每下载指定百分比｜｜下载完成，回调
                    begin: (begin) => {
                        if (!begin.statusCode == 200) {//连接失败
                            let errMsg = '文件获取失败：' + fileUrl;
                        } else {
                            let jobId = begin.jobId;
                            newDownItemInfo.jobId = begin.jobId;
                            // newDownItemInfo.contentLength = begin.contentLength;
                            let strJobId = jobId.toString();
                            downloadingFiles[strJobId] = newDownItemInfo;
                        }
                    },
                    //为了性能考虑，屏蔽进度更新
                    progress: (progress) => {
                        let jobIdStr = progress.jobId.toString();
                        downloadingFiles[jobIdStr].bytesWritten = progress.bytesWritten;
                    },
                };
                var downloadResult = RNFSDownloader.downloadFile(downloadOptions);
                const downloadJobId = downloadResult.jobId;
                let promise = downloadResult.promise;
                promise.then((res) => {
                    let jobIdStr = res.jobId.toString();
                    if (res.statusCode == 200) {//只要结果中的状态码［200］，即认为下载成功，否则失败
                        let errMsg = downloadOptions.fileName;
                        _deleteFile(jobIdStr, errMsg, saveToFile, false, '下载完成');
                    } else {
                        let errMsg = '文件不存在，或链接失效！！！';
                        _deleteFile(jobIdStr, errMsg, saveToFile, true);
                    }
                }).catch((err) => {
                    let jobIdStr = downloadJobId.toString();
                    let errMsg = '文件不存在，或链接失效！！！';
                    _deleteFile(jobIdStr, errMsg, saveToFile, true);
                });
            }
        })
        .catch((err) => {
        });
};

const _deleteFile = (jobIdStr, msg, deleteFile, isDeleteFile = false, title = null) => {
    delete downloadingFiles[jobIdStr];
    if (isDeleteFile) {
        RNFSDownloader.unlink(deleteFile).then(
            () => {
                _getDiskFileList();//获取本地文件列表
            }
        ).catch((error) => {
            _getDiskFileList();//获取本地文件列表
        });
    } else {
        _getDiskFileList();
    }
};

const _fileExists = (downloadOptions) => {
    const saveToFile = _getFileSavePathAndName(downloadOptions.fileSaveName);
    let fileInfo = null;
    for (let i = 0; i < allDiskFiles.length; i++) {
        let fileItem = allDiskFiles[i];
        // if (fileItem.isFile() && saveToFile == fileItem.path) {//测试用，暂时不比较文件大小
        if (fileItem.isFile() && saveToFile == fileItem.path && fileItem.size == downloadOptions.fileSize) {
            fileInfo = fileItem;
            break;
        }
    }
    return fileInfo;
};

const DownloadModule = {
    getDiskFileList: _getDiskFileList,
    getFileSavePath: _getFileSavePath,
    getFileSavePathAndName: _getFileSavePathAndName,
    getRandomFileName: _getRandomFileName,
    downloadFile: _downloadFile,
    deleteFile: _deleteFile,
    fileExists: _fileExists,
};

module.exports = DownloadModule;