const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack');
module.exports = defineConfig({
  runtimeCompiler: true,
  transpileDependencies: true,
  pluginOptions: { 
    electronBuilder: {
      nodeIntegration: true,
      webSecurity: false,
      builderOptions: {
        productName: `Video compress`,
        appId: 'net.toollist.videocompressor',
        asar: true,
        linux: {
          target: ['deb'],
          category: 'Utility',
          icon: './resources/icons/icon'
        },
        mac: {
          icon: './resources/icons/icon.icns'
        },
        win: {
          target: [{
            target: 'nsis'
          }],
          icon: './resources/icons/icon.ico'
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          perMachine: true,
          allowElevation: true,
          runAfterFinish: true,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          deleteAppDataOnUninstall: true,
        },
        extraResources: {
          // 拷贝静态文件到指定位置,否则打包之后出现找不到资源的问题.将整个resources目录拷贝到发布的根目录下
          // 获取静态资源路径方式：process.env.NODE_ENV !== 'production'?'./resources/xxx':process.resourcesPath + '/xxx'
          from: './resources/',
          to: './'
        }
      }
    }
  },
  configureWebpack: {
    plugins: [
      //运行时fluent-ffmpeg报错解决方案
      new webpack.DefinePlugin({
        'process.env.FLUENTFFMPEG_COV': false
      })
    ]
  }
})
