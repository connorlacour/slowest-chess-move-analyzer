import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 700,
    minHeight: 600,
    backgroundColor: '#0e0e0e',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: join(__dirname, '../../resources/icon.png'),
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Open external links in the system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    const rendererUrl = process.env['ELECTRON_RENDERER_URL']
    const isDevServer = rendererUrl && url.startsWith(rendererUrl)
    const isLocal = url.startsWith('file://')
    if (!isDevServer && !isLocal) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })
}

app.whenReady().then(() => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
