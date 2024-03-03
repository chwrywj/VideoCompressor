const os = require('os');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const childProcess = require('child_process');

module.exports = class FfmpegClass {
    constructor() {
        this._ffmpegBinPath;
        this._cutVideoCommand;
        this._mergeVideoCommand;
        this._compressVideoCommandArr;
        this._videoFormatConvertCommandArr;
        this._videoAddWatermarkCommandArr;

        this.setFfmpegPath();
    }

    setFfmpegPath() {
        const platform = os.platform()
        const arch = os.arch()
        const basePath = path.resolve(
            process.env.NODE_ENV !== 'production'?'./resources/bin':process.resourcesPath + '/bin',
            platform,
            // arm64 is limit supported only for macOS
            platform === 'darwin' && arch === 'arm64'
            ? 'arm64'
            : 'x64',
        )
        var name='ffmpeg';
        this._ffmpegBinPath = path.resolve(
            basePath,
            platform === 'win32' ? `${name}.exe` : name,
        )
        .replace(/\\/g,"/")
        .replace('/src/js/bin/','/bin/');
        ffmpeg.setFfmpegPath(this._ffmpegBinPath);
    }

    getMediaMetaData(videoPath,callback){
        ffmpeg(videoPath).ffprobe((err, data) => {
            //console.log(err)
            if(err==null && callback!=null){
                callback(data);
            }
        });
    }

    cutVideo(input, output, opts, progressCallback,endCallback,errorCallback) {
        try{
            this._cutVideoCommand = ffmpeg(input)
                .seekInput(opts.seekInput)
                .duration(Number((opts.duration/opts.speed).toFixed(3)))
            if(opts.speed!=1){
                this._cutVideoCommand = this._cutVideoCommand.videoFilters('setpts='+(1/opts.speed).toFixed(2)+'*PTS');
                if(opts.speed==0.25)
                    this._cutVideoCommand = this._cutVideoCommand.audioFilters('atempo=0.5,atempo=0.5');
                else if(opts.speed==4)
                    this._cutVideoCommand = this._cutVideoCommand.audioFilters('atempo=2,atempo=2');
                else
                    this._cutVideoCommand = this._cutVideoCommand.audioFilters('atempo='+opts.speed);
            }
            if(opts.volume!=1 && !opts.noAudio){
                this._cutVideoCommand = this._cutVideoCommand.audioFilters('volume='+Number(opts.volume.toFixed(2)));
            }
            if(opts.noAudio){
                this._cutVideoCommand = this._cutVideoCommand.noAudio();
            }
            this._cutVideoCommand = this._cutVideoCommand
                .on('start', function (commandLine) {
                    console.log('Cut start: ' + commandLine);
                })
                .on('progress', function (progress) {
                    console.log('Processing: ' + progress.percent + '% done');
                    if(progressCallback!=null){
                        progressCallback(progress);
                    }
                })
                .on('end', function (stdout, stderr) {
                    console.log('Cut succeeded!');
                    if(endCallback!=null){
                        endCallback();
                    }
                })
                .on('error', function (err, stdout, stderr) {
                    console.log('Cut error: ', err);
                    if(errorCallback!=null){
                        errorCallback();
                    }
                })
                .save(output);
        }catch(e){
            console.log(e);
            if(errorCallback!=null){
                errorCallback();
            }
        }
    }
    killCutVideoCommand() {
        if (this._cutVideoCommand) {
            this._cutVideoCommand.kill();
        }
    }

    processVideoForMerge(input, output, opts, progressCallback,endCallback,errorCallback){
        this._mergeVideoCommand = ffmpeg()
            .input(input)
            .videoCodec('libx264') //libx264，libvpx，libtheora，libxvid，libvpx-vp9
            .audioCodec('aac') //libmp3lame，libfaac，libvorbis，libfdk_aac
            .fps(opts.frameRate)
            .videoBitrate(opts.videoBitrate)
            .audioBitrate(opts.audioBitrate)
            .duration(Number((opts.duration/opts.speed).toFixed(3)));
        if(opts.speed!=1){
            this._mergeVideoCommand = this._mergeVideoCommand.videoFilters('setpts='+(1/opts.speed).toFixed(2)+'*PTS');
            if(opts.speed==0.25)
                this._mergeVideoCommand = this._mergeVideoCommand.audioFilters('atempo=0.5,atempo=0.5');
            else if(opts.speed==4)
                this._mergeVideoCommand = this._mergeVideoCommand.audioFilters('atempo=2,atempo=2');
            else
                this._mergeVideoCommand = this._mergeVideoCommand.audioFilters('atempo='+opts.speed);
        }
        if(opts.volume!=1 && !opts.noAudio){
            this._mergeVideoCommand = this._mergeVideoCommand.audioFilters('volume='+Number(opts.volume.toFixed(2)));
        }
        if(opts.noAudio){
            this._mergeVideoCommand = this._mergeVideoCommand.noAudio();
        }
        this._mergeVideoCommand = this._mergeVideoCommand.size(opts.resolution)
            .autopad()
            .on('progress', function (progress) {
                //console.log('Processing: ' + progress.percent + '% done');
                if(progressCallback!=null){
                    progressCallback(progress);
                }
            })
            .on('end', function (stdout, stderr) {
                console.log('Processing succeeded!');
                if(endCallback!=null){
                    endCallback();
                }
            })
            .on('error', function (err, stdout, stderr) {
                console.log('Processing error: ', err);
                if(errorCallback!=null){
                    errorCallback();
                }
            })
            .save(output);
    }
    mergeVideo(output,concatFileContent,endCallback,errorCallback){
        this._mergeVideoCommand = ffmpeg()
            .outputOptions(['-i','concat:'+concatFileContent,'-codec','copy'])
            .on('end', function (stdout, stderr) {
                console.log('Merge succeeded!');
                if(endCallback!=null){
                    endCallback();
                }
            })
            .on('error', function (err, stdout, stderr) {
                console.log('Merge error: ', err);
                if(errorCallback!=null){
                    errorCallback();
                }
            })
            .save(output);
    }
    killMergeVideoCommand() {
        if (this._mergeVideoCommand) {
            this._mergeVideoCommand.kill();
        }
    }

    compressVideo(input, output, opts, progressCallback,endCallback,errorCallback){
        try{
            var ffmpegCommand = ffmpeg(input)
            if(opts.frameRate!=null){
                ffmpegCommand = ffmpegCommand.fps(opts.frameRate);
            }
            if(opts.videoWidth!=null && opts.videoHeight!=null){
                ffmpegCommand=ffmpegCommand
                .size(opts.videoWidth+'x'+opts.videoHeight)
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
                .on('progress', function (progress) {
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

            if(this._compressVideoCommandArr==null)
                this._compressVideoCommandArr=[];
            this._compressVideoCommandArr.push(ffmpegCommand);
        }catch(e){
            console.log(e);
            if(errorCallback!=null){
                errorCallback();
            }
        }
    }
    killCompressVideoCommand(){
        for(var i=this._compressVideoCommandArr.length-1;i>=0;i--){
            this._compressVideoCommandArr[i].kill();
            this._compressVideoCommandArr.splice(i,1);
        }
    }
    
    videoFormatConvert(input, output, opts, progressCallback,endCallback,errorCallback){
        try{
            var ffmpegCommand = ffmpeg(input)
                .on('start', function (commandLine) {
                    console.log('Format conversion start: ' + commandLine);
                })
                .on('progress', function (progress) {
                    //console.log('Processing: ' + progress.percent + '% done');
                    if(progressCallback!=null){
                        progressCallback(progress);
                    }
                })
                .on('end', function (stdout, stderr) {
                    console.log('Format conversion succeeded!');
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

            if(this._videoFormatConvertCommandArr==null)
                this._videoFormatConvertCommandArr=[];
            this._videoFormatConvertCommandArr.push(ffmpegCommand);
        }catch(e){
            console.log(e);
            if(errorCallback!=null){
            errorCallback();
            }
        }
    }
    killVideoFormatConvertCommand(){
        for(var i=this._videoFormatConvertCommandArr.length-1;i>=0;i--){
            this._videoFormatConvertCommandArr[i].kill();
            this._videoFormatConvertCommandArr.splice(i,1);
        }
    }
    
    previewVideoWatermark(input, opts, progressCallback, endCallback, errorCallback){
        try{
            var ffplayBinPath = "\""+this._ffmpegBinPath.substring(0, this._ffmpegBinPath.lastIndexOf('/')) +
                this._ffmpegBinPath.substring(this._ffmpegBinPath.lastIndexOf('/')).replace('ffmpeg','ffplay')+"\"";

            //根据用户设置的分辨率设置视频宽高
            var videoWidth=opts.videoWidth;
            var videoHeight=opts.videoHeight;
            if(opts.resolution=='custom' || opts.resolution=='customMax'){
                if (opts.customVideoWidth!=null && opts.customVideoWidth!='')
                    videoWidth=Number(opts.customVideoWidth);
                if (opts.customVideoHeight!=null && opts.customVideoHeight!='')
                    videoHeight=Number(opts.customVideoHeight);
                if(videoWidth!=null && videoHeight==null)
                    videoHeight=parseInt(opts.videoHeight/opts.videoWidth*videoWidth,10);
                if(videoWidth==null && videoHeight!=null)
                    videoWidth=parseInt(opts.videoWidth/opts.videoHeight*videoHeight,10);

                if(opts.resolution=='customMax'){
                    if(opts.videoWidth > videoWidth || opts.videoHeight > videoHeight){
                        if (opts.videoWidth/opts.videoHeight > videoWidth/videoHeight){
                            videoHeight = parseInt(opts.videoHeight / opts.videoWidth * videoWidth, 10);
                        }else{
                            videoWidth = parseInt(opts.videoWidth / opts.videoHeight * videoHeight, 10);
                        }
                    }else{
                        videoWidth = opts.videoWidth;
                        videoHeight = opts.videoHeight;
                    }
                }
            }else if(opts.resolution!='source'){
                var resolutionArr = opts.resolution.split('x');
                videoWidth=Number(resolutionArr[0]);
                videoHeight=Number(resolutionArr[1]);
            }

            //设置预览播放器大小
            var ffplayWidth=window.screen.width;
            var ffplayHeight=window.screen.height-150;
            if(videoWidth > ffplayWidth || videoHeight > ffplayHeight){
                if (videoWidth/videoHeight > ffplayWidth/ffplayHeight){
                    ffplayHeight = parseInt(videoHeight / videoWidth * ffplayWidth, 10);
                }else{
                    ffplayWidth = parseInt(videoWidth / videoHeight * ffplayHeight, 10);
                }
            }else{
                ffplayWidth = videoWidth;
                ffplayHeight = videoHeight;
            }

            if(opts.watermarkType=="image"){
                var overlay;
                if(opts.imagePosition=='custom'){
                    overlay=opts.positionX+':'+opts.positionY;
                }else if(opts.imagePosition=='lt'){
                    overlay='10:10';
                }else if(opts.imagePosition=='mt'){
                    overlay='main_w/2-overlay_w/2:10';
                }else if(opts.imagePosition=='rt'){
                    overlay='main_w-overlay_w-10:10';
                }else if(opts.imagePosition=='lm'){
                    overlay='10:main_h/2-overlay_h/2';
                }else if(opts.imagePosition=='m'){
                    overlay='main_w/2-overlay_w/2:main_h/2-overlay_h/2';
                }else if(opts.imagePosition=='rm'){
                    overlay='main_w-overlay_w-10:main_h/2-overlay_h/2';
                }else if(opts.imagePosition=='lb'){
                    overlay='10:main_h-overlay_h-10';
                }else if(opts.imagePosition=='mb'){
                    overlay='main_w/2-overlay_w/2:main_h-overlay_h-10';
                }else if(opts.imagePosition=='rb'){
                    overlay='main_w-overlay_w-10:main_h-overlay_h-10';
                }
                if(videoWidth==opts.videoWidth && videoHeight==opts.videoHeight){
                    childProcess.exec(`${ffplayBinPath} -i "${input}" -x ${ffplayWidth} -y ${ffplayHeight} -t ${opts.duration<5?opts.duration:5} -vf "movie=${opts.imagePath.replace(/\\/g,"/").replace(':','\\\\:')}[watermark];[in][watermark]overlay=${overlay}[out]"`);
                    if(endCallback!=null){
                        endCallback();
                    }
                }else{
                    var outputFilePath1=opts.videoTempDirPath+'/'+Date.now()+'_1.mp4';
                    var outputFilePath2=opts.videoTempDirPath+'/'+Date.now()+'_2.mp4';
                    ffmpeg(input)
                        .duration(opts.duration<5?opts.duration:5)
                        .size(videoWidth+'x'+videoHeight)
                        .autopad()
                        .on('start', function (commandLine) {
                            console.log('Ffmpeg1: start ' + commandLine);
                        })
                        .on('progress', function (progress) {
                            console.log('Processing1: ' + progress.percent + '% done');
                        })
                        .on('end', function (stdout, stderr) {
                            console.log('Ffmpeg1: succeeded!');
        
                            ffmpeg(outputFilePath1)
                                //.outputOptions(['-i',opts.imagePath,'-filter_complex','overlay=x=W-w:y=5'])
                                .videoFilters(`movie=${opts.imagePath.replace(/\\/g,"/").replace(':','\\\\:')}[watermark];[in][watermark]overlay=${overlay}[out]`)
                                .on('start', function (commandLine) {
                                    console.log('Ffmpeg2: start ' + commandLine);
                                })
                                .on('progress', function (progress) {
                                    console.log('Processing2: ' + progress.percent + '% done');
                                })
                                .on('end', function (stdout, stderr) {
                                    console.log('Ffmpeg2: succeeded!');
                                    if(endCallback!=null){
                                        endCallback();
                                    }
                                    childProcess.exec(`${ffplayBinPath} -i "${outputFilePath2}" -x ${ffplayWidth} -y ${ffplayHeight}`)
                                })
                                .on('error', function (err, stdout, stderr) {
                                    console.log('Ffmpeg2: error ', err);
                                    console.log('Ffmpeg2: error ', stdout);
                                    console.log('Ffmpeg2: error ', stderr);
                                    if(errorCallback!=null){
                                        errorCallback();
                                    }
                                })
                                .save(outputFilePath2);
                        })
                        .on('error', function (err, stdout, stderr) {
                            console.log('Ffmpeg1: error ', err);
                            console.log('Ffmpeg1: error ', stdout);
                            console.log('Ffmpeg1: error ', stderr);
                            if(errorCallback!=null){
                                errorCallback();
                            }
                        })
                        .save(outputFilePath1);
                }
            }else{
                //设置视频等比缩放值和多余边框填充时画面开始x、y坐标
                var scale;
                var videoFrameXY;
                if(opts.videoWidth/opts.videoHeight > videoWidth/videoHeight){
                    scale = videoWidth+':-1';
                    videoFrameXY='0:'+parseInt((videoHeight-opts.videoHeight/opts.videoWidth*videoWidth) / 2, 10);
                } else {
                    scale = '-1:'+videoHeight;
                    videoFrameXY=parseInt((videoWidth-opts.videoWidth/opts.videoHeight*videoHeight) / 2, 10)+':0';
                }

                var commandStr=`drawtext=fontsize=${opts.fontSize}:fontfile=FreeSerifttf:text='${opts.text}':fontcolor=${opts.fontColor}:x=${opts.positionX}:y=${opts.positionY}:alpha=${opts.opacity}`;
                if(opts.fontBgColor!='')
                    commandStr+=`:box=1:boxcolor=${opts.fontBgColor}`;
                childProcess.exec(`${ffplayBinPath} -i "${input}" -x ${ffplayWidth} -y ${ffplayHeight} -t ${opts.duration<5?opts.duration:5} -vf "scale=${scale},pad=${videoWidth}:${videoHeight}:${videoFrameXY}:black,${commandStr}"`)
            }
        }catch(e){
            console.log(e)
            if(errorCallback!=null){
                errorCallback();
            }
        }
    }
    videoAddWatermark(input, videoTempName, output, opts, progressCallback,endCallback,errorCallback){
        try{
            //根据用户设置的分辨率设置视频宽高
            var videoWidth=opts.videoWidth;
            var videoHeight=opts.videoHeight;
            if(opts.resolution=='custom' || opts.resolution=='customMax'){
                if (opts.customVideoWidth!=null && opts.customVideoWidth!='')
                    videoWidth=Number(opts.customVideoWidth);
                if (opts.customVideoHeight!=null && opts.customVideoHeight!='')
                    videoHeight=Number(opts.customVideoHeight);
                if(videoWidth!=null && videoHeight==null)
                    videoHeight=parseInt(opts.videoHeight/opts.videoWidth*videoWidth,10);
                if(videoWidth==null && videoHeight!=null)
                    videoWidth=parseInt(opts.videoWidth/opts.videoHeight*videoHeight,10);

                if(opts.resolution=='customMax'){
                    if(opts.videoWidth > videoWidth || opts.videoHeight > videoHeight){
                        if (opts.videoWidth/opts.videoHeight > videoWidth/videoHeight){
                            videoHeight = parseInt(opts.videoHeight / opts.videoWidth * videoWidth, 10);
                        }else{
                            videoWidth = parseInt(opts.videoWidth / opts.videoHeight * videoHeight, 10);
                        }
                    }else{
                        videoWidth = opts.videoWidth;
                        videoHeight = opts.videoHeight;
                    }
                }
            }else if(opts.resolution!='source'){
                var resolutionArr = opts.resolution.split('x');
                videoWidth=Number(resolutionArr[0]);
                videoHeight=Number(resolutionArr[1]);
            }

            //水印位置
            var overlay;
            var ffmpegCommand;
            if(opts.watermarkType=="image"){
                if(opts.imagePosition=='custom'){
                    overlay=opts.positionX+':'+opts.positionY;
                }else if(opts.imagePosition=='lt'){
                    overlay='10:10';
                }else if(opts.imagePosition=='mt'){
                    overlay='main_w/2-overlay_w/2:10';
                }else if(opts.imagePosition=='rt'){
                    overlay='main_w-overlay_w-10:10';
                }else if(opts.imagePosition=='lm'){
                    overlay='10:main_h/2-overlay_h/2';
                }else if(opts.imagePosition=='m'){
                    overlay='main_w/2-overlay_w/2:main_h/2-overlay_h/2';
                }else if(opts.imagePosition=='rm'){
                    overlay='main_w-overlay_w-10:main_h/2-overlay_h/2';
                }else if(opts.imagePosition=='lb'){
                    overlay='10:main_h-overlay_h-10';
                }else if(opts.imagePosition=='mb'){
                    overlay='main_w/2-overlay_w/2:main_h-overlay_h-10';
                }else if(opts.imagePosition=='rb'){
                    overlay='main_w-overlay_w-10:main_h-overlay_h-10';
                }

                ffmpegCommand = ffmpeg(input);
                if(videoWidth==opts.videoWidth && videoHeight==opts.videoHeight){
                    ffmpegCommand = ffmpegCommand
                        .videoFilters(`movie=${opts.imagePath.replace(/\\/g,"/").replace(':','\\\\:')}[watermark];[in][watermark]overlay=${overlay}[out]`)
                        .on('start', function (commandLine) {
                            console.log('Ffmpeg: start ' + commandLine);
                        })
                        .on('progress', function (progress) {
                            console.log('Processing: ' + progress.percent + '% done');
                            if(progressCallback!=null){
                                progressCallback(progress);
                            }
                        })
                        .on('end', function (stdout, stderr) {
                            console.log('Ffmpeg: succeeded!');
                            if(endCallback!=null){
                                endCallback();
                            }
                        })
                        .on('error', function (err, stdout, stderr) {
                            console.log('Ffmpeg: error ', err);
                            console.log('Ffmpeg: error ', stdout);
                            console.log('Ffmpeg: error ', stderr);
                            if(errorCallback!=null){
                                errorCallback();
                            }
                        })
                        .save(output);
                }else{
                    ffmpegCommand = ffmpegCommand
                        .size(videoWidth+'x'+videoHeight)
                        .autopad()
                        .on('start', function (commandLine) {
                            console.log('Ffmpeg1: start ' + commandLine);
                        })
                        .on('progress', function (progress) {
                            if(progress.percent!=null && progress.percent!='' && !isNaN(progress.percent))
                                progress.percent=progress.percent/2;
                            console.log('Processing1: ' + progress.percent + '% done');
                            if(progressCallback!=null){
                                progressCallback(progress);
                            }
                        })
                        .on('end', function (stdout, stderr) {
                            console.log('Ffmpeg1: succeeded!');
        
                            ffmpeg(videoTempName)
                                .videoFilters(`movie=${opts.imagePath.replace(/\\/g,"/").replace(':','\\\\:')}[watermark];[in][watermark]overlay=${overlay}[out]`)
                                .on('start', function (commandLine) {
                                    console.log('Ffmpeg2: start ' + commandLine);
                                })
                                .on('progress', function (progress) {
                                    if(progress.percent!=null && progress.percent!='' && !isNaN(progress.percent))
                                        progress.percent=50+progress.percent/2;
                                    console.log('Processing2: ' + progress.percent + '% done');
                                    if(progressCallback!=null){
                                        progressCallback(progress);
                                    }
                                })
                                .on('end', function (stdout, stderr) {
                                    console.log('Ffmpeg2: succeeded!');
                                    if(endCallback!=null){
                                        endCallback();
                                    }
                                })
                                .on('error', function (err, stdout, stderr) {
                                    console.log('Ffmpeg2: error ', err);
                                    console.log('Ffmpeg2: error ', stdout);
                                    console.log('Ffmpeg2: error ', stderr);
                                    if(errorCallback!=null){
                                        errorCallback();
                                    }
                                })
                                .save(output);
                        })
                        .on('error', function (err, stdout, stderr) {
                            console.log('Ffmpeg1: error ', err);
                            console.log('Ffmpeg1: error ', stdout);
                            console.log('Ffmpeg1: error ', stderr);
                            if(errorCallback!=null){
                                errorCallback();
                            }
                        })
                        .save(videoTempName);
                }
            }else{
                overlay=opts.positionX+':'+opts.positionY;
                
                ffmpegCommand = ffmpeg(input);
                if(videoWidth!=opts.videoWidth || videoHeight!=opts.videoHeight){
                    ffmpegCommand = ffmpegCommand
                        .size(videoWidth+'x'+videoHeight)
                        .autopad();
                }
                ffmpegCommand = ffmpegCommand
                    .videoFilters(`drawtext=fontsize=${opts.fontSize}:fontfile=FreeSerifttf:text='${opts.text}':fontcolor=${opts.fontColor}${opts.fontBgColor!=''?':box=1:boxcolor='+opts.fontBgColor:''}:x=${opts.positionX}:y=${opts.positionY}:alpha=${opts.opacity}`)
                    .on('start', function (commandLine) {
                        console.log('Ffmpeg: start ' + commandLine);
                    })
                    .on('progress', function (progress) {
                        console.log('Processing: ' + progress.percent + '% done');
                        if(progressCallback!=null){
                            progressCallback(progress);
                        }
                    })
                    .on('end', function (stdout, stderr) {
                        console.log('Ffmpeg: succeeded!');
                        if(endCallback!=null){
                            endCallback();
                        }
                    })
                    .on('error', function (err, stdout, stderr) {
                        console.log('Ffmpeg: error ', err);
                        console.log('Ffmpeg: error ', stdout);
                        console.log('Ffmpeg: error ', stderr);
                        if(errorCallback!=null){
                            errorCallback();
                        }
                    })
                    .save(output);
            }

            if(this._videoAddWatermarkCommandArr==null)
                this._videoAddWatermarkCommandArr=[];
            this._videoAddWatermarkCommandArr.push(ffmpegCommand);
        }catch(e){
            console.log(e);
            if(errorCallback!=null){
                errorCallback();
            }
        }
    }
    killVideoAddWatermarkCommand(){
        for(var i=this._videoAddWatermarkCommandArr.length-1;i>=0;i--){
            this._videoAddWatermarkCommandArr[i].kill();
            this._videoAddWatermarkCommandArr.splice(i,1);
        }
    }
}