import { id, select } from '../libs/helpers.js'

export const showTools = (index) => {
    global.liliya.focusedNode = index

    let element = id("editor").children[index],
        nodeName = element.nodeName !== "FIGURE" ? element.nodeName : "img"

    select("#toolbar > .type").textContent = nodeName

    let offset = element.offsetTop,
        height = element.clientHeight

    id("toolbar").style.top = offset + (height / 2)
    
    if(select("#toolbar > .type-selector > .-hidden") !== null)
        select("#toolbar > .type-selector > .-hidden").classList.remove("-hidden")

    select(`#toolbar > .type-selector > .-${nodeName}`).classList.add("-hidden")
}