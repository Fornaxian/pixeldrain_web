<script>
import { formatDataVolume, formatDate } from "../util/Formatting.svelte";

// Main elements
let directoryArea
let directorySorters
let nodeContainer
let statusBar = "Loading..."

// Internal state, contains a list of all files in the directory, visible
// files in the directory and the last scroll position. These are used for
// rendering the file list correctly

// type: {icon, name, href, type, size, sizeLabel, dateCreated, selected}
let allFiles = []

export const reset = () => {
	allFiles = []
}

export const addFile = (id, icon, name, href, type, size, sizeLabel, dateCreated) => {
	allFiles.push({
		id: id,
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

export const getSelectedFiles = () => {
	let selectedFiles = []

	for (let i in allFiles) {
		if (allFiles[i].selected) {
			selectedFiles.push(allFiles[i])
		}
	}

	return selectedFiles
}

// search filters the allFiles array on a search term. All files which match the
// search term will be put into visibleFiles. The visibleFiles array will then
// be rendered by render_visible_files
let lastSearchTerm = ""
export const search = (term) => {
	term = term.toLowerCase()
	lastSearchTerm = term

	if (term === "") {
		for (let i in allFiles) {
			allFiles[i].filtered = false
		}
		sortBy("")
		render_visible_files()
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
	render_visible_files()
}

// searchSubmit opens the first file in the search results
export const searchSubmit = () => {
	for (let i in allFiles) {
		if (allFiles[i].visible && !allFiles[i].filtered) {
			window.open(allFiles[i].href, "_blank")
			break
		}
	}
}

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

	render_visible_files()
}

// Scroll event for rendering new file nodes when they become visible. For
// performance reasons the files will only be rendered once every 100ms. If a
// scroll event comes in and we're not done with the previous frame yet the
// event will be ignored
let render_timeout = false;
const onScroll = (e) => {
	if (render_timeout) {
		return
	}

	render_timeout = true
	setTimeout(() => {
		render_visible_files()
		render_timeout = false
	}, 100)
}

const render_visible_files = () => {
	const fileHeight = 40

	let paddingTop = directoryArea.scrollTop - directoryArea.scrollTop % fileHeight
	let start = Math.floor(paddingTop / fileHeight) - 5
	if (start < 0) { start = 0 }

	let end = Math.ceil((paddingTop + directoryArea.clientHeight) / fileHeight) + 5
	if (end > allFiles.length) { end = allFiles.length - 1 }

	nodeContainer.style.paddingTop = (start * fileHeight) + "px"

	// All files which have not been filtered out by the search function. We
	// pretend that files with filtered == true do not exist
	let totalFiles = 0
	let totalSize = 0
	let selectedFiles = 0
	let selectedSize = 0

	for (let i in allFiles) {
		if (totalFiles >= start && totalFiles <= end && !allFiles[i].filtered) {
			allFiles[i].visible = true
		} else {
			allFiles[i].visible = false
		}
		if (!allFiles[i].filtered) {
			totalFiles++
			totalSize += allFiles[i].size

			if (allFiles[i].selected) {
				selectedFiles++
				selectedSize += allFiles[i].size
			}
		}
	}

	nodeContainer.style.height = (totalFiles * fileHeight) + "px"
	statusBar = totalFiles + " items ("+formatDataVolume(totalSize, 4)+")"

	if (selectedFiles !== 0) {
		statusBar += ", "+selectedFiles+" selected ("+formatDataVolume(selectedSize, 4)+")"
	}

	console.debug(
		"start " + start +
		" end " + end +
		" children " + nodeContainer.childElementCount
	)
}

let selectionMode = false
export const setSelectionMode = (s) => {
	selectionMode = s

	// When selection mode is disabled we automatically deselect all files
	if (!s) {
		for (let i in allFiles) {
			allFiles[i].selected = false
		}
		render_visible_files()
	}
}

let shift_pressed = false
const detect_shift = (e) => {
	if (e.key !== "Shift") {
		return
	}

	shift_pressed = e.type === "keydown"
}

let last_selected_node = -1
const node_click = (index) => {
	if (selectionMode) {
		if (shift_pressed && last_selected_node != -1) {
			let id_low = last_selected_node
			let id_high = last_selected_node
			if (last_selected_node < index) {
				id_high = index
			} else {
				id_low = index
			}

			for (let i = id_low; i <= id_high && !allFiles[i].filtered; i++) {
				if (i != last_selected_node) {
					allFiles[i].selected = !allFiles[i].selected
				}
			}
		} else {
			allFiles[index].selected = !allFiles[index].selected
		}

		last_selected_node = index
		render_visible_files()
	} else {
		window.open(allFiles[index].href, "_blank")
	}
}
</script>

<svelte:window on:keydown={detect_shift} on:keyup={detect_shift} />

<div id="directory_element">
	<div bind:this={directoryArea} on:scroll={onScroll} id="directory_area" class="directory_area">
		<div bind:this={directorySorters} id="sorters" class="directory_sorters">
			{#each tableColumns as col}
				<div on:click={sortBy(col.field)} style="min-width: {col.width}">{col.name}</div>
			{/each}
		</div>
		<div bind:this={nodeContainer} id="node_container" class="directory_node_container">
			{#each allFiles as file, index}
				{#if file.visible && !file.filtered}
					<a class="node"
						href={file.href}
						target="_blank"
						title="{file.name}"
						class:node_selected={file.selected}
						on:click|preventDefault={() => {node_click(index)}}
					>
						<div>
							<img src={file.icon} alt="thumbnail" />
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
	<div id="footer">
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
}
#node_container {
	display: block;
	min-width: 850px;
}

#footer {
	flex-shrink: 0;
	text-align: left;
	background-color: var(--layer_1_color);
	padding: 4px;
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
	color: var(--text_color);
	text-decoration: none;
}
.node:hover:not(.node_selected) {
	background-color: var(--input_color_dark);
	color: var(--input_text_color);
	text-decoration: none;
}
.node_selected {
	background-color: var(--highlight_color_dark);
	color: var(--highlight_text_color);
}
.node > div {
	height: 100%;
	overflow: hidden;
	margin: auto 10px;
	padding: 4px;
	display: inline-block;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.node > div > span {
	margin: auto;
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
