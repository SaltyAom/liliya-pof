import { id, getTemplate } from "../libs/helpers.js"
import { save } from "../libs/structure.js"
import { composeEditorAssets } from '../libs/directory.js'

export const buildImageSelector = (imageName) => {
	let imageSelector = getTemplate("image-selector-template")

	imageSelector.querySelector(".name").textContent = imageName
	imageSelector
		.querySelector(".img")
		.setAttribute("src", composeEditorAssets(imageName))

	imageSelector.querySelector(".img").addEventListener("click", useImage)

	return imageSelector
}

export const appendToImageSelector = (imageName) => {
	let selector = buildImageSelector(imageName)

	id("image-selector").appendChild(selector)
}

const useImage = (event) => {
	let { header, content } = global.liliya.structure

	let imagePath = event.target.src,
		imageNameArray = imagePath.split("/"),
		imageName = imageNameArray[imageNameArray.length - 1].replace(/\%20/g, " ")

	if (global.liliya.changeOGImage) {
		id("og-image").setAttribute("src", imagePath)
		id("og-image").setAttribute("alt", imageName)

		header.src = imagePath
		header.alt = imageName
	} else {
		let imageNodeIndex = global.liliya.selectedImageNode

		content[imageNodeIndex].src = imagePath
		content[imageNodeIndex].alt = imageName

		let image = id("editor").children[imageNodeIndex].querySelector(".img")
		image.src = imagePath
		image.alt = imageName
	}

	id("image-selector-overlay").style.display = "none"
	global.liliya.selectedImageNode = null

	save()
}

export const cleanupImagesFrom = (index) => {
		let element = id("image-selector").children[index]

		while (element.nextElementSibling)
			element.parentElement.removeChild(element.nextElementSibling)
	},
	removeAllImages = () => {
		let element = id("image-selector").children[0]

		while (element.nextElementSibling)
			element.parentElement.removeChild(element.nextElementSibling)

		element.parentElement.removeChild(element)
	}

export default appendToImageSelector
