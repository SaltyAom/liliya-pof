import { fs } from './libs/node.js'
import { content as contentPath, composeContent } from './libs/directory.js'
import { onReady, id } from './libs/helpers.js'

import { showAvailableProject } from './index/template.js'
import generateProject from './index/generate.js'

onReady(() => {
	if (!fs.existsSync(contentPath)) fs.mkdirSync(contentPath)

	let content = fs.readdirSync(contentPath)

	let blacklist = ['.DS_Store']

	let projectList = content
		.filter(file => !blacklist.includes(file))
		.map(file => {
			let project = JSON.parse(
				fs.readFileSync(composeContent(file), {
					encoding: 'utf8'
				})
			)

			return {
				...project.header,
				file
			}
		})

	showAvailableProject(projectList)

	id('new-project').addEventListener('click', () => {
		fs.writeFileSync(
			composeContent(`${projectList.length}.json`),
			JSON.stringify({
				header: {
					title: 'My Awesome Project!'
				},
				content: [
					{
						nodeName: 'h1',
						textContent: 'Hello World'
					}
				]
			})
		)

		let anchor = document.createElement('a')
		anchor.href = `editor.html?file=${projectList.length}.json`

		anchor.click()
	})

	id('generate-project').addEventListener('click', generateProject)
})
