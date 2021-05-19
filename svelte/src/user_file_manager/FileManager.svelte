<script>
import { onMount } from "svelte";
import { formatDataVolume } from "../util/Formatting.svelte";
import Spinner from "../util/Spinner.svelte";
import DirectoryElement from "./DirectoryElement.svelte"

let loading = true
let inputSearch
let directoryElement

let getUserFiles = () => {
	loading = true

	fetch(window.api_endpoint + "/user/files").then(resp => {
		if (!resp.ok) { Promise.reject("yo") }
		return resp.json()
	}).then(resp => {
		directoryElement.reset()

		for (let i in resp.files) {
			directoryElement.addFile(
				window.api_endpoint + "/file/" + resp.files[i].id + "/thumbnail?width=32&height=32",
				resp.files[i].name,
				"/u/" + resp.files[i].id,
				resp.files[i].mime_type,
				resp.files[i].size,
				formatDataVolume(resp.files[i].size, 4),
				resp.files[i].date_upload,
			)
		}

		directoryElement.renderFiles()
	}).catch((err) => {
		throw (err)
	}).finally(() => {
		loading = false
	})
}

let getUserLists = () => {
	loading = true

	fetch(window.api_endpoint + "/user/lists").then(resp => {
		if (!resp.ok) { Promise.reject("yo") }
		return resp.json()
	}).then(resp => {
		directoryElement.reset()

		for (let i in resp.lists) {
			directoryElement.addFile(
				window.api_endpoint + "/list/" + resp.lists[i].id + "/thumbnail?width=32&height=32",
				resp.lists[i].title,
				"/l/" + resp.lists[i].id,
				"list",
				resp.lists[i].file_count,
				resp.lists[i].file_count + " files",
				resp.lists[i].date_created,
			)
		}

		directoryElement.renderFiles()
	}).catch((err) => {
		throw (err)
	}).finally(() => {
		loading = false
	})
}

const searchHandler = (e) => {
	if (e.keyCode === 27) { // Escape
		e.preventDefault()
		inputSearch.blur()
		return
	} else if (e.keyCode === 13) { // Enter
		e.preventDefault()
		directoryElement.searchSubmit()
		return
	}
	requestAnimationFrame(() => {
		directoryElement.search(inputSearch.value)
	})
}

let keyboardEvent = (e) => {
	console.log("Pressed: " + e.keyCode)

	// CTRL + F or "/" opens the search bar
	if (e.ctrlKey && e.keyCode === 70 || !e.ctrlKey && e.keyCode === 191) {
		e.preventDefault()
		inputSearch.focus()
	}
}

let initialized = false
let hashChange = () => {
	if (!initialized) {
		return
	}
	if (window.location.hash === "#lists") {
		document.title = "My Lists"
		getUserLists()
	} else {
		document.title = "My Files"
		getUserFiles()
	}
}

let selecting = false
const toggleSelecting = () => {
	selecting = !selecting
	directoryElement.setSelectionMode(selecting)
}

onMount(() => {
	initialized = true
	hashChange()
})

</script>

<svelte:window on:keydown={keyboardEvent} on:hashchange={hashChange} />

<div id="file_manager" class="file_manager">
	<div id="nav_bar" class="nav_bar highlight_1">
		<button id="btn_menu" onclick="toggleMenu()"><i class="icon">menu</i></button>
		<button on:click={toggleSelecting} id="btn_select" class:button_highlight={selecting}>
			<i class="icon">select_all</i> Select
		</button>
		<div class="spacer"></div>
		<input bind:this={inputSearch} on:keyup={searchHandler} id="input_search" class="input_search" type="text" placeholder="press / to search"/>
		<div class="spacer"></div>
		<button on:click={hashChange} id="btn_reload"><i class="icon">refresh</i></button>
	</div>
	{#if selecting}
		<div class="nav_bar highlight_3">
			Buttons to make a list and bulk delete files will show up here soon. Stay tuned ;-)
			<!-- <button ><i class="icon">list</i> Make list</button>
			<div class="fill"></div>
			<button class="button_red"><i class="icon">delete</i> Delete</button> -->
		</div>
	{/if}

	{#if loading}
	<div class="spinner">
		<Spinner></Spinner>
	</div>
	{/if}
	<DirectoryElement bind:this={directoryElement}></DirectoryElement>
</div>

<style>
:global(#page_body) {
	height: 100%;
	padding: 0;
}

/* Override the menu button so it doesn't overlap the file manager when the menu
is collapsed */
:global(#button_toggle_navigation) {
	display: none;
}

#file_manager {
	position:         absolute;
	padding:          0;
	background-color: var(--layer_2_color);
	width:            100%;
	height:           100%;
	display:          flex;
	flex-direction:   column;
}
.nav_bar {
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
}
#nav_bar > button {
	flex-shrink: 0;
}
.spacer {
	width: 8px;
}
/* .fill {
	flex: 1 1 auto;
} */
.input_search {
	flex: 1 1 auto;
	min-width: 100px;
}

.spinner {
	position: absolute;
	display: block;
	margin: auto;
	max-width: 100%;
	max-height: 100%;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 100px;
	height: 100px;
}

</style>
