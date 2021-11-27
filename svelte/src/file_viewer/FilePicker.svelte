<script>
import { createEventDispatcher, tick } from "svelte";
import { formatDataVolume } from "../util/Formatting.svelte";
import DirectoryElement from "../user_file_manager/DirectoryElement.svelte";
import Modal from "../util/Modal.svelte";
let dispatch = createEventDispatcher()

let modal;
let directory_element;
let input_search;

export const open = async () => {
	modal.show()
	await tick()
	directory_element.setSelectionMode(true)
	get_files()
}

let get_files = () => {
	fetch(window.api_endpoint + "/user/files").then(resp => {
		if (!resp.ok) { Promise.reject("yo") }
		return resp.json()
	}).then(resp => {
		directory_element.reset()

		for (let i in resp.files) {
			directory_element.addFile(
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

		directory_element.renderFiles()
	}).catch((err) => {
		throw (err)
	})
}


const search = (e) => {
	if (e.keyCode === 27) { // Escape
		e.preventDefault()
		input_search.value = ""
		input_search.blur()
	}
	requestAnimationFrame(() => {
		directory_element.search(input_search.value)
	})
}

let done = () => {
	dispatch("files", directory_element.getSelectedFiles())
	modal.hide()
}


const keydown = (e) => {
	if (e.ctrlKey || e.altKey || e.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}
	if (document.activeElement.type && document.activeElement.type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}
	if (e.key === "/") {
		e.preventDefault()
		input_search.focus()
	}
}

</script>

<svelte:window on:keydown={keydown} />

<Modal bind:this={modal} width="1400px" height="1200px">
	<div class="header" slot="title">
		<button class="button round" on:click={modal.hide}>
			<i class="icon">close</i> Cancel
		</button>
		<div class="title">Select files to add to album</div>
		<input bind:this={input_search} on:keyup={search} class="search" type="text" placeholder="press / to search"/>
		<button class="button button_highlight round" on:click={done}>
			<i class="icon">done</i> Add
		</button>
	</div>
	<div class="dir_container">
		<DirectoryElement bind:this={directory_element}></DirectoryElement>
	</div>
</Modal>

<style>
.dir_container {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.header {
	flex-grow: 1;
	flex-shrink: 1;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	font-size: 1.2em;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.title {
	flex-grow: 1;
	flex-shrink: 1;
}
@media(max-width: 800px) {
	.title {
		/* display: none; */
		content: "";
	}
}
.search {
	min-width: 100px;
	max-width: 300px;
	flex-grow: 1;
	flex-shrink: 1;
}
.button {
	flex-grow: 0;
	flex-shrink: 0;
}
</style>
