<template>
  <div class="my-container">
    <div class="left">
      <template v-if="(fileData==null || fileData.length==0) && !tableLoading">
          <div class="add-file-cover">
              <i class="my-icon my-icon-add-video" @click="dialogOpenFile"></i>
              <div class="tip">{{$t('videoCompress.tip')}}<br/>{{$t('common.addFileTip')}}{{videoExtArr.join(', ')}}</div>
              <div class="add-filt-btn-box">
                  <el-button type="primary" size="large" class="add-file-btn" plain @click="dialogOpenFile">
                      <i class="my-icon my-icon-file"></i>
                      <span>{{$t('common.addVideoBtn')}}</span>
                  </el-button>
                  <el-tooltip :content="$t('common.addDirTip')" placement="top">
                      <el-button type="primary" size="large" class="add-file-btn" plain @click="dialogOpenDirectory('input')">
                          <i class="my-icon my-icon-folder"></i>
                          <span>{{$t('common.addDirBtn')}}</span>
                      </el-button>
                  </el-tooltip>
              </div>
          </div>
      </template>
      <template v-else>
          <div class="table-top">
              <el-button type="primary" size="small" @click="dialogOpenFile" :disabled="processIng">
                  <i class="my-icon my-icon-file"></i>
                  <span>{{$t('common.addVideoBtn')}}</span>
              </el-button>
              <el-tooltip :content="$t('common.addDirTip')" placement="top">
                  <el-button type="primary" size="small" @click="dialogOpenDirectory('input')" :disabled="processIng">
                      <i class="my-icon my-icon-folder"></i>
                      <span>{{$t('common.addDirBtn')}}</span>
                  </el-button>
              </el-tooltip>
              <el-button type="danger" size="small" @click="fileData=[]" :disabled="processIng">
                  <i class="my-icon my-icon-delete"></i>
                  <span>{{$t('common.clearFile')}}</span>
              </el-button>
          </div>
          <el-table
              v-loading="tableLoading"
              :data="filePageData"
              size="small"
              border
              style="width: 100%;"
              :header-cell-style="{backgroundColor:'#f5f7fa',color:'#606266'}">
              <el-table-column prop="sourcePath" :label="$t('common.sourcePath')" min-width="150px">
                  <template #default="scope">
                      <div @click="openPath(scope.row.sourcePath)" style="cursor: pointer;">{{scope.row.sourcePath}}</div>
                  </template>
              </el-table-column>
              <el-table-column prop="sourceSize" :label="$t('common.sourceSize')" min-width="80px" align="right">
                  <template #default="scope">
                      {{scope.row.sourceSize!=null?(scope.row.sourceSize/1024/1024).toFixed(2)+"MB":""}}
                  </template>
              </el-table-column>
              <el-table-column prop="sourceBitRate" :label="$t('common.sourceBitRate')" min-width="80px" align="right">
                  <template #default="scope">
                      {{scope.row.sourceBitRate!=null?(scope.row.sourceBitRate/1024).toFixed(0)+"kbps":""}}
                  </template>
              </el-table-column>
              <el-table-column prop="sourceFrameRate" :label="$t('common.sourceFrameRate')" min-width="80px" align="right">
                  <template #default="scope">
                      {{scope.row.sourceFrameRate!=null?scope.row.sourceFrameRate+"fps":""}}
                  </template>
              </el-table-column>
              <el-table-column prop="sourceResolution" :label="$t('common.sourceResolution')" min-width="90px" align="right">
                  <template #default="scope">
                      {{scope.row.sourceWidth!=null && scope.row.sourceHeight!=null?scope.row.sourceWidth+"x"+scope.row.sourceHeight:""}}
                  </template>
              </el-table-column>
              <el-table-column prop="newPath" :label="$t('common.newPath')" min-width="150px">
                  <template #default="scope">
                      <div @click="openPath(scope.row.newPath)" style="cursor: pointer;">{{scope.row.newPath}}</div>
                  </template>
              </el-table-column>
              <el-table-column prop="newSize" :label="$t('common.newSize')" min-width="80px" align="right">
                  <template #default="scope">
                      {{scope.row.newSize!=null?(scope.row.newSize/1024/1024).toFixed(2)+"MB":""}}
                  </template>
              </el-table-column>
              <el-table-column prop="newBitRate" :label="$t('common.newBitRate')" min-width="80px" align="right">
                  <template #default="scope">
                      {{scope.row.newBitRate!=null?(scope.row.newBitRate/1024).toFixed(0)+"kbps":""}}
                  </template>
              </el-table-column>
              <el-table-column prop="newFrameRate" :label="$t('common.newFrameRate')" min-width="80px" align="right">
                  <template #default="scope">
                      {{scope.row.newFrameRate!=null?scope.row.newFrameRate+"fps":""}}
                  </template>
              </el-table-column>
              <el-table-column prop="newResolution" :label="$t('common.newResolution')" min-width="90px" align="right">
                  <template #default="scope">
                      {{scope.row.newWidth!=null && scope.row.newHeight!=null?scope.row.newWidth+"x"+scope.row.newHeight:""}}
                  </template>
              </el-table-column>
              <el-table-column prop="status" :label="$t('common.status')" width="100px" fixed="right">
                  <template #default="scope">
                      <el-progress v-if="scope.row.status==1" class="progress" :text-inside="true" :stroke-width="20" :percentage="scope.row.compressPercent" text-color="#fff"></el-progress>
                      <span v-else v-html="showCompressStatus(scope.row.status)"></span>
                  </template>
              </el-table-column>
              <el-table-column width="40px" fixed="right">
                  <template #default="scope">
                    <div class="operate">
                        <i class="my-icon my-icon-cuo" :class="{'disabled': processIng}" @click="delFileData(scope)"></i>
                    </div>
                  </template>
              </el-table-column>
          </el-table>
          <div class="table-data-page">
              <el-pagination
                  background
                  layout="total, prev, pager, next"
                  :pager-count="5"
                  small
                  :total="fileData.length"
                  :page-size="pageSize"
                  :current-page="pageIndex"
                  @current-change="pageIndexChange">
              </el-pagination>
          </div>
      </template>
    </div>
    <div class="setting">
        <div class="title">{{$t('videoCompress.compressSetting')}}</div>
        <el-form :model="processOptions" :rules="processOptionsRules" ref="compressOptionsForm" label-position="top" size="small">
            <el-form-item>
                <template #label>
                    <el-tooltip :content="$t('common.taskThreadsNumberTip')" placement="top">
                        <i class="my-icon my-icon-help"></i>
                    </el-tooltip>
                    {{$t('common.taskThreadsNumber')}}
                </template>
                <el-slider class="content slider" v-model="processOptions.taskThreadsNumber" :disabled="processIng" :min="1" :max="5"></el-slider>
            </el-form-item>
            <el-form-item :label="$t('videoCompress.bitRateSettingMethod')">
                <el-select class="content" v-model="processOptions.bitRateSettingMethod" :disabled="processIng" @change="processOptions.bitRate=null;$refs['compressOptionsForm'].clearValidate('bitRate');">
                    <el-option :label="$t('videoCompress.bitRateSettingMethod1')" key="crf" value="crf"></el-option>
                    <el-option :label="$t('videoCompress.bitRateSettingMethod2')" key="bitRate" value="bitRate"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-show="processOptions.bitRateSettingMethod=='crf'">
                <template #label>
                    <el-tooltip :content="$t('videoCompress.crfTip')" placement="top">
                        <i class="my-icon my-icon-help"></i>
                    </el-tooltip>
                    {{$t('videoCompress.bitRateSettingMethod1')}}
                </template>
                <el-slider class="content slider" v-model="processOptions.crf" :disabled="processIng" :min="0" :max="51"></el-slider>
            </el-form-item>
            <el-form-item v-show="processOptions.bitRateSettingMethod=='bitRate'" prop="bitRate" :rules="{ pattern: /^[0-9]+$/, message: $t('videoCompress.bitRateTip4'), trigger: 'blur' }">
                <template #label>
                    <el-tooltip placement="top">
                        <template #content>
                          <div style="line-height: 24px;">{{$t('videoCompress.bitRateTip1')}}<br/>{{$t('videoCompress.bitRateTip2')}}</div>
                        </template>
                        <i class="my-icon my-icon-help"></i>
                    </el-tooltip>
                    {{$t('videoCompress.bitRate')}}
                </template>
                <el-input class="content" v-model="processOptions.bitRate" :disabled="processIng" :placeholder="$t('videoCompress.bitRateTip3')" clearable>
                    <template #append>
                        kbps
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item prop="frameRate">
                <template #label>
                    <el-tooltip placement="top">
                        <template #content>
                          <div style="line-height: 24px;">{{$t('videoCompress.frameRateTip1')}}<br/>{{$t('videoCompress.frameRateTip11')}}</div>
                        </template>
                        <i class="my-icon my-icon-help"></i>
                    </el-tooltip>
                    {{$t('videoCompress.frameRate')}}
                </template>
                <el-input class="content" v-model="processOptions.frameRate" :disabled="processIng" :placeholder="$t('videoCompress.frameRateTip2')" clearable>
                    <template #append>
                        fps
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item :label="$t('common.videoResolution')">
                <el-select class="content" v-model="processOptions.resolution" :disabled="processIng" :placeholder="$t('common.selectTip')">
                    <el-option v-for="(item,key) in resolutionArr" :key="key" :label="item" :value="key"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="processOptions.resolution=='custom' || processOptions.resolution=='customMax'" prop="customResolution">
                <template #label>
                    <el-tooltip placement="top">
                        <template #content>
                            <div v-if="processOptions.resolution=='custom'" style="line-height: 24px;">{{$t('common.customResolutionTip1')}}<br/>{{$t('common.customResolutionTip2')}}</div>
                            <div v-if="processOptions.resolution=='customMax'" style="line-height: 24px;">{{$t('common.customResolutionTip1')}}<br/>{{$t('common.customResolutionTip2')}}<br/>{{$t('common.customResolutionTip3')}}<br/>{{$t('common.customResolutionTip4')}}</div>
                        </template>
                        <i class="my-icon my-icon-help"></i>
                    </el-tooltip>
                    {{processOptions.resolution=='custom' ? $t('common.customResolution') : $t('common.customMaxResolution')}}
                </template>
                <div style="display: flex;">
                    <el-input class="content" 
                        v-model="processOptions.customVideoWidth" 
                        :disabled="processIng" 
                        :placeholder="processOptions.resolution=='custom' ? $t('common.width') : $t('common.maxWidth')" 
                        clearable>
                    </el-input>
                    <span style="padding:0 3px;">x</span>
                    <el-input class="content" 
                        v-model="processOptions.customVideoHeight" 
                        :disabled="processIng" 
                        :placeholder="processOptions.resolution=='custom' ? $t('common.height') : $t('common.maxHeight')" 
                        clearable>
                    </el-input>
                </div>
            </el-form-item>
            <el-form-item :label="$t('common.outDir')" prop="outputPath" :rules="{required: true, message: $t('common.selectOutputDirTip'), trigger: 'change'}">
                <el-input class="content" v-model="processOptions.outputPath" :disabled="processIng" clearable>
                    <template #append>
                        <i class="open-folder my-icon my-icon-folder" @click="dialogOpenDirectory('output')"></i>
                    </template>
                </el-input>
            </el-form-item>
        </el-form>
        <div class="bottom">
            <el-button type="primary" size="large" class="btn-process" @click="goCompress" :disabled="fileData==null || fileData.length==0 || fileCompressPercent==100">
                {{processIng?$t('videoCompress.compressStop'):$t('videoCompress.compressStart')}}
            </el-button>
        </div>
    </div>
  </div>
</template>

<script>
    import common from '../utils/common';
    import { toRaw } from '@vue/reactivity'
    export default {
        name: 'VideoCompress',
        data() {
            var checkFrameRate = (rule, value, callback) => {
                this.processOptions.frameRate = value=value!=null?value.trim():null;
                if (value!=null && value!=''){
                    value=Number(value)
                    if(isNaN(value) || !/^[0-9]+[.]?\d{0,2}$/.test(value) || value<10 || value>60){
                        callback(new Error(this.$t('videoCompress.frameRateTip3')));
                    }
                }
                callback();
            };
            var checkCustomResolution = (rule, value, callback) => {
                if (this.processOptions.customVideoWidth!=null && this.processOptions.customVideoWidth!=''){
                    if(isNaN(this.processOptions.customVideoWidth) || !/^[0-9]+$/.test(this.processOptions.customVideoWidth)){
                        callback(new Error(this.$t('common.mustBeInt')));
                    }
                }
                if (this.processOptions.customVideoHeight!=null && this.processOptions.customVideoHeight!=''){
                    if(isNaN(this.processOptions.customVideoHeight) || !/^[0-9]+$/.test(this.processOptions.customVideoHeight)){
                        callback(new Error(this.$t('common.mustBeInt')));
                    }
                }
                callback();
            };

            return {
                langRes:null,

                videoExtArr:['mp4','avi','mkv','mov','flv','swf','mpeg','mpg','ts'],

                fileData:[],
                tableLoading:false,
                pageIndex: 1,
                pageSize: 100,

                processIng:false,

                processOptions:{
                    taskThreadsNumber:2,
                    bitRateSettingMethod:'crf',
                    crf:28,
                    bitRate:null,
                    frameRate:null,
                    resolution:'source',
                    customVideoWidth:null,
                    customVideoHeight:null,
                    outputPath:'',
                },
                processOptionsRules: {
                    frameRate: [
                        { validator: checkFrameRate, trigger: 'blur' }
                    ],
                    customResolution: [
                        { validator: checkCustomResolution, trigger: 'blur' }
                    ]
                },
            }
        },
        computed:{
            filePageData(){
                return this.fileData.slice((this.pageIndex-1)*this.pageSize,this.pageIndex*this.pageSize);
            },

            fileCompressPercent(){
                if(this.fileData.length==0)
                    return 0;
                var filterData = this.fileData.filter(item => {
                    return item.status == 2 || item.status == 3
                });
                
                return parseInt((filterData.length/this.fileData.length)*100,10);
            },

            resolutionArr(){
                return {
                    "source":this.$t('common.useSourceResolution'),
                    "custom":this.$t('common.customResolution'),
                    "customMax":this.$t('common.customMaxResolution'),
                    "320x240":"320x240",
                    "480x320":"480x320",
                    "640x480":"640x480",
                    "720x404":"720x404(480P 16:9)",
                    "720x480":"720x480(480P)",
                    "720x567":"720x567",
                    "1024x576":"1024x576(16:9)",
                    "576x1024":"570x1024(9:16)",
                    "1280x720":"1280x720(720P)",
                    "720x1280":"720x1280(720P)",
                    "1920x1080":"1920x1080(1080P)",
                    "1080x1920":"1080x1920(1080P)",
                    "2560x1440":"2560x1440(2K)",
                    "1440x2560":"1440x2560(2K)",
                    "3840x2160":"3840x2160(4K)",
                    "2160x3840":"2160x3840(4K)"
                };
            }
        },
        methods: {
            toNum(str){
                if(this.isNullOrEmpty(str) || isNaN(str))
                    return null;
                else
                    return Number(str);
            },

            dialogOpenFile(){
                common.dialogOpenFile(toRaw(this.videoExtArr))
                .then(filePaths=>{
                    if(filePaths!=null && filePaths.length>0){
                        this.tableLoading=true;
                        setTimeout(()=>{
                            for(var i=0;i<filePaths.length;i++){
                                var filterData = this.fileData.filter(item => {
                                    return item.sourcePath == filePaths[i]
                                });
                                if(filterData.length>0){
                                    continue;
                                }
                                this.fileData.push({
                                    sourcePath:filePaths[i],
                                    sourceSize:null,
                                    sourceBitRate:null,
                                    sourceFrameRate:null,
                                    sourceWidth:null,
                                    sourceHeight:null,
                                    newPath:null,
                                    newSize:null,
                                    newBitRate:null,
                                    newFrameRate:null,
                                    newWidth:null,
                                    newHeight:null,
                                    status:0,
                                    compressPercent:0
                                });
                            }
                            this.tableLoading=false;
                            this.setVideoOrAudioMetaData();
                        },100);
                    }
                });
            },

            dialogOpenDirectory(dirType){
                common.dialogOpenDirectory()
                .then(dirPaths=>{
                    if(dirPaths==null || dirPaths=='')
                        return;
                    if(dirType=="output"){
                        this.processOptions.outputPath = dirPaths
                    }else if(dirType=="input"){
                        var fileData = common.getFilesFromDir(dirPaths,toRaw(this.videoExtArr));
                        if(fileData!=null && fileData.length>0){
                            this.tableLoading=true;
                            setTimeout(()=>{
                                for(var i=0;i<fileData.length;i++){
                                    var filterData = this.fileData.filter(item => {
                                        return item.sourcePath == fileData[i].filePath
                                    });
                                    if(filterData.length>0){
                                        continue;
                                    }
            
                                    this.fileData.push({
                                        sourcePath:fileData[i].filePath,
                                        sourceSize:null,
                                        sourceBitRate:null,
                                        sourceFrameRate:null,
                                        sourceWidth:null,
                                        sourceHeight:null,
                                        newPath:null,
                                        newSize:null,
                                        newBitRate:null,
                                        newFrameRate:null,
                                        newWidth:null,
                                        newHeight:null,
                                        status:0,
                                        compressPercent:0
                                    });
                                }
                                this.tableLoading=false;
                                this.setVideoOrAudioMetaData();
                            },100);
                        }
                    }
                });
            },

            //异步获取媒体参数，防止页面卡顿
            setVideoOrAudioMetaData(){
                var filterData = this.fileData.filter(item => {
                    return item.sourceSize == null
                });
                function* gengeratorFun() {
                    for (var i=0;i<filterData.length;i++) {
                        yield getMediaMetaData(filterData[i].sourcePath);
                    }
                }
                
                var getMediaMetaData = (filePath)=>{
                    var curData = this.fileData.filter(item => {
                        return item.sourcePath == filePath
                    });
                    if(curData.length==0){
                        console.log('empty');
                        var emptyData = this.fileData.filter(item => {
                            return item.sourceSize == null
                        });
                        if(emptyData.length>0){
                            setTimeout(() => {
                                gf.next();
                            }, 30);
                        }
                    }else{
                        common.getMediaMetaData(filePath,(metaData)=>{
                            try{
                                curData[0].sourceSize=metaData.format.size;
                                curData[0].sourceBitRate=metaData.format.bit_rate;
                                for(var k=0;k<metaData.streams.length;k++){
                                    if(metaData.streams[k].codec_type=='video'){
                                        curData[0].sourceFrameRate=Number(eval(metaData.streams[k].r_frame_rate).toFixed(0));
                                        curData[0].sourceWidth=metaData.streams[k].width;
                                        curData[0].sourceHeight=metaData.streams[k].height;
                                        break;
                                    }
                                }
                            }catch(e){
                                console.log(e);
                            }
                            gf.next();
                        });
                    }
                }

                var gf = gengeratorFun();
                gf.next();
            },

            showCompressStatus(status){
                if(status==0){
                    return this.$t('videoCompress.unCompress');
                }else if(status==1){
                    return "<span style='color:var(--el-color-primary-dark-2)'>"+this.$t('videoCompress.processIng')+"</span>";
                }else if(status==2){
                    return "<span style='color:var(--el-color-primary)'>"+this.$t('videoCompress.compressSuccess')+"</span>";
                }else if(status==3){
                    return "<span style='color:var(--el-color-danger)'>"+this.$t('videoCompress.compressFail')+"</span>";
                }
            },

            pageIndexChange(e) {
                this.pageIndex = e;
            },

            delFileData(scope){
                if(this.processIng){
                    return;
                }
                var rowIndex=(this.pageIndex-1)*this.pageSize+scope.$index;
                this.fileData.splice(rowIndex,1);
            },

            renameForNewFile(filePath){
                if(common.fileExists(filePath)){
                    return this.renameForNewFile(filePath.replace(".","(1)."));
                }
                return filePath;
            },

            killCompressVideoCommand(){
                common.killCompressVideoCommand();
                this.processIng=false;
                var filterData = this.fileData.filter(item => {
                    return item.status == 1
                });
                for(var i=0;i<filterData.length;i++){
                    filterData[i].status=0;
                    filterData[i].compressPercent=0;
                }

                setTimeout(() => {
                    for(var i=0;i<filterData.length;i++){
                        if(!this.isNullOrEmpty(filterData[i].newTmpPath)){
                            common.deleteFile(filterData[i].newTmpPath);
                            filterData[i].newTmpPath=null;
                        }
                    }
                }, 1000);
            },

            goCompress(){
                if(this.fileCompressPercent==100)
                    return;
                if(this.processIng){
                    this.killCompressVideoCommand();
                    return;
                }
                
                this.$refs['compressOptionsForm'].validate((valid) => {
                    if (valid) {
                        this.processIng=true;
                        this.compressStart();
                    }
                });
            },

            compressStart(){
                for(var i=0;i<this.fileData.length;i++){
                    if(!this.processIng)
                        return;
                    
                    var filterData = this.fileData.filter(item => {
                        return item.status == 1
                    });
                    if(filterData.length==this.processOptions.taskThreadsNumber){
                        return;
                    }

                    if(this.fileData[i].status!=0){
                        continue;
                    }

                    ((j)=>{
                        var outputPath=this.processOptions.outputPath.replace(/\\/g,"/");
                        if(outputPath.length==outputPath.lastIndexOf("/")+1){
                            outputPath=outputPath.substr(0,outputPath.length-1);
                        }
                        var sourcePath = this.fileData[j].sourcePath.replace(/\\/g,"/");
                        outputPath=outputPath+sourcePath.substr(sourcePath.lastIndexOf('/'));
                        outputPath=this.renameForNewFile(outputPath);
        
                        this.fileData[j].status=1;
                        this.fileData[j].newTmpPath=outputPath;
        
                        //Compression parameter settings
                        var processOptions={
                            crf:this.processOptions.crf,
                            bitRate:this.toNum(this.processOptions.bitRate),
                            frameRate:this.toNum(this.processOptions.frameRate)
                        };
                        if(this.processOptions.bitRateSettingMethod=='crf'){
                            processOptions.crf=this.processOptions.crf;
                            processOptions.bitRate = null;
                        }else{
                            processOptions.crf=null;
                            if(processOptions.bitRate!=null && processOptions.bitRate>this.fileData[j].sourceBitRate/1024){
                                processOptions.bitRate = parseInt(this.fileData[j].sourceBitRate/1024,10);
                            }
                        }
                        if(processOptions.frameRate!=null && processOptions.frameRate>this.fileData[j].sourceFrameRate){
                            processOptions.frameRate = this.fileData[j].sourceFrameRate;
                        }

                        //根据用户设置的分辨率设置视频宽高
                        var videoWidth=this.fileData[j].sourceWidth;
                        var videoHeight=this.fileData[j].sourceHeight;
                        if(this.processOptions.resolution=='custom' || this.processOptions.resolution=='customMax'){
                            if (this.processOptions.customVideoWidth!=null && this.processOptions.customVideoWidth!='')
                                videoWidth=Number(this.processOptions.customVideoWidth);
                            if (this.processOptions.customVideoHeight!=null && this.processOptions.customVideoHeight!='')
                                videoHeight=Number(this.processOptions.customVideoHeight);
                            if(videoWidth!=null && videoHeight==null)
                                videoHeight=parseInt(this.fileData[j].sourceHeight/this.fileData[j].sourceWidth*videoWidth,10);
                            if(videoWidth==null && videoHeight!=null)
                                videoWidth=parseInt(this.fileData[j].sourceWidth/this.fileData[j].sourceHeight*videoHeight,10);

                            if(this.processOptions.resolution=='customMax'){
                                if(this.fileData[j].sourceWidth > videoWidth || this.fileData[j].sourceHeight > videoHeight){
                                    if (this.fileData[j].sourceWidth/this.fileData[j].sourceHeight > videoWidth/videoHeight){
                                        videoHeight = parseInt(this.fileData[j].sourceHeight / this.fileData[j].sourceWidth * videoWidth, 10);
                                    }else{
                                        videoWidth = parseInt(this.fileData[j].sourceWidth / this.fileData[j].sourceHeight * videoHeight, 10);
                                    }
                                }else{
                                    videoWidth = this.fileData[j].sourceWidth;
                                    videoHeight = this.fileData[j].sourceHeight;
                                }
                            }
                        }else if(this.processOptions.resolution!='source'){
                            var resolutionArr = this.processOptions.resolution.split('x');
                            videoWidth=Number(resolutionArr[0]);
                            videoHeight=Number(resolutionArr[1]);
                        }
                        if(videoWidth==this.fileData[j].sourceWidth && videoHeight==this.fileData[j].sourceHeight){ //分辨率未改变时赋null值，让ffmpeg不处理分辨率
                            videoWidth=null;
                            videoHeight=null;
                        }
                        processOptions.videoWidth=videoWidth;
                        processOptions.videoHeight=videoHeight;

                        common.compressVideo(this.fileData[j].sourcePath, outputPath, processOptions,(progress)=>{
                            if(!this.isNullOrEmpty(progress.percent) && !isNaN(progress.percent))
                                this.fileData[j].compressPercent=Number(progress.percent.toFixed(1));
                        },()=>{
                            this.fileData[j].status=2;
                            this.fileData[j].newPath=outputPath;
                            this.fileData[j].newTmpPath=null;
                            this.compressStart();
                            this.compressOver();
                            common.getMediaMetaData(outputPath,(metaData)=>{
                                this.fileData[j].newSize=metaData.format.size;
                                this.fileData[j].newBitRate=metaData.format.bit_rate;
                                for(var k=0;k<metaData.streams.length;k++){
                                    if(metaData.streams[k].codec_type=='video'){
                                        this.fileData[j].newFrameRate=Number(eval(metaData.streams[k].r_frame_rate).toFixed(0));
                                        this.fileData[j].newWidth=metaData.streams[k].width;
                                        this.fileData[j].newHeight=metaData.streams[k].height;
                                        break;
                                    }
                                }
                                console.log(metaData)
                            });
                        },()=>{
                            if(!this.processIng)
                                return;
                            common.deleteFile(this.fileData[j].newTmpPath);
                            this.fileData[j].newTmpPath=null;
                            this.fileData[j].status=3;
                            this.compressStart();
                            this.compressOver();
                        });
                    })(i);
                }
            },

            compressOver(){
                if(this.fileCompressPercent==100){
                    setTimeout(() => {
                        this.$alert(this.$t('videoCompress.compressOver'), this.$t('common.tip'), {
                            confirmButtonText: this.$t('common.ok'),
                            callback: action => {
                                this.processIng=false;
                            }
                        });
                    }, 800);
                }
            },

            openPath(url){
                common.openPath(url);
            }
        }
    }
</script>