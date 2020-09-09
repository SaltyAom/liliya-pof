const { app, BrowserWindow } = require("electron")
const { join } = require("path")

let mainWindow

const createWindow = async () => {
	mainWindow = new BrowserWindow({
		width: 960,
		height: 640,
        webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		},
		minWidth: 960,
		minHeight: 640,
		titleBarStyle: "hiddenInset"
    })

	// mainWindow.loadFile(join(__dirname, "build/index.html"))
	mainWindow.loadFile(join(__dirname, "src/index.html"))

	mainWindow.on("closed", () => {
		mainWindow = null
	})
}

app.on("ready", () => {
	createWindow()
})

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow()
})
