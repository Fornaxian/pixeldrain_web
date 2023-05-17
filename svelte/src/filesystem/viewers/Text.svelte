<script>
import { fs_file_url } from "../FilesystemUtil";

export let state
let text_pre

$: set_file(state.base)

export const set_file = file => {
	console.debug("Loading text file", file.name)

	if (file.size > 1 << 22) { // File larger than 4 MiB
		text_pre.innerText = "File is too large to view online.\nPlease download and view it locally."
		return
	}

	fetch(fs_file_url(state.root.id, file.path)).then(resp => {
		if (!resp.ok) { return Promise.reject(resp.status) }
		return resp.text()
	}).then(resp => {
		text_pre.innerText = resp
	}).catch(err => {
		text_pre.innerText = "Error loading file: " + err
	})
}
</script>


<div class="container">
	<pre bind:this={text_pre}>
		Loading...
	</pre>
</div>

<style>
.container {
	background: var(--body_color);
	text-align: left;
	height: 100%;
	width: 100%;
	line-height: 1.5em;
	overflow-y: auto;
	overflow-x: hidden;
}
.container > pre {
	margin: 0;
	padding: 10px;
	white-space: pre-wrap;
	overflow: hidden;
	border: none;
	font-size: 0.9em;
}
</style>
