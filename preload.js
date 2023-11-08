const { contextBridge, ipcRenderer, shell } = require('electron')
const fs = require('fs');
const path = require('path');
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');

(function(){
  const platform = os.platform()
  const arch = os.arch()
  const basePath = path.resolve(
    __dirname.replace('app.asar', 'app.asar.unpacked'),
    'bin',
    platform,
    // arm64 is limit supported only for macOS
    platform === 'darwin' && arch === 'arm64'
      ? 'arm64'
      : 'x64',
  )
  var name='ffmpeg';
  var binPath = path.resolve(
    basePath,
    platform === 'win32' ? `${name}.exe` : name,
  )
  ffmpeg.setFfmpegPath(binPath);
})();

var ffmpegCommandArr=[];

contextBridge.exposeInMainWorld('electronAPI', {
  openBrowser: (url) => {
    shell.openExternal(url);
  },
  
  openPath: (url) => {
    shell.openPath(url);
  },

  openFile: (extArr) => ipcRenderer.invoke('dialog:openFile', extArr),

  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),

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

  removeFile:(filePath)=>{
    try{
      if(fs.existsSync(path.resolve(filePath))){
        fs.unlinkSync(filePath);
      }
      return true;
    }catch(e){return false;}
  },

  getVideoOrAudioMetaData:(input,callback)=>{
    ffmpeg(input).ffprobe((err, data) => {
      //console.log(err)
      if(err==null && callback!=null){
        callback(data);
      }
    });
  },
  
  execFfmpeg: (input, output, opts, progressCallback,endCallback,errorCallback) => {
    try{
      ffmpegCommand = ffmpeg(input)
      if(opts.frameRate!=null){
        ffmpegCommand = ffmpegCommand.fps(opts.frameRate);
      }
      if(opts.resolution[0]!=null || opts.resolution[1]!=null){
        ffmpegCommand=ffmpegCommand
          .size((opts.resolution[0]!=null?opts.resolution[0]:'?')+'x'+(opts.resolution[1]!=null?opts.resolution[1]:'?'))
          .autopad();
      }
      if(opts.crf!=null){
        ffmpegCommand=ffmpegCommand.outputOptions('-crf '+opts.crf);
      }
      if(opts.bitRate!=null){
        ffmpegCommand=ffmpegCommand.outputOptions(['-b:v',opts.bitRate+'k']);
      }
      ffmpegCommand = ffmpegCommand
        .on('start', function (commandLine) {
          console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        // .on('codecData', function (data) {
        //   console.log(data);
        // })
        // .on('stderr', function (stderrLine) {
        //   console.log('Stderr output: ' + stderrLine);
        // })
        .on('progress', function (progress) {
          //console.log(progress)
          //console.log('Processing: ' + progress.percent + '% done');
          if(progressCallback!=null){
            progressCallback(progress);
          }
        })
        .on('end', function (stdout, stderr) {
          console.log('Transcoding succeeded!');
          if(endCallback!=null){
            endCallback();
          }
        })
        .on('error', function (err, stdout, stderr) {
          console.log('Cannot process: ', err);
          if(errorCallback!=null){
            errorCallback();
          }
        })
        .save(output);
        ffmpegCommandArr.push(ffmpegCommand);
    }catch(e){
      console.log(e);
      if(errorCallback!=null){
        errorCallback();
      }
    }
  },

  killFfmpegCommand:()=>{
    for(var i=ffmpegCommandArr.length-1;i>=0;i--){
      ffmpegCommandArr[i].kill();
      ffmpegCommandArr.splice(i,1);
    }
  }
})

contextBridge.exposeInMainWorld('customApi', {
  getLangRes: () => {
    var langList=["bg", "cs", "da", "de", "el", "en", "es", "et", "fi", "fr", "hu", "it", "ja", "ko", "nl", "pl", "pt", "ro", "ru", "sl", "sv", "th", "vi", "zh", "zh-tw"];

    return ipcRenderer.invoke('getLocale')
    .then(data=>{
      var langCode = data;
      if (langCode == "zh-hk"){
          langCode = "zh-tw";
      }
      if(!langList.includes(langCode)){
        if(langCode.indexOf('-')!=-1){
          langCode=langCode.substring(0,langCode.indexOf('-'));
        }
        if(!langList.includes(langCode)){
          langCode="en";
        }
      }
      return require('./locales/'+langCode+'.json');
    })
    .catch((e) => {
      return require('./locales/en.json');
    });
  },
})