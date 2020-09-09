import {
	id,
	getTemplate,
	getIndex,
	imageToFigure,
	pushObject,
	removeObject
} from "../libs/helpers.js"

import rearrange from "./rearrange.js"
import { merge, save } from "../libs/structure.js"
import { showTools } from "./tools.js"

const buildTitle = (node) => {
		/* Build */
		let { nodeName, textContent } = node,
			editor = id("editor"),
			element = document.createElement(nodeName)

		element.classList.add(nodeName)
		element.setAttribute("contenteditable", "true")

		/* Event Listener */
		let content = global.liliya.structure.content

		element.addEventListener("focus", (event) =>
			showTools(getIndex(event.target))
		)

		element.addEventListener("keydown", (event) => {
			let index = getIndex(event.target)

			if (event.key === "Enter") {
				event.preventDefault()

				pushObject(content, index, {
					nodeName: "p",
					textContent: ""
				})

				editor.insertBefore(
					build({
						nodeName: "p",
						textContent: ""
					}),
					editor.children[index + 1]
				)

				requestAnimationFrame(() => {
					id("editor").children[index + 1].focus()
				})
			}

			if (
				event.key === "Backspace" &&
				event.target.textContent.length === 0
			) {
				event.preventDefault()

				removeObject(content, index)

				element.removeEventListener("blur", saveInput)
				editor.removeChild(event.target)

				try {
					id("editor").children[index - 1].focus()
					showTools(index - 1)
				} catch (err) {
					id("toolbar").style.top = "-100px"
				} finally {
					save()
				}
			}
		})

		element.addEventListener("paste", (event) => {
			event.preventDefault()

			let text = (event.originalEvent || event).clipboardData.getData(
				"text/plain"
			)

			document.execCommand("insertHTML", false, text)
		})

		const saveInput = (event) => {
			let index = getIndex(event.target)

			merge(
				{
					textContent: event.target.textContent
				},
				index
			)
		}

		element.addEventListener("blur", saveInput)

		element.addEventListener("mousedown", (event) => {
			rearrange({ event, node })
		})

		element.textContent = textContent

		return element
	},
	buildText = (node) => {
		/* Build */
		let { children, textContent } = node,
			editor = id("editor"),
			element = document.createElement("p")

		element.classList.add("p")
		element.setAttribute("contenteditable", "true")
		element.setAttribute("spellcheck", "false")

		/* Event Listener */
		let content = global.liliya.structure.content

		element.addEventListener("focus", (event) =>
			showTools(getIndex(event.target))
		)

		element.addEventListener("keydown", (event) => {
			let index = getIndex(event.target)

			if (event.key === "Enter") {
				event.preventDefault()

				pushObject(content, index, {
					nodeName: "p",
					children: []
				})

				editor.insertBefore(
					build({
						nodeName: "p",
						children: []
					}),
					editor.children[index + 1]
				)

				requestAnimationFrame(() => {
					id("editor").children[index + 1].focus()
				})
			}

			if (
				event.key === "Backspace" &&
				event.target.textContent.length === 0
			) {
				event.preventDefault()

				removeObject(content, index)

				element.removeEventListener("blur", saveInput)
				editor.removeChild(event.target)

				try {
					id("editor").children[index - 1].focus()
					showTools(index - 1)
				} catch (err) {
					id("toolbar").style.top = "-100px"
				} finally {
					save()
				}
			}
		})

		element.addEventListener("paste", (event) => {
			event.preventDefault()

			let text = (event.originalEvent || event).clipboardData.getData(
				"text/plain"
			)

			document.execCommand("insertHTML", false, text)
		})

		const saveInput = (event) => {
			let index = getIndex(event.target),
				children = []

			// parse html
			let textContent = `${event.target.innerHTML}`.split(/\<\a|\<\/a\>/g)

			textContent.forEach((node) => {
				// console.log(node)
				let classFound = node.match(/class=\"\w\"/)

				if (classFound === null) return children.push(node)

				let nodeName = classFound[0]
						.replace("class=", "")
						.replace(/\"/g, ""),
					textContent = node.split(">")[node.split(">").length - 1]

				return children.push({
					nodeName,
					textContent
				})
			})

			merge(
				{
					textContent: event.target.textContent,
					children
				},
				index
			)
		}

		element.addEventListener("blur", saveInput)

		element.addEventListener("mousedown", (event) => {
			rearrange({ event, node })
		})

		if (typeof children !== "undefined")
			children.forEach((child) => {
				let built

				if (typeof child.nodeName === "undefined")
					built = document.createTextNode(child)
				else
					switch (child.nodeName) {
						case "a":
							built = buildLink(child)

							break

						default:
							document.createTextNode(child)
							break
					}

				element.appendChild(built)
			})
		else element.textContent = textContent

		return element
	},
	buildLink = (node) => {
		let link = document.createElement("a")

		link.classList.add("a")
		link.setAttribute("href", node.href || "")
		link.textContent = node.textContent

		let hover = false

		link.addEventListener("mouseover", (event) => {
			/* Throttle */
			hover = true

			setTimeout(() => {
				if (!hover) return

				global.liliya.focusedNode = getIndex(event.target.parentElement)
				global.liliya.focusedChildNode = Array.from(
					event.target.parentElement.childNodes
				).indexOf(event.target)

				let tools = id("link-tools")

				tools.style.top = event.target.offsetTop - 32
				tools.style.left =
					event.target.offsetLeft + (window.innerWidth / 2 - 320) - 20
			}, 500)
		})

		link.addEventListener("mouseleave", () => {
			hover = false
		})

		return link
	},
	buildImage = (node) => {
		/* Build */
		let { src, alt = "" } = node

		let imageTemplate = getTemplate("image-template").cloneNode(true)

		let image = imageTemplate.querySelector(".img")

		image.setAttribute("src", src)
		image.setAttribute("alt", alt)

		/* Event Listener */
		let _showTools = (event) => {
			let index = getIndex(imageToFigure(event.target))

			showTools(index)
		}

		imageTemplate
			.querySelector(".figure")
			.addEventListener("focus", _showTools)
		imageTemplate
			.querySelector(".figure")
			.addEventListener("click", _showTools)

		imageTemplate
			.querySelector(".figure")
			.addEventListener("dblclick", (event) => {
				let index = getIndex(imageToFigure(event.target))

				id("image-selector-overlay").style.display = "flex"
				global.liliya.selectedImageNode = index
			})

		imageTemplate
			.querySelector(".figure")
			.addEventListener("mousedown", (event) => {
				rearrange({ event, node })
			})

		return imageTemplate
	}

export const build = (node) => {
		let built

		switch (node.nodeName) {
			case "h1":
			case "h2":
				built = buildTitle(node)
				break

			case "p":
				built = buildText(node)
				break

			case "img":
				built = buildImage(node)
				break
		}

		return built
	},
	updateEditor = (callback = () => null) => {
		let structure = global.liliya.structure,
			content = structure.content,
			editor = id("editor")

		// Diffing algorithm
		content.forEach((node, index) => {
			if (node === null) return

			if (index >= editor.childElementCount)
				return editor.appendChild(build(node))

			let { nodeName, ...properties } = node

			let childToBeReplaced = editor.children[index],
				childNodeName = childToBeReplaced.nodeName.toLowerCase()

			if (
				nodeName === "p" &&
				node.children.length === childToBeReplaced.childElementCount
			)
				return editor.replaceChild(build(node), childToBeReplaced)

			if (
				(nodeName !== "p" && childNodeName == nodeName) ||
				(childNodeName === "figure" && nodeName === "img")
			) {
				if (childNodeName === "figure")
					childToBeReplaced = childToBeReplaced.querySelector(".img")

				return Object.keys(properties).forEach((key) => {
					let value = properties[key]

					if (key === "textContent" && nodeName !== "figure")
						return childToBeReplaced.textContent !== value
							? (childToBeReplaced.textContent = value)
							: null

					if (childToBeReplaced.getAttribute(key) !== value)
						childToBeReplaced.setAttribute(key, value)
				})
			}

			editor.replaceChild(build(node), childToBeReplaced)
		})

		/* Clean up */
		while (editor.children[content.length - 1].nextElementSibling)
			editor.removeChild(editor.children[content.length - 1])

		callback()
	}
