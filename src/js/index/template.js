import { id, getTemplate, $ } from "../libs/helpers.js"

const applyProjectTemplate = (
		{ src, title, alt = "", file },
		template = getTemplate("project-template")
	) => {
		const image = template.querySelector(".image")
		image.setAttribute("src", src)
		image.setAttribute("alt", alt)
		image.classList.remove("-preload")

		template.setAttribute("href", `editor.html?file=${file}`)

		const newTitle = template.querySelector(".title")
		newTitle.textContent = title
		newTitle.classList.remove("-preload")

		return template
	},
	renderProject = (project) => {
		let root = id("project-selector"),
			preloadProject = $("#project-selector > .project.-preload")

		if (preloadProject.length)
			replacePreloadProject(project, preloadProject[0])
		else root.appendChild(applyProjectTemplate(project))
	},
	replacePreloadProject = (project, preload) => {
		preload.classList.remove("-preload")
		preload.querySelector(".figure").classList.remove("-preload")
		preload.querySelector(".image").style.display = ""
		preload.setAttribute("href", `editor.html?file=${project.file}`)

		applyProjectTemplate(project, preload)
	},
	cleanupPreload = () => {
		let preloadProject = $("#project-selector > .project.-preload")

		preloadProject.forEach((preload) => {
			preload.parentElement.removeChild(preload)
		})
	}

export const showAvailableProject = (projectList) => {
	projectList.forEach((project) => {
		renderProject(project)
	})
	cleanupPreload()
}
