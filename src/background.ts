/* eslint-disable */
'use strict';

import {
  app, protocol, BrowserWindow, globalShortcut,
} from 'electron';
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';
import * as mm from 'music-metadata';
const Menu = require('electron-create-menu');
const { autoUpdater } = require("electron-updater")
const { ipcMain } = require('electron');
const NodeID3 = require('node-id3')

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 991,
    height: 768,
    minWidth: 320,
    minHeight: 480,
    webPreferences: {
      nodeIntegration: true,
    },
    frame: false,
    show: false,
    transparent: true,
    darkTheme: true,
    vibrancy: 'dark',
  });

  win.once('ready-to-show', () => {
    if (win) {
      win.show();
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
  Menu((defaultMenu: Array<any>, separator: Function) => {
    // console.log('menu', defaultMenu[0].submenu);
    if (!isDevelopment) {
      const newMenu = [defaultMenu[0]];
      newMenu[0].submenu[0] = { label: 'About' };
      return newMenu;
    }

    // defaultMenu.push({
    //   label: 'My custom menu!',
    //   submenu: [
    //     { label: 'my first item' },
    //     separator(),
    //     { label: 'my second item' },
    //   ],
    // });

    return defaultMenu;
  });
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools();
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString());
    // }
  }

  ipcMain.on('readFileRequest', (event, arg, cid) => {
    mm.parseFile(arg, { native: true })
      .then(metadata => {
        event.sender.send(`readFileResponse-${cid}`, metadata)
      })
      .catch(err => {
        console.error(err.message);
      });
  })

  ipcMain.on('writeFileRequest', (event, track, cid) => {
    const newTrack = { ...track }
    newTrack.tags.image = {
      mime: track.tags.picture[0].format,
      type: {
        id: 3,
        name: 'front cover',
      },
      description: track.tags.picture[0].description,
      imageBuffer: track.tags.picture[0].data,
    };
      
      NodeID3.write(track.tags, track.path, function(err, buffer) { 
        if (err) console.log('error wrinting tags', err);
        event.sender.send(`writeFileResponse-${cid}`, buffer);
       }) 
  })


  globalShortcut.register('MediaPlayPause', () => {
    if (win) {
      win.webContents.send('asynchronous-message', 'MediaPlayPause');
    }
  });
  globalShortcut.register('MediaStop', () => {
    if (win) {
      win.webContents.send('asynchronous-message', 'MediaStop');
    }
  });
  globalShortcut.register('MediaPreviousTrack', () => {
    if (win) {
      win.webContents.send('asynchronous-message', 'MediaPreviousTrack');
    }
  });
  globalShortcut.register('MediaNextTrack', () => {
    if (win) {
      win.webContents.send('asynchronous-message', 'MediaNextTrack');
    }
  });

  createWindow();
});

//auto updater

function sendStatusToWindow(text: String) {
  if (win) {
    win.webContents.send('message', text);
  }
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', () => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', () => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err: any) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj: any) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', () => {
  sendStatusToWindow('Update downloaded');
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
