const { app, BrowserWindow, remote } = require('electron');
const { Notification } = require('electron');

var createWindow = function() {
	const win = new BrowserWindow({
		width: 1,
		height: 1,
		webPreferences: {
      nodeIntegration: true,
      // https://www.electronjs.org/docs/api/webview-tag
      webviewTag: true, // Security warning since Electron 10
      zoomFactor: 1.0,
      enableRemoteModule: true,
		}
	})
	win.maximize();
	win.loadFile('index.html');
	win.loadURL('file://' + __dirname + '/index.html');
	//win.loadURL('https://naver.com');
	
	// Once did-navigate seems to function fine
	win.webContents.once('did-navigate', function(){
//		setTimeout(function(){
//		var execSync = require('child_process').execSync;
//		execSync('mouse_pos_test.ahk',);
//		console.log("된당");	
//		}, 3000)
	//Do Anything;		
	});

	win.webContents.openDevTools();
	
}

app.whenReady().then(createWindow)

app.on('window-all-closed', function(){
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function(){
	if (BrowserWindow.getAllWindows().length === 0) {
		
		createWindow();
	}
})
