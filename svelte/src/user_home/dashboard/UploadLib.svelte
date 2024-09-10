<script>
import UploadProgressBar from "../../home_page/UploadProgressBar.svelte"
import { tick } from "svelte"
import UploadStats from "../../home_page/UploadStats.svelte";

export const pick_files = () => {
	file_input_field.click()
}

// === UPLOAD LOGIC ===

let file_input_field
const file_input_change = (event) => {
	// Start uploading the files async
	upload_files(event.target.files)

	// This resets the file input field
	file_input_field.nodeValue = ""
}
const paste = (e) => {
	if (e.clipboardData.files[0]) {
		e.preventDefault();
		e.stopPropagation();
		upload_files(e.clipboardData.files)
	}
}

let active_uploads = 0
let upload_queue = []
let state = "idle" // idle, uploading, finished
let upload_stats

export const upload_files = async (files) => {
	if (files.length === 0) {
		return
	}

	// Add files to the queue
	for (let i = 0; i < files.length; i++) {
		if (files[i].type === "" && files[i].size === 0) {
			continue
		}

		upload_queue.push({
			file: files[i],
			name: files[i].name,
			status: "queued",
			component: null,
			id: "",
			total_size: files[i].size,
			loaded_size: 0,
			on_finished: finish_upload,
		})
	}

	// Reassign array and wait for tick to complete. After the tick is completed
	// each upload progress bar will have bound itself to its array item
	upload_queue = upload_queue
	await tick()

	start_upload()
}

const start_upload = () => {
	let finished_count = 0

	for (let i = 0; i < upload_queue.length && active_uploads < 3; i++) {
		if (upload_queue[i].status == "queued") {
			active_uploads++
			upload_queue[i].component.start()
		} else if (
			upload_queue[i].status == "finished" ||
			upload_queue[i].status == "error"
		) {
			finished_count++
		}
	}

	if (active_uploads === 0 && finished_count != 0) {
		state = "finished"
		upload_stats.finish()
	} else {
		state = "uploading"
		upload_stats.start()
	}
}

const finish_upload = (file) => {
	active_uploads--
	start_upload()
}

const leave_confirmation = e => {
	if (state === "uploading") {
		e.preventDefault()
		e.returnValue = "If you close the page your files will stop uploading. Do you want to continue?"
		return e.returnValue
	} else {
		return null
	}
}

// === SHARING BUTTONS ===

let share_link = ""
let input_album_name = ""

let btn_create_list

const create_list = async (title, anonymous) => {
	let files = upload_queue.reduce(
		(acc, curr) => {
			if (curr.status === "finished") {
				acc.push({"id": curr.id})
			}
			return acc
		},
		[],
	)

	const resp = await fetch(
		window.api_endpoint+"/list",
		{
			method: "POST",
			headers: { "Content-Type": "application/json; charset=UTF-8" },
			body: JSON.stringify({
				"title": title,
				"anonymous": anonymous,
				"files": files
			})
		}
	)
	if(!resp.ok) {
		return Promise.reject("HTTP error: "+resp.status)
	}
	return await resp.json()
}

const share_mail = () => window.open("mailto:please@set.address?subject=File%20on%20pixeldrain&body=" + share_link)
const share_twitter = () => window.open("https://twitter.com/share?url=" + share_link)
const share_facebook = () => window.open('https://www.facebook.com/sharer.php?u=' + share_link)
const share_reddit = () => window.open('https://www.reddit.com/submit?url=' + share_link)
const share_tumblr = () => window.open('https://www.tumblr.com/share/link?url=' + share_link)

const create_album = () => {
	if (!input_album_name) {
		return
	}
	create_list(input_album_name, false).then(resp => {
		window.location = '/l/' + resp.id
	}).catch(err => {
		alert("Failed to create list. Server says this:\n"+err)
	})
}

const keydown = (e) => {
	if (e.ctrlKey || e.altKey || e.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}
	if (document.activeElement.type && document.activeElement.type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}
	switch (e.key) {
	case "u": file_input_field.click();   break
	case "l": btn_create_list.click();    break
	case "e": share_mail();     break
	case "w": share_twitter();  break
	case "f": share_facebook(); break
	case "r": share_reddit();   break
	case "m": share_tumblr();   break
	}
}
</script>

<svelte:window on:paste={paste} on:keydown={keydown} on:beforeunload={leave_confirmation} />

<input bind:this={file_input_field} on:change={file_input_change} type="file" name="file" multiple="multiple" class="hide"/>

<UploadStats bind:this={upload_stats} upload_queue={upload_queue}/>

{#if upload_queue.length > 1}
	<div class="album_widget">
		Create an album<br/>
		<form class="album_name_form" on:submit|preventDefault={create_album}>
			<div>Name:</div>
			<input bind:value={input_album_name} type="text" placeholder="My album"/>
			<button type="submit" disabled={state !== "finished"}>
				<i class="icon">create_new_folder</i> Create
			</button>
		</form>
	</div>
{/if}

{#each upload_queue as file}
	<UploadProgressBar bind:this={file.component} job={file}></UploadProgressBar>
{/each}

<style>
.album_widget {
	display: block;
	border-bottom: 1px solid var(--separator);
}
.album_name_form {
	display: inline-flex;
	flex-direction: row;
	align-items: center;
}
.hide {
	display: none;
}
</style>
