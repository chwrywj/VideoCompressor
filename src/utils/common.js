const { ipcRenderer, shell, remote } = require('electron')
const fs = require('fs');
const path = require('path');

const FfmpegClass = require('./FfmpegClass');
let ffmpegClass = new FfmpegClass();

export default {
    openBrowser: (url) => {
        shell.openExternal(url);
    },

    openPath: (url) => {
        shell.openPath(url);
    },

    dialogOpenFile: (extArr, multiSelections) => ipcRenderer.invoke('dialog:openFile', extArr, multiSelections),

    dialogOpenDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),

    diaglogSaveFile: (extArr) => ipcRenderer.invoke('dialog:saveFile', extArr),

    getFilesFromDir: (inputPath,extArr) => {
        var fileData=[];
        const readImgFilePath = (directoryPath) => {
        directoryPath = path.resolve(directoryPath);
        const files = fs.readdirSync(directoryPath);
        files.forEach((file) => {
            const filePath  = path.join(directoryPath, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                var extname = path.extname(file).toLocaleLowerCase();
                if(extname!=null && extname!=''){
                extname=extname.substring(1);
                if(extArr.includes(extname)){
                    fileData.push({
                        filePath:filePath,
                        fileSize:stat.size
                    })
                }
                }
            } else if (stat.isDirectory()){
                readImgFilePath(filePath);
            }
        });
        }
        readImgFilePath(inputPath);
        return fileData;
    },

    getFileSize:(filePath)=>{
        filePath = path.resolve(filePath);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            return stat.size;
        }else{
            return null;
        }
    },

    fileExists:(filePath)=>{
        return fs.existsSync(path.resolve(filePath));
    },

    deleteFile:(filePath)=>{
        try{
            if(fs.existsSync(path.resolve(filePath))){
                fs.unlinkSync(filePath);
            }
            return true;
        }catch(e){return false;}
    },

    writeFile:(filePath,content)=>{
        if(fs.existsSync(path.resolve(filePath))){
        fs.unlinkSync(filePath);
        }
        fs.writeFileSync(filePath,content);
    },

    makeDir:(dirPath)=>{
        try{
            if(!fs.existsSync(path.resolve(dirPath))){
                fs.mkdirSync(dirPath);
            }
            return true;
        }catch(e){
            console.log(e)
            return false;
        }
    },

    deleteDir:(dirPath)=>{
        var deleteDirRecursive=function(dirPath){
            var files = [];
            if(fs.existsSync(dirPath)) {
                files = fs.readdirSync(dirPath);
                files.forEach(function(file, index) {
                var curPath = dirPath + "/" + file;
                if(fs.statSync(curPath).isDirectory()) {
                    deleteDirRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
                });
                fs.rmdirSync(dirPath);
            }
        };
        deleteDirRecursive(dirPath);
    },

    getMediaMetaData:(videoPath,callback)=>{
        ffmpegClass.getMediaMetaData(videoPath,callback);
    },

    cutVideo: (input, output, opts, progressCallback,endCallback,errorCallback) => {
        ffmpegClass.cutVideo(input, output, opts, progressCallback,endCallback,errorCallback);
    },
    killCutVideoCommand: () => {
        ffmpegClass.killCutVideoCommand();
    },

    processVideoForMerge:(input, output, opts, progressCallback,endCallback,errorCallback)=>{
        ffmpegClass.processVideoForMerge(input, output, opts, progressCallback,endCallback,errorCallback);
    },
    mergeVideo:(output,concatFilePath,endCallback,errorCallback)=>{
        ffmpegClass.mergeVideo(output,concatFilePath,endCallback,errorCallback);
    },
    killMergeVideoCommand: () => {
        ffmpegClass.killMergeVideoCommand();
    },
    
    compressVideo:(input, output, opts, progressCallback,endCallback,errorCallback)=>{
        ffmpegClass.compressVideo(input, output, opts, progressCallback,endCallback,errorCallback);
    },
    killCompressVideoCommand: () => {
        ffmpegClass.killCompressVideoCommand();
    },
    
    videoFormatConvert:(input, output, opts, progressCallback,endCallback,errorCallback)=>{
        ffmpegClass.videoFormatConvert(input, output, opts, progressCallback,endCallback,errorCallback);
    },
    killVideoFormatConvertCommand: () => {
        ffmpegClass.killVideoFormatConvertCommand();
    },
    
    previewVideoWatermark:function(input, opts, progressCallback, endCallback, errorCallback){
        //创建文件夹，用于存储临时视频文件
        var exePath = path.dirname(remote.app.getPath('exe'));
        console.log(exePath);
        var videoTempDirPath=exePath+'/data'
        this.makeDir(videoTempDirPath);
        videoTempDirPath+='/VideoTemp'
        this.deleteDir(videoTempDirPath); //删除老数据
        this.makeDir(videoTempDirPath);
        opts.videoTempDirPath=videoTempDirPath;
        ffmpegClass.previewVideoWatermark(input, opts, progressCallback, endCallback, errorCallback);
    },
    videoAddWatermark:(input, videoTempName, output, opts, progressCallback,endCallback,errorCallback)=>{
        ffmpegClass.videoAddWatermark(input, videoTempName, output, opts, progressCallback,endCallback,errorCallback);
    },
    killVideoAddWatermarkCommand: () => {
        ffmpegClass.killVideoAddWatermarkCommand();
    }
}
