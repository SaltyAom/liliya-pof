document.addEventListener("DOMContentLoaded", () => {
	let id = (id) => document.getElementById(id),
		setAttribute = (element, attribute, value) => element.setAttribute(attribute, value)

	let blog = id("blog"),
		headerTitle = id("title"),
		headerImage = id("header-image"),
		headerImageWrapper = id("header-image-wrapper"),
		headerImageWebpSrc = headerImageWrapper.querySelector(".webp"),
		headerImageFallbackSrc = headerImageWrapper.querySelector(".fallback")

	let nextElement = id("next"),
		nextImage = next.querySelector(".img"),
		nextImageFallback = nextImage.previousElementSibling,
		nextImageWebp = nextImageFallback.previousElementSibling,
		nextTitle = next.querySelector(".h2"),
		previousElement = id("previous"),
		previousImage = previous.querySelector(".img"),
		previousImageFallback = previousImage.previousElementSibling,
		previousImageWebp = previousImageFallback.previousElementSibling,
		previousTitle = previous.querySelector(".h2")

	let webTitle = id("liliya-title"),
		nextJson = id("prefetch-next"),
		previousJson = id("prefetch-previous")

	let addToFileName = (prepend = "2x", fileName) => {
			let name = fileName.split(".")
			name.splice(name.length - 1, 0, `@${prepend}.`)

			return name.reduce((name, next) => (name += next))
		},
		composeSrcSet = (src) =>
			parseSpace(src) +
			`\, ` +
			addToFileName("2x", parseSpace(src)) +
			`\ 2x`,
		composePreloadSrcSet = (src) =>
			addToFileName("preload", parseSpace(src)) +
			`\, ` +
			addToFileName("preload@2x", parseSpace(src)) +
			`\ 2x`,
		parseSpace = (path) => path.replace(/ /g, "%20"),
		renameExtension = (fileName, extension) => {
			let name = fileName.split(".")
			name.splice(name.length - 1, 0, ".")
			name.pop()

			name = name.reduce((name, next) => (name += next))
			return name + extension
		},
		getImageType = (fileName) => {
			let splited = fileName.split("."),
				type = splited[splited.length - 1]

			return type === "png" ? "image/png" : "image/jpeg"
		}

	const build = (node) => {
		let { nodeName } = node

		let element

		switch (nodeName) {
			case "h1":
			case "h2":
			case "p":
				element = document.createElement(nodeName)
				element.classList.add(nodeName)
				if (nodeName !== "p") element.textContent = node.textContent
				else
					node.children.forEach((child) =>
						element.appendChild(
							typeof child === "string"
								? document.createTextNode(child)
								: build(child)
						)
					)
				break

			case "a":
				element = document.createElement("a")

				element.classList.add("a")
				setAttribute(element, "href", node.href || "")
				setAttribute(element, "rel", "noreopener norefferer")
				setAttribute(element, "target", "_blank")

				element.textContent = node.textContent
				break

			case "img":
				let template = id("liliya-image").cloneNode(true).content,
					image = template.querySelector(".img")

				setAttribute(image, "src", node.src)
				setAttribute(image, "alt", node.alt)

				let webpSrc = template.querySelector(".webp"),
					fallbackSrc = template.querySelector(".fallback")

				setAttribute(
					webpSrc,
					"srcset",
					composeSrcSet(renameExtension(node.src, "webp"))
				)
				setAttribute(fallbackSrc, "srcset", composeSrcSet(node.src))
				setAttribute(fallbackSrc, "type", getImageType(node.src))

				element = template
				break
		}

		return element
	}

	async function navigate(event) {
		if (
			navigator.serviceWorker &&
			navigator.serviceWorker.controller !== null
		)
			event.preventDefault()

		let blogPath = this.getAttribute("x-src")

		let {
				header: { title, src, alt },
				content,
				footer: { next, previous }
			} = await fetch(blogPath).then((res) => res.json()),
			totalBlogChildren = blog.childElementCount - 2

		window.history.pushState({}, title, this.href)

		requestAnimationFrame(() => {
			/* Apply Header */
			headerTitle.textContent = title
			setAttribute(headerImage, "src", src)
			setAttribute(headerImage, "alt", alt)

			setAttribute(
				headerImageWebpSrc,
				"srcset",
				composeSrcSet(renameExtension(src, "webp"))
			)
			setAttribute(headerImageFallbackSrc, "srcset", composeSrcSet(src))
			setAttribute(headerImageFallbackSrc, "type", getImageType(src))

			/* Diff */
			content.forEach((child, index) => {
				let oldChild = blog.children[index + 1]

				if (index > totalBlogChildren)
					return blog.appendChild(build(child))

				if (
					oldChild.nodeName.toLowerCase() === child.nodeName ||
					(oldChild.nodeName.toLowerCase() === "figure" &&
						child.nodeName === "img")
				)
					switch (child.nodeName) {
						case "h1":
						case "h2":
							return (oldChild.textContent = child.textContent)

						case "p":
							return blog.replaceChild(build(child), oldChild)

						case "figure":
							let image = oldChild.querySelector(".img")
							setAttribute(image, "src", child.src)
							setAttribute(image, "alt", child.alt)
							return
					}

				blog.replaceChild(build(child), oldChild)
			})

			while (blog.children[content.length].nextElementSibling)
				blog.removeChild(blog.children[content.length].nextSibling)

			/* Apply Footer */
			setAttribute(nextElement, "href", next.href)
			setAttribute(nextElement, "x-src", next.json)
			setAttribute(previousElement, "href", previous.href)
			setAttribute(previousElement, "x-src", previous.json)

			setAttribute(nextImage, "src", next.src)
			setAttribute(
				nextImageWebp,
				"srcset",
				composePreloadSrcSet(renameExtension(next.src, "webp"))
			)
			setAttribute(
				nextImageFallback,
				"srcset",
				composePreloadSrcSet(next.src)
			)
			setAttribute(nextImageFallback, "type", getImageType(next.src))
			setAttribute(nextImage, "alt", next.alt)

			setAttribute(previousImage, "src", previous.src)
			setAttribute(
				previousImageWebp,
				"srcset",
				composePreloadSrcSet(renameExtension(previous.src, "webp"))
			)
			setAttribute(
				previousImageFallback,
				"srcset",
				composePreloadSrcSet(previous.src)
			)
			setAttribute(previousImageFallback, "type", getImageType(previous.src))
			setAttribute(previousImage, "alt", previous.alt)

			nextTitle.textContent = next.title
			previousTitle.textContent = previous.title

			/* Apply Head */
			webTitle.textContent = title
			setAttribute(nextJson, "href", next.json)
			setAttribute(previousJson, "href", previous.json)

			requestAnimationFrame(() => {
				window.scrollTo(0, 0)
			})
		})
	}

	let installServiceWorker = () => {
		if (navigator.serviceWorker)
			navigator.serviceWorker.register("/service-worker.js")

		window.removeEventListener("load", installServiceWorker)
	}

	id("previous").addEventListener("click", navigate)
	id("next").addEventListener("click", navigate)

	window.addEventListener("load", installServiceWorker)
})
