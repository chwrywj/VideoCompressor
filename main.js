const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path');

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 800,
        //show: false,
        icon: path.join(__dirname,"./src/img/icon.png"),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
    })
    
    // mainWindow.maximize()
    // mainWindow.show()

    mainWindow.setMenu(null)

    mainWindow.loadFile('src/index.html')

    //mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.whenReady().then(() => {
    ipcMain.handle('getLocale', () => {
        //return "de";
        return app.getLocale()
    })

    ipcMain.handle('dialog:openFile', async (event, extnameArr) => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters:[
                { name: 'Movies', extensions: extnameArr }
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
	
    createWindow()

    app.on('activate', function () {
        if (mainWindow === null) {
            createWindow()
        }
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})