<script lang="ts">
import { tick } from "svelte";
import { formatDataVolume } from "util/Formatting";
import DirectoryElement from "user_home/filemanager/DirectoryElement.svelte";
import Modal from "util/Modal.svelte";

let { multi_select = true, title = "", on_files }: {
	multi_select?: boolean;
	title?: string;
	on_files: (files: any[]) => void;
} = $props();
let modal: Modal = $state()
let directory_element: DirectoryElement = $state()
let input_search: HTMLInputElement = $state()

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
	let selected_files = directory_element.getSelectedFiles()
	if (selected_files.length > 0) {
		on_files(selected_files)
	}
	modal.hide()
}

const keydown = (e) => {
	if (!modal.is_visible()) {
		return // Prevent a closed window from catching key events
	} else if (e.ctrlKey || e.altKey || e.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	} else if ((document.activeElement as any).type && (document.activeElement as any).type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}
	if (e.key === "/") {
		e.preventDefault()
		input_search.focus()
	}
}
</script>

<svelte:window onkeydown={keydown} />

<Modal bind:this={modal} width="1400px" height="1200px">
	{#snippet header()}
		<div class="header">
			<button class="button round" onclick={modal.hide}>
				<i class="icon i_close"></i> Cancel
			</button>
			<div class="title">
				{title}
			</div>
			<input bind:this={input_search} onkeyup={search} class="search" type="text" placeholder="press / to search"/>
			<button class="button button_highlight round" onclick={done}>
				<i class="icon i_done"></i> Add
			</button>
		</div>
	{/snippet}
	<div class="dir_container">
		<DirectoryElement bind:this={directory_element} multi_select={multi_select}></DirectoryElement>
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
	font-size: 1em;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.title {
	flex-grow: 1;
	flex-shrink: 1;
	text-align: center;
	font-size: 1.2em;
}
.search {
	min-width: 100px;
	max-width: 300px;
	flex-grow: 1;
	flex-shrink: 1;
	align-self: stretch;
}
@media(max-width: 700px) {
	.title {
		display: none;
	}
	.search {
		max-width: none;
	}
}
.button {
	flex-grow: 0;
	flex-shrink: 0;
}
</style>
