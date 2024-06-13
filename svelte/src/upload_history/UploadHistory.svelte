<script>
import { onMount } from "svelte";
import { formatDate } from "../util/Formatting.svelte";
import Footer from "../layout/Footer.svelte"
import Button from "../layout/Button.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte"

let files = []
let loading = true

const parse_file_list = () => {
	// Get the file IDs from localstorage
	let uploadsStr = localStorage.getItem("uploaded_files")
	if (uploadsStr === null) {
		uploadsStr = ""
	}

	return uploadsStr.split(",")
}

const save_file_list = () => {
	if (loading) {
		alert("Please wait for the file list to finish loading first")
		return
	}

	const id_list = files.reduce((acc, val) => {
		acc.push(val.id)
		return acc
	}, [])

	localStorage.setItem("uploaded_files", id_list.join(","))
}

// index is the index of the file ID in localstorage, id is the public file ID
// of the file
const remove_file = (id) => {
	// Remove the file from the rendered files list
	for (let i = 0; i < files.length; i++) {
		if (id === files[i].id) {
			console.debug("Removing file", id, "at index", i)
			files.splice(i, 1)
			files = files
			break
		}
	}

	save_file_list()
}

const get_files = async () => {
	const file_ids = parse_file_list()

	for (const id of file_ids) {
		if (id === "") {
			continue
		}

		const resp = await fetch(window.api_endpoint + "/file/" + id + "/info")
		if (resp.status === 404) {
			continue
		} else if (resp.status >= 400) {
			throw new Error(await resp.json())
		}
		files.push(await resp.json())
		files = files
	}

	loading = false
	save_file_list()
}

onMount(() => get_files())
</script>

<LoadingIndicator loading={loading}/>

<header>
	<h1>File upload history</h1>
</header>

<div id="page_content" class="page_content">
	<section>
		<p>
			Here are all files you have previously uploaded to pixeldrain using this
			computer. This data is saved locally in your web browser and gets updated
			every time you upload a file through your current browser.
		</p>
	</section>

	{#each files as file (file.id)}
		<a class="file_button" href="/u/{file.id}" target="_blank">
			<img src="/api/file/{file.id}/thumbnail?width=80&amp;height=80" alt="{file.name}">
			<div>
				<span class="file_button_title">
					{file.name}
				</span>
				<br/>
				<span class="file_button_subtitle">
					{formatDate(file.date_upload, true, true, true)}
				</span>
			</div>
			<Button
				click={e => {
					e.preventDefault()
					e.stopPropagation()
					remove_file(file.id)
				}}
				icon="cancel"
			/>
		</a>
	{/each}
</div>

<Footer/>

<style>
.file_button {
	display: inline-flex;
	flex-direction: row;

	position: relative;
	width: 400px;
	max-width: 90%;
	height: 3.6em;
	margin: 8px;
	padding: 0;
	overflow: hidden;
	border-radius: 6px;
	background: var(--input_background);
	color: var(--body_text_color);
	word-break: break-all;
	text-align: left;
	line-height: 1.2em;
	transition: box-shadow 0.3s, opacity 2s, background 0.2s;
	white-space: normal;
	text-overflow: ellipsis;
	text-decoration: none;
	vertical-align: top;
	cursor: pointer;
}

.file_button:hover {
	text-decoration: none;
	background: var(--input_hover_background);
}

.file_button>img {
	flex: 0 0 auto;
	max-height: 100%;
	max-width: 25%;
	margin-right: 5px;
	display: block;
}

.file_button_title {
	color: var(--link_color);
}
</style>
