const { app, BrowserWindow } = require('electron');

let window;

function createWindow() {
  window = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#FFFFFF',
    // icon: `file://${__dirname}/dist/assets/logo.png`
  });

  window.loadURL(`file://${__dirname}/dist/index.html`);
  // window.webContents.openDevTools();

  window.on('closed', function() {
    window = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (window === null) {
    createWindow();
  }
});
