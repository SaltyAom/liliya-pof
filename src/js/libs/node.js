export const remote = require("electron").remote,
	fs = remote.require("fs"),
	basepath = remote.app.getAppPath()

export const removeDirectory = (path) => {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(file => {
			const curPath = `${path}/${file}`
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				removeDirectory(curPath)
			} else {
				// delete file
				fs.unlinkSync(curPath)
			}
		})
		fs.rmdirSync(path)
	}
}
