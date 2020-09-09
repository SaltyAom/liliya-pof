export const id = (id) => document.getElementById(id),
	$ = (tag) => document.querySelectorAll(tag),
	onReady = (callback) =>
		document.addEventListener("DOMContentLoaded", callback),
	getTemplate = (id) => {
		let template = document.getElementById(id)

		return template.content.cloneNode(true)
	},
	select = (tag) => document.querySelector(tag),
	getFileName = () => {
		let url = new URLSearchParams(window.location.search)

		return url.get("file")
	},
	getIndex = (element) =>
		Array.from(element.parentElement.children).indexOf(element),
	pushObject = (object, index, newValue) =>
		object.splice(index + 1, 0, newValue),
	removeObject = (object, index) => object.splice(index, 1),
	generateHash = () => Math.random().toString(36).substring(7),
	imageToFigure = (element) =>
		element.nodeName === "IMG" ? event.target.parentElement : event.target,
	figureToImage = (element) =>
		element.nodeName === "FIGURE"
			? element
			: element.nodeName.querySelector(".img")
