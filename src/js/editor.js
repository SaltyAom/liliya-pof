import { fs } from "./libs/node.js"
import {
	onReady,
	id,
	select,
	getIndex,
	pushObject,
	removeObject
} from "./libs/helpers.js"
import { composeAssets } from "./libs/directory.js"

import { updateEditor, build } from "./editor/builder.js"
import appendToImageSelector, {
	removeAllImages
} from "./editor/image-selector.js"
import { save, getStructure, merge } from "./libs/structure.js"
import { showTools } from "./editor/tools.js"

import {
	getAllImages,
	searchImage,
	applyImages
} from "./editor/search-image.js"

global.liliya = {}
global.liliya.structure = getStructure()
global.liliya.focusedNode = null
global.liliya.focusedChildNode = null
global.liliya.selectedImageNode = null
global.liliya.changeOGImage = false

onReady(() => {
	/* Initial */
	let structure = global.liliya.structure

	updateEditor()
	id("title").textContent = structure.header.title
	id("og-image").setAttribute("src", structure.header.src)
	id("og-image").setAttribute("alt", structure.header.alt)

	/* Window Listener */
	let selecting = false,
		selectedContent = null,
		selectedText = null,
		childIndex = null

	let onSelected = (event) => {
		document.removeEventListener("mouseup", onSelected)
		selecting = false

		id("selector-tools").style.top = -100

		let { type, baseOffset, extentOffset } = document.getSelection()

		if ((type === "Range" && !extentOffset) || type !== "Range") return

		let index = getIndex(event.srcElement)

		// Hositing
		selectedContent = structure.content[index]

		if (
			typeof selectedContent === "undefined" ||
			selectedContent.nodeName !== "p"
		)
			return

		let { left } = document
			.getSelection()
			.getRangeAt(0)
			.getBoundingClientRect()

		/* Get Selection */
		let { children } = selectedContent

		// Hositing
		selectedText = window.getSelection().toString()

		children.find((node, index) => {
			let text = typeof node === "string" ? node : node.textContent

			if (text.slice(baseOffset, extentOffset) === selectedText)
				// Hositing
				return (childIndex = index)
		})

		if (childIndex === null) return

		let selectorTool = id("selector-tools")

		selectorTool.style.top = id("editor").children[index].offsetTop - 22
		selectorTool.style.left = left
	}

	document.addEventListener("selectionchange", () => {
		if (!selecting) document.addEventListener("mouseup", onSelected)

		selecting = true
	})

	id("link-tools").addEventListener("mouseover", (event) => {
		let tools = event.target

		tools.style.top = tools.offsetTop
		tools.style.left = tools.offsetLeft
	})

	id("link-tools").addEventListener("mouseleave", (event) => {
		event.target.style.top = -100
	})

	id("to-link").addEventListener("click", (event) => {
		event.preventDefault()

		let newStructure = Object.assign({}, selectedContent),
			[firstContent, lastContent] = selectedContent.children[
				childIndex
			].split(selectedText)

		// Push from back to front
		if (lastContent.length)
			pushObject(newStructure.children, childIndex, lastContent)

		pushObject(newStructure.children, childIndex, {
			nodeName: "a",
			textContent: selectedText
		})

		if (firstContent.length)
			pushObject(newStructure.children, childIndex, firstContent)

		removeObject(newStructure.children, childIndex)

		updateEditor()
		save()

		/* Dispose */
		id("selector-tools").style.top = -100
	})

	id("add-href").addEventListener("click", () => {
		let ref = id("link-tools").style

		let index = global.liliya.focusedNode,
			childIndex = global.liliya.focusedChildNode,
			content = structure.content[index]

		id("change-href").setAttribute(
			"value",
			content.children[childIndex].href || ""
		)

		id("href-tools").style.top = ref.top
		id("href-tools").style.left = ref.left
	})

	id("change-href").addEventListener("blur", (event) => {
		let index = global.liliya.focusedNode,
			childIndex = global.liliya.focusedChildNode,
			newStructure = Object.assign({}, structure.content[index])

		newStructure.children[childIndex].href = event.target.value

		save()
	})

	id("href-tools").addEventListener("mouseleave", (event) => {
		event.target.style.top = -100
	})

	id("to-text").addEventListener("click", () => {
		event.preventDefault()

		let index = global.liliya.focusedNode,
			childIndex = global.liliya.focusedChildNode,
			newStructure = Object.assign({}, structure.content[index])

		newStructure.children[childIndex] =
			newStructure.children[childIndex].textContent

		let newChildren = []

		/* Reduce Function */
		newStructure.children.forEach((child, index) => {
			if (!index) return newChildren.push(child)

			if (typeof newChildren[index - 1] !== "string")
				return newChildren.push(child)

			return typeof child === "string"
				? (newChildren[newChildren.length - 1] += child)
				: newChildren.push(child)
		})

		newStructure.children = newChildren

		// Merge has autosave
		merge(newStructure, index)
		updateEditor()

		id("link-tools").style.top = -100
	})

	/* Header Listener */
	id("title").addEventListener("input", (event) => {
		structure.header.title = event.target.textContent

		save()
	})

	id("title").addEventListener("paste", (event) => {
		event.preventDefault()

		let text = (event.originalEvent || event).clipboardData.getData(
			"text/plain"
		)

		document.execCommand("insertHTML", false, text)
	})

	id("og-image").addEventListener("dblclick", () => {
		id("image-selector-overlay").style.display = "flex"
		global.liliya.changeOGImage = true
	})

	/* Editor Event Listener */
	id("editor-add-text").addEventListener("blur", (event) => {
		if (!event.target.textContent.length) return

		let content = global.liliya.structure.content

		content.push({
			nodeName: "p",
			children: [event.target.textContent]
		})

		id("editor").appendChild(
			build({
				nodeName: "p",
				children: [event.target.textContent]
			})
		)
		save()

		event.target.textContent = ""
	})

	id("editor-add-text").addEventListener("paste", (event) => {
		event.preventDefault()

		let text = (event.originalEvent || event).clipboardData.getData(
			"text/plain"
		)

		document.execCommand("insertHTML", false, text)
	})

	id("editor-add-text").addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			event.preventDefault()

			let content = global.liliya.structure.content

			content.push({
				nodeName: "p",
				children: [event.target.textContent]
			})

			id("editor").appendChild(
				build({
					nodeName: "p",
					children: [event.target.textContent]
				})
			)
			save()

			event.target.textContent = ""
		}

		if (event.key === "Backspace" && !event.target.textContent.length)
			id("editor").lastChild.focus()
	})

	/* Image selector */
	id("editor-add-image").addEventListener("click", () => {
		id("new-image").click()
	})

	id("close-image-selector").addEventListener("click", () => {
		id("image-selector-overlay").style.display = "none"
	})

	id("new-image").addEventListener("change", (event) => {
		if (!event.target.files || !event.target.files[0]) return

		let { path, name } = event.target.files[0]

		fs.copyFile(path, composeAssets(name), (err) => {
			if (err) throw err

			appendToImageSelector(name)
		})
	})

	getAllImages().forEach((image) => {
		if (image === ".DS_Store") return

		appendToImageSelector(image)
	})

	/* Search Image */
	let searchKey = ""

	id("image-search").addEventListener("input", (event) => {
		let _search = event.target.value
		searchKey = event.target.value

		/* Throttle Function */
		setTimeout(() => {
			if (_search !== searchKey) return

			let searchedImages = searchImage(searchKey.toLowerCase())

			if (searchedImages.length) applyImages(searchedImages)
			else removeAllImages()
		}, 300)
	})

	/* Toolbar */
	let changeType = (type) => {
		select(
			`#toolbar > .type-selector > .selector.-${type}`
		).addEventListener("click", () => {
			let { focusedNode } = global.liliya

			merge(
				{
					nodeName: type
				},
				focusedNode
			)

			updateEditor()
			save()
			showTools(focusedNode)
		})
	}

	;["h1", "h2", "p", "img"].forEach((element) => {
		changeType(element)
	})
})
