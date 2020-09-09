import { getFileName } from "./helpers.js"

const remote = require("electron").remote,
	fs = remote.require("fs"),
	basepath = remote.app.getAppPath()

export const save = () => {
	if (!fs.existsSync(`${basepath}/generated`))
		fs.mkdirSync(`${basepath}/generated`)

	if (!fs.existsSync(`${basepath}/generated/content`))
		fs.mkdirSync(`${basepath}/generated/content`)

	fs.writeFileSync(
		`${basepath}/generated/content/${getFileName()}`,
		JSON.stringify(global.liliya.structure)
	)
}

export const merge = (newValue, index) => {
	let structure = global.liliya.structure

	structure = Object.assign(structure.content, {
		[index]: Object.assign(
			typeof structure.content[index] !== "undefined"
				? structure.content[index]
				: {},
			newValue
		)
	})

	structure = Object.assign(global.liliya.structure, {
		content: structure
	})

	global.liliya.structure = structure
	save()
}

export const getStructure = () => {
	if (!fs.existsSync(`${basepath}/generated`))
		fs.mkdirSync(`${basepath}/generated`)

	if (!fs.existsSync(`${basepath}/generated/content`))
		fs.mkdirSync(`${basepath}/generated/content`)

	return JSON.parse(
		fs.readFileSync(`${basepath}/generated/content/${getFileName()}`)
	)
}
