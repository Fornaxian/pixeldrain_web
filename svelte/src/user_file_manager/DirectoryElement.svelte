<script>
import { formatDataVolume, formatDate } from "../util/Formatting.svelte";

// Main elements
let directoryArea
let directorySorters
let nodeContainer
let statusBar = "Loading..."

// Create sort buttons

// Sorting internal state. By default we sort by dateCreated in descending
// order (new to old)
let currentSortField = "dateCreated"
let currentSortAscending = false
let tableColumns = [
	{ name: "Name", field: "name", width: "" },
	{ name: "Creation date", field: "dateCreated", width: "160px" },
	{ name: "Size", field: "size", width: "90px" },
	{ name: "Type", field: "type", width: "200px" },
]

// Scroll event for rendering new file nodes when they become visible
let frameRequested = false;
const onScroll = (e) => {
	if (frameRequested) { return }
	frameRequested = true
	requestAnimationFrame(() => {
		renderVisibleFiles()
		frameRequested = false
	})
}

// Internal state, contains a list of all files in the directory, visible
// files in the directory and the last scroll position. These are used for
// rendering the file list correctly

// type: {icon, name, href, type, size, sizeLabel, dateCreated, selected}
let allFiles = []

export const reset = () => {
	allFiles = []
}

export const addFile = (icon, name, href, type, size, sizeLabel, dateCreated) => {
	allFiles.push({
		icon: icon,
		name: name,
		href: href,
		type: type,
		size: size,
		sizeLabel: sizeLabel,
		dateCreated: dateCreated,
		selected: false,
		filtered: false,
		visible: false,
	})
}

export const renderFiles = () => {
	search(lastSearchTerm)
}

// search filters the allFiles array on a search term. All files which match the
// search term will be put into visibleFiles. The visibleFiles array will then
// be rendered by renderVisibleFiles
let lastSearchTerm = ""
export const search = (term) => {
	term = term.toLowerCase()
	lastSearchTerm = term

	if (term === "") {
		for (let i in allFiles) {
			allFiles[i].filtered = false
		}
		sortBy("")
		renderVisibleFiles()
		return
	}

	let fileName = ""
	for (let i in allFiles) {
		fileName = allFiles[i].name.toLowerCase()

		// If there's an exact match we'll show it as the only result
		// if (fileName === term) {
		// 	allFiles[i].filtered = false
		// 	break
		// }

		if (fileName.includes(term)) {
			// If a file name contains the search term we include it in the results
			allFiles[i].filtered = false
		} else {
			allFiles[i].filtered = true
		}
	}

	sortBy("")
	renderVisibleFiles()
}

// searchSubmit opens the first file in the search results
export const searchSubmit = () => {
	for (let i in allFiles) {
		if (allFiles[i].visible && !allFiles[i].filtered) {
			window.location = allFiles[i].href
			break
		}
	}
}

const sortBy = (field) => {
	if (field === "") {
		// If no sort field is provided we use the last used sort field
		field = currentSortField
	} else {
		// If a sort field is provided we check in which direction we have to
		// sort
		if (currentSortField !== field) {
			// If this field is a different field than before we sort it in
			// ascending order
			currentSortAscending = true
			currentSortField = field
		} else if (currentSortField === field) {
			// If it is the same field as before we reverse the sort order
			currentSortAscending = !currentSortAscending
		}
	}

	// Add the arrow to the sort label. First remove the arrow from all sort
	// labels
	let colIdx = 0

	for (let i in tableColumns) {
		if (tableColumns[i].field == field) {
			colIdx = i
		}
		tableColumns[i].name = tableColumns[i].name.replace("▲ ", "").replace("▼ ", "")
	}

	// Then prepend the arrow to the current sort label
	if (currentSortAscending) {
		tableColumns[colIdx].name = "▼ " + tableColumns[colIdx].name
	} else {
		tableColumns[colIdx].name = "▲ " + tableColumns[colIdx].name
	}

	tableColumns = tableColumns

	let fieldA, fieldB
	allFiles.sort((a, b) => {
		fieldA = a[currentSortField]
		fieldB = b[currentSortField]

		if (typeof (fieldA) === "number") {
			if (currentSortAscending) {
				return fieldA - fieldB
			} else {
				return fieldB - fieldA
			}
		} else {
			if (currentSortAscending) {
				return fieldA.localeCompare(fieldB)
			} else {
				return fieldB.localeCompare(fieldA)
			}
		}
	})

	renderVisibleFiles()
}

const renderVisibleFiles = () => {
	const fileHeight = 40

	let paddingTop = directoryArea.scrollTop - directoryArea.scrollTop % fileHeight
	let start = Math.floor(paddingTop / fileHeight) - 3
	if (start < 0) { start = 0 }

	let end = Math.ceil((paddingTop + directoryArea.clientHeight) / fileHeight) + 3
	if (end > allFiles.length) { end = allFiles.length - 1 }

	nodeContainer.style.paddingTop = (start * fileHeight) + "px"

	// All files which have not been filtered out by the search function. We
	// pretend that files with filtered == true do not exist
	let totalFiles = 0
	let totalSize = 0

	for (let i in allFiles) {
		if (totalFiles >= start && totalFiles <= end && !allFiles[i].filtered) {
			allFiles[i].visible = true
		} else {
			allFiles[i].visible = false
		}
		if (!allFiles[i].filtered) {
			totalFiles++
			totalSize += allFiles[i].size
		}
	}

	nodeContainer.style.height = (totalFiles * fileHeight) + "px"
	statusBar = totalFiles + " items. Total size: " + formatDataVolume(totalSize, 4)

	// Update the view
	allFiles = allFiles

	console.debug(
		"start " + start +
		" end " + end +
		" children " + nodeContainer.childElementCount
	)
}
</script>

<div id="directory_element">
	<div bind:this={directoryArea} on:scroll={onScroll} id="directory_area" class="directory_area">
		<div bind:this={directorySorters} id="sorters" class="directory_sorters">
			{#each tableColumns as col}
				<div on:click={sortBy(col.field)} style="min-width: {col.width}">{col.name}</div>
			{/each}
		</div>
		<div bind:this={nodeContainer} id="node_container" class="directory_node_container">
			{#each allFiles as file}
				{#if file.visible && !file.filtered}
					<a class="node" href={file.href} target="_blank" title="{file.name}" class:node_selected={file.selected}>
						<div>
							<img src={file.icon} alt="file thumbnail" />
							<span>{file.name}</span>
						</div>
						<div style="width: {tableColumns[1].width}">
							<span>{formatDate(new Date(file.dateCreated), true, true, false)}</span>
						</div>
						<div style="width: {tableColumns[2].width}">
							<span>{file.sizeLabel}</span>
						</div>
						<div style="width: {tableColumns[3].width}">
							<span>{file.type}</span>
						</div>
					</a>
				{/if}
			{/each}
		</div>
	</div>
	<div id="footer" class="status_bar highlight_1">
		{statusBar}
	</div>
</div>

<style>
#directory_element {
	flex: 1 1 auto;
	display: flex;
	flex-direction: column;
	overflow: auto;
}

#sorters {
	display: flex;
	flex-direction: row;
	position: sticky;
	overflow: hidden;
	top: 0;
	z-index: 1;
	background-color: var(--layer_2_color);
	min-width: 850px;
}
#sorters > div {
	display: inline-block;
	margin: 4px 10px;
	padding: 4px;
	box-sizing: border-box;
	border-bottom: 1px solid var(--input_color);
	cursor: pointer;
}

#sorters > :first-child,
.node > :first-child {
	flex-shrink: 1;
	flex-grow: 1;
}
#sorters > :not(:first-child),
.node > :not(:first-child) {
	flex-shrink: 0;
	flex-grow: 0;
}

#directory_area {
	flex: 1 1 auto;
	margin: 0;
	padding: 0;
	overflow-x: auto;
	text-align: left;
	box-sizing: border-box;
}
#node_container {
	/* Required because we use padding for moving the nodes down when items
	above are out of view*/
	box-sizing: border-box;
	display: block;
	min-width: 850px;
}

#footer {
	flex-shrink: 0;
	text-align: left;
}

.node {
	display: flex;
	flex-direction: row;

	position: static;
	height: 40px;
	overflow: hidden;

	/* I use padding instead of margin here because it goves me more precise
	control over the size.
	Check out https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing*/
	margin: 0;
	box-sizing: border-box;
	color: var(--text_color);
	text-decoration: none;
}
.node:hover:not(.node_selected) {
	background-color: var(--input_color_dark);
	color: var(--input_text_color);
	text-decoration: none;
}
.node_selected {
	background-color: var(--highlight_color);
	color: var(--highlight_text_color);
}
.node > div {
	height: 100%;
	overflow: hidden;
	margin: auto 10px;
	padding: 4px;
	box-sizing: border-box;
	display: inline-block;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.node > div > span {
	margin: auto;
	box-sizing: border-box;
	display: block;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.node > div > img {
	max-height: 100%;
	margin-right: 6px;
	width: auto;
	min-width: auto;
	float: left;
	display: block;
}
</style>
