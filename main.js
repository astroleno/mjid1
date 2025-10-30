const { app, BrowserWindow } = require('electron');
const path = require('path');

// 保持对窗口对象的全局引用，避免被垃圾回收
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    // 全屏模式，提供沉浸式体验
    fullscreen: true,
    // 无边框窗口
    frame: false,
    // 窗口图标
    icon: path.join(__dirname, 'dist/favicon/favicon.ico'),
    // 窗口显示前不显示
    show: false,
    // 窗口标题
    title: 'DistortionScroll - 诗意变形效果'
  });

  // 加载构建后的HTML文件
  mainWindow.loadFile('dist/index.html');

  // 窗口准备好后显示，避免白屏
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 开发环境下打开开发者工具
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // 当窗口被关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 处理窗口关闭事件
  mainWindow.on('close', (event) => {
    // 在macOS上，应用通常保持激活状态直到用户明确退出
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(createWindow);

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，应用通常保持激活状态直到用户明确退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当点击dock图标且没有其他窗口打开时，重新创建窗口
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 安全设置：防止新窗口创建
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

// 处理证书错误
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // 对于本地文件，忽略证书错误
  if (url.startsWith('file://')) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
