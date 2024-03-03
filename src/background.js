'use strict'

import { app, protocol, BrowserWindow, dialog, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1150,
    minWidth: 950,
    height: 750,
    minHeight: 650,
    icon: isDevelopment?'./resources/icons/icon.ico':process.resourcesPath + '/icons/icon.ico', 
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })
  
  win.setMenu(null)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS3_DEVTOOLS)
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e.toString())
  //   }
  // }
  
  ipcMain.on('getLocale', (event) => {
    event.returnValue = app.getLocale()
  })
  
  ipcMain.handle('dialog:openFile', async (event, extnameArr, multiSelections) => {
    var properties=['openFile'];
    if(multiSelections==null || multiSelections)
        properties.push('multiSelections');
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: properties,
        filters:[
            { name: 'Extensions', extensions: extnameArr }
        ]
    })
    if (!canceled) {
        return filePaths
    }
  })

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if (!canceled) {
        return filePaths[0]
    }
  })

  ipcMain.handle('dialog:saveFile', async (event, extnameArr) => {
    var filters=[];
    extnameArr.forEach(item => {
        filters.push({
            name:item.toLocaleUpperCase(),
            extensions:[item]
        });
    });
    const { canceled, filePath } = await dialog.showSaveDialog({
        filters:filters
    })
    if (!canceled) {
        return filePath
    }
  })

  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
