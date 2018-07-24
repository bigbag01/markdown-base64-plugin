const {app, BrowserWindow, Tray, Menu} = require('electron')
const clipboardWatcher = require('electron-clipboard-watcher')
const path = require('path')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let appTray

function createWindow (width,height) {
  if (mainWindow!=null){
    mainWindow.close();
  }
  mainWindow = new BrowserWindow({
    width: width?width:300,
    height: height?height:300,
    titleBarStyle: 'hidden'
  })
  mainWindow.loadURL("file://"+path.join(__dirname,'index.html'));

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

// 监听剪贴板事件，对于图片，显示出来。
const watcher = clipboardWatcher({
    onImageChange: function (nativeImage) {
        mainWindow.setSize(nativeImage.getSize().width,nativeImage.getSize().height)
        mainWindow.webContents.send('imageChange', nativeImage.toDataURL());
    },
})

// dock栏不显示
app.dock.hide();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
  appTray = new Tray(path.join(__dirname, 'preview.png'))
  const contextMenu=Menu.buildFromTemplate([{
      label:'show preview',
      click:function(){
          if(mainWindow!=null){
              mainWindow.show();
          }else{
              createWindow()
          }
      }
  },{
    label:'quit',
    click:function(){
      appTray.destroy();
      app.quit();
    }
  }])
  appTray.setContextMenu(contextMenu);
  createWindow();
})

// 窗口关闭应用不退出
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

// 打开应用激活窗口
app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})

app.on('before-quit',function(){
  appTray.destroy();
})
