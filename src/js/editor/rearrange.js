import { id, $, getIndex, select, imageToFigure } from "../libs/helpers.js"
import { build } from "./builder.js"
import { save } from "../libs/structure.js"
import { showTools } from "./tools.js"

let rearrage = ({ event, node }) => {
	// Setup
	let holding = true,
		rearranging = false,
		moved = false,
		element = imageToFigure(event.target)

	let index = getIndex(element),
		currentPosition = +index // Copy only value

	// Get Position
	let editorElements = $("#editor > *"),
		editorElementsPosition = []

	// Element
	let editor = id("editor")

	// Listener Function
	const stopArrange = () => {
			holding = false

			if (rearranging) {
				let content = global.liliya.structure.content

				content.splice(index, 1)
				content.splice(currentPosition, 0, node)

				let childToBeReplaced = select("#editor > .-dragging")

				childToBeReplaced.classList.remove("-dragging")
				editor.classList.remove("-dragging")

				rearranging = false
				index = currentPosition

				setTimeout(() => {
					editor.replaceChild(build(node), childToBeReplaced)
					showTools(currentPosition)
				}, 220)

				save()
			}

			window.removeEventListener("mouseup", stopArrange)
			window.removeEventListener("mousemove", handleDrag)
		},
		handleMoveBeforeDrag = () => {
			if(!moved && !rearranging)
				moved = true
		},
		handleDrag = ({ pageY }) => {
			id("toolbar").style.top = "-100px"

			editorElementsPosition.some((firstOffset, index) => {
				let secondOffset = editorElementsPosition[index + 1]

				// Get Index Between
				if (
					(index === 0 && pageY < firstOffset) ||
					(index === editorElementsPosition.length - 1 &&
						pageY > firstOffset &&
						pageY <
							firstOffset +
								editorElements[index].offsetHeight / 2) ||
					(pageY > firstOffset &&
						index !== 0 &&
						pageY < secondOffset &&
						index !== editorElementsPosition.length - 1)
				) {
					if (currentPosition === index) return

					let thisElement = element.cloneNode(true)

					// Rearrange
					editor.removeChild(select("#editor > .-dragging"))

					if (currentPosition > index)
						editor.insertBefore(
							thisElement,
							editor.children[currentPosition - 1]
						)
					else
						editor.insertBefore(
							thisElement,
							editor.children[currentPosition + 1]
						)

					// Update Position
					currentPosition = index

					// Get Position
					editorElements = $("#editor > *")
					editorElementsPosition = []

					for (
						let editorIndex = 0;
						editorIndex < editorElements.length;
						editorIndex++
					)
						if (editorIndex !== index)
							editorElementsPosition.push(
								editorElements[editorIndex].offsetTop
							)

					return
				}

				if (
					pageY >
					editorElementsPosition[editorElementsPosition.length - 1]
				) {
					let thisElement = element.cloneNode(true)

					// Rearrange
					editor.removeChild(select("#editor > .-dragging"))
					editor.insertBefore(
						thisElement,
						editor.children[editorElementsPosition.length + 1]
					)

					// Update Position
					currentPosition = editorElementsPosition.length

					// Get Position
					editorElements = $("#editor > *")
					editorElementsPosition = []

					for (
						let editorIndex = 0;
						editorIndex < editorElements.length;
						editorIndex++
					)
						if (editorIndex !== index)
							editorElementsPosition.push(
								editorElements[editorIndex].offsetTop
							)
				}
			})
		}

	window.addEventListener("mouseup", stopArrange)
	window.addEventListener("mousemove", handleMoveBeforeDrag)

	setTimeout(() => {
		if (!holding) return
		if(moved)
			return moved = false

		rearranging = true

		element.classList.add("-dragging")
		id("editor").classList.add("-dragging")

		for (
			let editorIndex = 0;
			editorIndex < editorElements.length;
			editorIndex++
		)
			if (editorIndex !== index)
				editorElementsPosition.push(
					editorElements[editorIndex].offsetTop
				)

		window.addEventListener("mousemove", handleDrag)
	}, 350)
}

export default rearrage
