<script>
import { onMount } from "svelte";

export let file = {
	id: "",
	name: "",
	mime_type: "",
	size: 0,
	get_href: "",
}
let container
let text_type = ""

$: update_file(file.id)
const update_file = async () => {
	if (file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.mime_type === "text/demo") {
		markdown()
	} else if (file.name.endsWith(".txt")) {
		text()
	} else {
		code()
	}
}

onMount(update_file)

let md_container
const markdown = () => {
	text_type = "markdown"

	fetch("/u/" + file.id + "/preview").then(resp => {
		if (!resp.ok) { return Promise.reject(resp.status) }
		return resp.text()
	}).then(resp => {
		md_container.innerHTML = resp
	}).catch(err => {
		md_container.innerText = "Error loading file: " + err
	})
}

let text_pre
const text = () => {
	text_type = "text"

	if (file.size > 1 << 20) { // File larger than 1 MiB
		text_pre.innerText = "File is too large to view online.\nPlease download and view it locally."
		return
	}

	fetch(file.get_href).then(resp => {
		if (!resp.ok) { return Promise.reject(resp.status) }
		return resp.text()
	}).then(resp => {
		text_pre.innerText = resp
	}).catch(err => {
		text_pre.innerText = "Error loading file: " + err
	})
}

let code_pre
let prettyprint = false
const code = () => {
	text_type = "code"

	if (file.size > 1 << 20) { // File larger than 1 MiB
		code_pre.innerText = "File is too large to view online.\nPlease download and view it locally."
		return
	}

	fetch(file.get_href).then(resp => {
		if (!resp.ok) { return Promise.reject(resp.status) }
		return resp.text()
	}).then(resp => {
		code_pre.innerText = resp

		// Load prettyprint script
		if (!prettyprint) {
			let prettyprint = document.createElement("script")
			prettyprint.src = "https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js?skin=desert"
			container.appendChild(prettyprint)
			prettyprint = true
		} else {
			PR.prettyPrint()
		}
	}).catch(err => {
		code_pre.innerText = "Error loading file: " + err
	})
}
</script>


<div bind:this={container} class="container">
	{#if text_type === "markdown"}
		<div bind:this={md_container}>
			Loading...
		</div>
	{:else if text_type === "text"}
		<pre bind:this={text_pre}>
			Loading...
		</pre>
	{:else if text_type === "code"}
		<pre bind:this={code_pre} class="pre-container prettyprint linenums">
			Loading...
		</pre>
	{/if}
</div>

<style>
.container {
	background: #333 none;
	position: relative;
	text-align: left;
	height: 100%;
	width: 100%;
	font-size: 0.9em;
	line-height: 1.5em;
	padding: 5px 5px 5px 20px;
	overflow-y: scroll;
	overflow-x: hidden;
}
.container > pre {
	white-space: pre-wrap;
	overflow: hidden;
	border: none;
}
</style>
