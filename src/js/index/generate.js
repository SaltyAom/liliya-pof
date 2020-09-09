import { fs, basepath, removeDirectory } from "../libs/node.js"
import {
	content as contentPath,
	composeContent,
	dist,
	composeDist,
	assets
} from "../libs/directory.js"

const resizeImage = (imagePath, width = 1280, options = { webp: false }) =>
	new Promise((resolve) => {
		let { webp } = options

		let image = new Image(),
			canvas = document.createElement("canvas"),
			ctx = canvas.getContext("2d")

		image.onload = () => {
			let height = width * (image.height / image.width)

			canvas.width = width
			canvas.height = height
			ctx.drawImage(image, 0, 0, width, height)

			canvas.toBlob(
				(blob) => {
					let reader = new FileReader()

					reader.onloadend = () => {
						resolve(new Uint8Array(reader.result))
					}

					reader.readAsArrayBuffer(blob)
				},
				webp
					? "image/webp"
					: imagePath.includes("png")
					? "image/png"
					: "image/jpeg",
				0.65
			)
		}

		image.src = imagePath
	})

const generateProject = async () => {
	let contentList = fs.readdirSync(contentPath).filter(file => file !== ".DS_Store")

	/* Pack Assets */
	if (fs.existsSync(dist)) removeDirectory(dist)

	fs.mkdirSync(dist)

	let assetsPath = `${dist}/assets`,
		cssPath = `${dist}/assets/css`

	fs.mkdirSync(assetsPath)
	fs.mkdirSync(cssPath)
	fs.mkdirSync(`${dist}/content`)

	fs.copyFileSync(
		`${basepath}/assets/liliya.min.js`,
		`${dist}/assets/liliya.js`
	)

	/* Generate HTML */
	let template = fs.readFileSync(`${basepath}/assets/template.html`)

	let packContent = () =>
		new Promise((resolve) =>
			contentList.forEach(async (contentFile, index) => {
				let parsedBlogContent = JSON.parse(
						fs.readFileSync(composeContent(contentFile), {
							encoding: "utf8"
						})
					),
					{ content, header } = parsedBlogContent,
					{ title, src, alt } = header

				/* Generate Blog */
				let blog = `${template}`,
					blogContent = `<header id="header"><h1 id="title">${title}</h1>`

				/* Generate Header */
				let ogFileName = getFileName(src)
				blogContent += `<figure class="figure" id="header-image-wrapper">
				<picture>
					<source class="webp" srcset="${composeSrcSet(
						title,
						renameExtension(ogFileName, "webp")
					)}" sizes="(max-width: 640px) 640px" type="image/webp" />
					<source class="fallback" srcset="${composeSrcSet(
						title,
						ogFileName
					)}" sizes="(max-width: 640px) 640px" type="${getImageType(ogFileName)}" />
					<img id="header-image" class="img" src="/assets/${parseUrl(title)}/${parseUrl(
					ogFileName
				)}" alt="${alt}" loading="lazy" />
					</picture>
				</figure>
			</header>`

				/* Generate Content */
				blogContent += content
					.map((element) => build(title, element))
					.reduce((previous, blog) => (previous += blog))

				blog = blog.replace("__Liliya_title__", title)
				blog = blog.replace("__Liliya_blog__", blogContent)

				/* Generate Link */
				let nextStory =
						index < contentList.length - 1
							? contentList[index + 1]
							: contentList[0],
					previousStory =
						index > 0
							? contentList[index - 1]
							: contentList[contentList.length - 1]

				nextStory = JSON.parse(
					fs.readFileSync(composeContent(nextStory), {
						encoding: "utf8"
					})
				)
				previousStory = JSON.parse(
					fs.readFileSync(composeContent(previousStory), {
						encoding: "utf8"
					})
				)

				blog = blog.replace(
					"__Liliya_next__",
					`/content/${parseUrl(nextStory.header.title)}`
				)
				blog = blog.replace(
					"__Liliya_previous__",
					`/content/${parseUrl(previousStory.header.title)}`
				)

				blog = blog.replace(
					"__Liliya_next_title__",
					nextStory.header.title
				)
				blog = blog.replace(
					"__Liliya_previous_title__",
					previousStory.header.title
				)

				let nextStoryImage = getFileName(nextStory.header.src),
					previousStoryImage = getFileName(previousStory.header.src)

				blog = blog.replace(
					new RegExp("__Liliya_next_src__", "g"),
					`
					<figure class="figure">
						<picture>
							<source class="webp" srcset="/assets/${parseUrl(
								nextStory.header.title
							)}/${renameExtension(
						parseUrl(addPreloadToFileName(nextStoryImage)),
						"webp"
					)} ,/assets/${parseUrl(
						nextStory.header.title
					)}/${renameExtension(
						parseUrl(
							add2xToFileName(
								addPreloadToFileName(nextStoryImage)
							)
						),
						"webp"
					)} 2x" sizes="(max-width: 400px) 400px" type="image/webp" />
							<source class="fallback" srcset="/assets/${parseUrl(
								nextStory.header.title
							)}/${parseUrl(
						addPreloadToFileName(nextStoryImage)
					)} ,/assets/${parseUrl(nextStory.header.title)}/${parseUrl(
						addPreloadToFileName(nextStoryImage)
					)} 2x" sizes="(max-width: 400px) 400px" type="${getImageType(nextStoryImage)}" />
							<img class="img preload-story" src="/assets/${parseUrl(nextStory.header.title)}/${parseUrl(
						addPreloadToFileName(nextStoryImage)
					)}" alt="${nextStory.header.alt}" loading="lazy" />
						</picture>
					</figure>
					`
				)
				blog = blog.replace(
					new RegExp("__Liliya_previous_src__", "g"),
					`
					<figure class="figure">
						<picture>
							<source class="webp" srcset="/assets/${parseUrl(
								previousStory.header.title
							)}/${renameExtension(
						parseUrl(addPreloadToFileName(previousStoryImage)),
						"webp"
					)} ,/assets/${parseUrl(
						previousStory.header.title
					)}/${renameExtension(
						parseUrl(
							add2xToFileName(
								addPreloadToFileName(previousStoryImage)
							)
						),
						"webp"
					)} 2x" sizes="(max-width: 400px) 400px" type="image/webp" />
							<source class="fallback" srcset="/assets/${parseUrl(
								previousStory.header.title
							)}/${parseUrl(
						addPreloadToFileName(previousStoryImage)
					)} ,/assets/${parseUrl(
						previousStory.header.title
					)}/${parseUrl(
						add2xToFileName(
							addPreloadToFileName(previousStoryImage)
						)
					)} 2x" sizes="(max-width: 400px) 400px" type="${getImageType(previousStoryImage)}" />
							<img class="img preload-story" src="/assets/${parseUrl(
								previousStory.header.title
							)}/${parseUrl(
						addPreloadToFileName(previousStoryImage)
					)}" alt="${previousStory.header.alt}" loading="lazy" />
						</picture>
					</figure>
					`
				)

				blog = blog.replace(
					"__Liliya_next_alt__",
					`/assets/${nextStory.header.alt}/${nextStoryImage}`
				)
				blog = blog.replace(
					"__Liliya_previous_alt__",
					`/assets/${previousStory.header.alt}/${previousStoryImage}`
				)

				blog = blog.replace(
					new RegExp("__Liliya_previous_json__", "g"),
					parseUrl(`/assets/${previousStory.header.title}/data.json`)
				)
				blog = blog.replace(
					new RegExp("__Liliya_next_json__", "g"),
					parseUrl(`/assets/${nextStory.header.title}/data.json`)
				)

				/* Generate Inline CSS */
				let inlineCSS = minifyCSS(
					fs.readFileSync(`${basepath}/src/styles/init.css`, {
						encoding: "utf8"
					})
				)
				inlineCSS += minifyCSS(
					fs.readFileSync(`${basepath}/src/styles/blog.css`, {
						encoding: "utf8"
					})
				)

				blog = blog.replace("/* __Liliya_style__ */", inlineCSS)

				/* ! SEO */
				let web = "https://liliya.saltyaom.com"

				blog = blog.replace(
					new RegExp("__Liliya_seo_title__", "g"),
					header.title
				)
				blog = blog.replace(
					new RegExp("__Liliya_seo_description__", "g"),
					content.filter((element) => element.nodeName === "p")[0]
						.textContent || "Project Liliya"
				)
				blog = blog.replace(
					new RegExp("__Liliya_seo_image__", "g"),
					`${web}/assets/${parseUrl(header.title)}/${addTitleToFileName(
						parseUrl(getFileName(header.src))
					)}`
				)
				blog = blog.replace(
					new RegExp("__Liliya_seo_url__", "g"),
					`${web}/content/${parseUrl(header.title)}`
				)

				blog = blog.replace(
					new RegExp("__Liliya_next_href__", "g"),
					`/content/${parseUrl(header.title)}`
				)
				blog = blog.replace(
					new RegExp("__Liliya_previous_href__", "g"),
					`/content/${parseUrl(header.title)}`
				)

				blog = minifyHTML(blog)

				fs.mkdirSync(composeDist(`content/${parseUrl(title)}`))
				fs.writeFileSync(
					composeDist(`content/${parseUrl(title)}/index.html`),
					blog
				)

				/* Pack Image */
				let blogAssets = `${assetsPath}/${parseUrl(title)}`

				fs.mkdirSync(`${assetsPath}/${parseUrl(title)}`)

				/* Pack Assets */
				let localAssets = new RegExp(assets, "g")

				let asLocalContent = JSON.parse(
					JSON.stringify(parsedBlogContent)
						.replace(localAssets, `/assets/${parseUrl(title)}`)
						.replace(/file\:\/\//g, "")
						.replace(/\n/g, "")
				)

				asLocalContent = Object.assign(asLocalContent, {
					content: asLocalContent.content.map((node) => {
						if (node.nodeName !== "img") return node

						return {
							...node,
							src: parseUrl(node.src)
						}
					})
				})

				asLocalContent.header.src = parseUrl(asLocalContent.header.src)

				asLocalContent.footer = {
					previous: {
						title: previousStory.header.title,
						json: parseUrl(
							`/assets/${previousStory.header.title}/data.json`
						),
						src: parseUrl(
							`/assets/${previousStory.header.title}/${previousStoryImage}`
						),
						alt: previousStory.header.alt,
						href: `/content/${parseUrl(previousStory.header.title)}`
					},
					next: {
						title: nextStory.header.title,
						json: parseUrl(
							`/assets/${nextStory.header.title}/data.json`
						),
						src: parseUrl(
							`/assets/${nextStory.header.title}/${nextStoryImage}`
						),
						alt: nextStory.header.title,
						href: `/content/${parseUrl(nextStory.header.title)}`
					}
				}

				fs.writeFileSync(
					`${assetsPath}/${parseUrl(title)}/data.json`,
					JSON.stringify(asLocalContent)
				)

				content
					.filter(({ nodeName }) => nodeName === "img")
					.map(async ({ src }) => {
						packImage(src, blogAssets)
					})

				await packImage(src, blogAssets)
				await packTitle(src, blogAssets)
				await packPreload(src, blogAssets, 430)

				/* Pack etc */
				packFile(`${basepath}/assets/robots.txt`, dist)
				packFile(`${basepath}/assets/icon.png`, `${dist}/assets`)

				resolve(true)
			})
		)

	/* Pack Service Worker */
	await packContent()
	let serviceWorker = fs.readFileSync(
		`${basepath}/assets/service-worker.min.js`,
		{ encoding: "utf8" }
	)

	let cachedAssets = []

	let assetsFolder = fs.readdirSync(`${basepath}/generated/dist/assets`)
	assetsFolder.forEach((assetFolder) => {
		let assetsOrFolder = `${basepath}/generated/dist/assets/${assetFolder}`

		if (!fs.lstatSync(assetsOrFolder).isDirectory())
			return cachedAssets.push(assetsOrFolder)

		fs.readdirSync(assetsOrFolder).forEach((fileName) => {
			let file = `${assetsOrFolder}/${fileName}`

			cachedAssets.push(file)
		})
	})

	let contentFolder = fs.readdirSync(`${basepath}/generated/dist/content`)
	contentFolder.forEach((contentName) => {
		let contentFolder = `${basepath}/generated/dist/content/${contentName}`

		fs.readdirSync(contentFolder).forEach((contentFile) => {
			cachedAssets.push(`${contentFolder}/${contentFile}`)
		})
	})

	cachedAssets = cachedAssets.map((asset) => `"${asset.replace(dist, "")}"`)
	serviceWorker = serviceWorker.replace(
		"__Liliya_service_worker__",
		cachedAssets
	)

	console.log(cachedAssets)

	fs.writeFileSync(`${dist}/service-worker.js`, serviceWorker)
}

let packFile = (path, dest) => {
		fs.copyFileSync(parseUrl(path), `${dest}/${getFileName(path)}`)
	},
	packImage = async (path, destination, size = 640, multiplier = 1.75) => {
		fs.writeFileSync(
			parseUrl(`${destination}/${getFileName(path)}`),
			await resizeImage(path, size)
		)

		fs.writeFileSync(
			parseUrl(`${destination}/${add2xToFileName(getFileName(path))}`),
			await resizeImage(path, size * multiplier)
		)

		fs.writeFileSync(
			parseUrl(
				`${destination}/${renameExtension(
					`${getFileName(path)}`,
					"webp"
				)}`
			),
			await resizeImage(path, size, { webp: true })
		)

		fs.writeFileSync(
			`${destination}/${renameExtension(
				parseUrl(`${add2xToFileName(getFileName(path))}`),
				"webp"
			)}`,
			await resizeImage(path, size * multiplier, { webp: true })
		)
	},
	packPreload = async (path, destination, size = 400) => {
		fs.writeFileSync(
			parseUrl(
				`${destination}/${addPreloadToFileName(getFileName(path))}`
			),
			await resizeImage(path, size)
		)

		fs.writeFileSync(
			parseUrl(
				`${destination}/${add2xToFileName(
					addPreloadToFileName(getFileName(path))
				)}`
			),
			await resizeImage(path, size * 1.5)
		)

		fs.writeFileSync(
			parseUrl(
				`${destination}/${addPreloadToFileName(
					renameExtension(`${getFileName(path)}`, "webp")
				)}`
			),
			await resizeImage(path, size, { webp: true })
		)

		fs.writeFileSync(
			parseUrl(
				`${destination}/${add2xToFileName(
					addPreloadToFileName(
						renameExtension(getFileName(path), "webp")
					)
				)}`
			),
			await resizeImage(path, size * 1.5, { webp: true })
		)
	},
	packTitle = async (path, destination, size = 1920) => {
		fs.writeFileSync(
			parseUrl(
				`${destination}/${addTitleToFileName(getFileName(path))}`
			),
			await resizeImage(path, size)
		)
	},
	minimizeAndPackCSS = (path, destination) => {
		let css = minifyCSS(
			fs.readFileSync(path, {
				encoding: "utf8"
			})
		)

		fs.writeFileSync(destination, css)
	}

let build = (title, node) => {
	let built

	switch (node.nodeName) {
		case "h1":
			built = `<h1 class="h1">${node.textContent}</h1>`
			break

		case "h2":
			built = `<h2 class="h2">${node.textContent}</h2>`
			break

		case "p":
			built = `<p class="p">${node.children
				.map((child) =>
					typeof child === "string"
						? child
						: `<a class="a" href="${child.href}" target="_blank" rel="noreopener norefferer">${child.textContent}</a>`
				)
				.join("")}</p>`
			break

		case "img":
			let splitSrc = node.src.split("/"),
				fileName = splitSrc[splitSrc.length - 1]

			built = `<figure class="figure">
					<picture>
						<source class="webp" srcset="${composeSrcSet(
							title,
							renameExtension(fileName, "webp")
						)}" sizes="(max-width: 640px) 640px" type="image/webp" />
						<source class="fallback" srcset="${composeSrcSet(
							title,
							fileName
						)}" sizes="(max-width: 640px) 640px" type="${getImageType(fileName)}" />
						<img class="img" src="/assets/${parseUrl(title)}/${parseUrl(
				fileName
			)}" alt="${node.alt}" loading="lazy" />
					</picture>
				</figure>`
			break

		default:
			break
	}

	return built
}

let getFileName = (path) => {
		let splited = path.split("/")

		return splited[splited.length - 1].replace(/\%20/g, "-").toLowerCase()
	},
	renameExtension = (fileName, extension) => {
		let name = fileName.split(".")
		name.splice(name.length - 1, 0, ".")
		name.pop()

		name = name.reduce((name, next) => (name += next))
		return name + extension
	},
	add2xToFileName = (fileName) => {
		let name = fileName.split(".")
		name.splice(name.length - 1, 0, "@2x.")

		return name.reduce((name, next) => (name += next))
	},
	addPreloadToFileName = (fileName) => {
		let name = fileName.split(".")
		name.splice(name.length - 1, 0, "@preload.")

		return name.reduce((name, next) => (name += next))
	},
	addTitleToFileName = (fileName) => {
		let name = fileName.split(".")
		name.splice(name.length - 1, 0, "@title.")

		return name.reduce((name, next) => (name += next))
	},
	composeSrcSet = (title, file) => {
		let parsedTitle = parseUrl(title),
			parsedFile = parseUrl(file)

		return (
			`/assets/${parsedTitle}/${parsedFile}` +
			`\ ,` +
			`/assets/${parsedTitle}/${add2xToFileName(parsedFile)}\ 2x`
		)
	},
	getImageType = (fileName) => {
		let splited = fileName.split("."),
			type = splited[splited.length - 1]

		return type === "png" ? "image/png" : "image/jpeg"
	},
	parseUrl = (path) =>
		path
			.replace(/\ /g, "-")
			.replace(new RegExp("%20", "g"), "-")
			.toLowerCase()

let minifyHTML = (html) =>
		html
			.replace(/\>[\r\n ]+\</g, "><")
			.replace(/(<.*?>)|\s+/g, (m, $1) => ($1 ? $1 : " "))
			.replace(/\>\ \</g, "><")
			.trim(),
	minifyCSS = (css) => {
		let content = css

		content = content.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "")
		// now all comments, newlines and tabs have been removed
		content = content.replace(/ {2,}/g, " ")
		// now there are no more than single adjacent spaces left
		// now unnecessary: content = content.replace( /(\s)+\./g, ' .' );
		content = content.replace(/ ([{:}]) /g, "$1")
		content = content.replace(/([;,]) /g, "$1")
		content = content.replace(/ !/g, "!")

		return content
	}

export default generateProject
