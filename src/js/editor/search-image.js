import { id } from "../libs/helpers.js"
import { composeEditorAssets, assets } from "../libs/directory.js"
import { fs } from '../libs/node.js'

import { appendToImageSelector, cleanupImagesFrom } from "./image-selector.js"

export const getAllImages = () =>
		fs.readdirSync(assets),
	searchImage = (searchKey) =>
		getAllImages().filter((image) => image.toLowerCase().includes(searchKey)),
	applyImages = (imageLists) => {
		let selectors = id("image-selector")

		imageLists.forEach((imageName, index) => {
			if (index >= selectors.children.length)
				return appendToImageSelector(imageName)

			let imageSelector = selectors.children[index]

			let image = imageSelector.querySelector(".img"),
				title = imageSelector.querySelector(".name")

			image.setAttribute("src", composeEditorAssets(imageName))
			image.setAttribute("alt", imageName)

			title.textContent = imageName
		})

		cleanupImagesFrom(imageLists.length - 1)
	}
