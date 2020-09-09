import { basepath } from './node.js'

export const assets = `${basepath}/generated/assets`,
    composeAssets = (name) => `${assets}/${name.replace(/\ /, "-").toLowerCase()}`,
    composeEditorAssets = (name) => `${assets}/${name}`,
    content = `${basepath}/generated/content`,
    composeContent = (name) => `${content}/${name.replace(/\ /, "-").toLowerCase()}`,
    dist = `${basepath}/generated/dist`,
    composeDist = (name) => `${dist}/${name.replace(/\ /, "-").toLowerCase()}`