const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

<<<<<<< HEAD
    win.loadFile('index.html');
=======
    win.loadFile(path.join(__dirname, 'views/index.html'));
>>>>>>> 3362f3b (Made massive changes, created seperate directy for files added navbar, login, register, need some designing)
}

app.whenReady().then(createWindow);
