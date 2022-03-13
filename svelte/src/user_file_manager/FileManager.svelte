<script>
import { onMount } from "svelte";
import { formatDataVolume } from "../util/Formatting.svelte";
import Modal from "../util/Modal.svelte";
import Spinner from "../util/Spinner.svelte";
import DirectoryElement from "./DirectoryElement.svelte"

let loading = true
let contentType = "" // files or lists
let inputSearch
let directoryElement
let downloadFrame
let help_modal
let help_modal_visible = false

let getUserFiles = () => {
	loading = true

	fetch(window.api_endpoint + "/user/files").then(resp => {
		if (!resp.ok) { Promise.reject("yo") }
		return resp.json()
	}).then(resp => {
		directoryElement.reset()

		for (let i in resp.files) {
			directoryElement.addFile(
				resp.files[i].id,
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
				resp.lists[i].id,
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
		inputSearch.value = ""
		inputSearch.blur()
	} else if (e.keyCode === 13) { // Enter
		e.preventDefault()
		directoryElement.searchSubmit()
		return
	}
	requestAnimationFrame(() => {
		directoryElement.search(inputSearch.value)
	})
}

let initialized = false
let hashChange = () => {
	if (!initialized) {
		return
	}
	if (window.location.hash === "#lists") {
		contentType = "lists"
		document.title = "My Lists"
		getUserLists()
		resetMenu()
	} else {
		contentType = "files"
		document.title = "My Files"
		getUserFiles()
		resetMenu()
	}
}

let selecting = false
const toggleSelecting = () => {
	selecting = !selecting
	directoryElement.setSelectionMode(selecting)
}

const bulkDelete = async () => {
	let selected = directoryElement.getSelectedFiles()

	if (selected.length === 0) {
		alert("You have not selected any files")
		return
	}

	if (contentType === "lists") {
		if (!confirm(
			"You are about to delete "+selected.length+" lists. "+
			"This is not reversible!\n"+
			"Are you sure?"
		)){ return }
	} else {
		if (!confirm(
			"You are about to delete "+selected.length+" files. "+
			"This is not reversible!\n"+
			"Are you sure?"
		)){ return }
	}

	loading = true

	let endpoint = window.api_endpoint+"/file/"
	if (contentType === "lists") {
		endpoint = window.api_endpoint+"/list/"
	}

	for (let i in selected) {
		try {
			const resp = await fetch(
				endpoint+encodeURIComponent(selected[i].id),
				{ method: "DELETE" }
			);
			if(resp.status >= 400) {
				throw new Error(resp.text())
			}
		} catch (err) {
			alert("Delete failed: "+err)
		}
	}

	hashChange()
}

function createList() {
	let selected = directoryElement.getSelectedFiles()

	if (selected.length === 0) {
		alert("You have not selected any files")
		return
	}

	let title = prompt(
		"You are creating a list containing " + selected.length + " files.\n"
		+ "What do you want to call it?", "My New Album"
	)
	if (title === null) {
		return
	}

	let files = selected.reduce(
		(acc, curr) => {
			acc.push({"id": curr.id})
			return acc
		},
		[],
	)

	fetch(
		window.api_endpoint+"/list",
		{
			method: "POST",
			headers: { "Content-Type": "application/json; charset=UTF-8" },
			body: JSON.stringify({
				"title": title,
				"files": files
			})
		}
	).then(resp => {
		if (!resp.ok) {
			return Promise.reject("HTTP error: " + resp.status)
		}
		return resp.json()
	}).then(resp => {
		window.open('/l/' + resp.id, '_blank')
	}).catch(err => {
		alert("Failed to create list. Server says this:\n"+err)
	})
}

function downloadFiles() {
	let selected = directoryElement.getSelectedFiles()

	if (selected.length === 0) {
		alert("You have not selected any files")
		return
	}

	// Create a list of file ID's separated by commas
	let ids = selected.reduce((acc, curr) => acc + curr.id + ",", "")

	// Remove the last comma
	ids = ids.slice(0, -1)

	downloadFrame.src = window.api_endpoint+"/file/"+ids+"?download"
}

const keydown = (e) => {
	if (e.ctrlKey && e.key === "f" || !e.ctrlKey && e.keyCode === 191) {
		e.preventDefault()
		inputSearch.focus()
	}

	if (e.ctrlKey || e.altKey || e.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}
	if (document.activeElement.type && document.activeElement.type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}


	if (e.key === "i") {
		help_modal.toggle()
	} else if (e.key === "/") {
		inputSearch.focus()
	} else {
		return
	}

	// This will only be run if a custom shortcut was triggered
	e.preventDefault()
}

onMount(() => {
	initialized = true
	hashChange()
})

</script>

<svelte:window on:keydown={keydown} on:hashchange={hashChange} />

<div id="file_manager" class="file_manager">
	<div id="nav_bar" class="nav_bar">
		<button id="btn_menu" onclick="toggleMenu()"><i class="icon">menu</i></button>
		<button on:click={toggleSelecting} id="btn_select" class:button_highlight={selecting}>
			<i class="icon">select_all</i> Select
		</button>
		<input bind:this={inputSearch} on:keyup={searchHandler} id="input_search" class="input_search" type="text" placeholder="press / to search"/>
		<button on:click={() => help_modal.toggle()} class:button_highlight={help_modal_visible}>
			<i class="icon">info</i>
		</button>
		<button on:click={hashChange} id="btn_reload">
			<i class="icon">refresh</i>
		</button>
	</div>
	{#if selecting}
		<div class="nav_bar">
			<!-- Buttons to make a list and bulk delete files will show up here soon. Stay tuned ;-) -->
			{#if contentType === "files"}
				<button on:click={createList}><i class="icon">list</i> Make list</button>
				<button on:click={downloadFiles}><i class="icon">download</i> Download</button>
			{/if}
			<button on:click={bulkDelete}><i class="icon">delete</i> Delete</button>
		</div>
	{/if}

	{#if loading}
	<div class="spinner">
		<Spinner></Spinner>
	</div>
	{/if}
	<DirectoryElement bind:this={directoryElement}></DirectoryElement>

	<Modal
		bind:this={help_modal}
		title="File manager help"
		width="600px"
		on:is_visible={e => {help_modal_visible = e.detail}}
	>
		<div class="indent">
			<p>
				In the file manager you can see the files you have uploaded and
				the lists you have created.
			</p>
			<h3>Searching</h3>
			<p>
				By clicking the search bar or pressing the / button you can
				search through your files or lists. Only the entries matching
				your search term will be shown. Pressing Enter will open the
				first search result in a new tab. Pressing Escape will cancel
				the search and all files will be shown again.
			</p>
			<h3>Bulk actions</h3>
			<p>
				With the Select button you can click files to select them. Once
				you have made a selection you can use the buttons on the toolbar
				to either create a list containing the selected files or delete
				them.
			</p>
			<p>
				Holding Shift while selecting a file will select all the files
				between the file you last selected and the file you just
				clicked.
			</p>
		</div>
	</Modal>

	<!-- This frame will load the download URL when a download button is pressed -->
	<iframe bind:this={downloadFrame} title="File download frame" style="display: none; width: 1px; height: 1px;"></iframe>
</div>

<style>
:global(#page_body) {
	height: 100vh;
	padding: 0;
	background: none;
}

/* Override the menu button so it doesn't overlap the file manager when the menu
is collapsed */
:global(#button_toggle_navigation) {
	display: none;
}

#file_manager {
	position:         absolute;
	padding:          0;
	width:            100%;
	height:           100%;
	display:          flex;
	flex-direction:   column;
}
.nav_bar {
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
	padding: 4px;
}
.nav_bar > button {
	flex-shrink: 0;
}
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
