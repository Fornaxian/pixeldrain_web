<script>
import { tick } from "svelte";


let container
let text_type = ""

export const set_file = file => {
	console.log("loading text file", file.id)

	if (file.name.endsWith(".md") || file.name.endsWith(".markdown") || file.mime_type === "text/demo") {
		markdown(file)
	} else if (file.name.endsWith(".txt")) {
		text(file)
	} else {
		code(file)
	}
}

let md_container
const markdown = async file => {
	text_type = "markdown"
	await tick()

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
const text = async file => {
	text_type = "text"
	await tick()

	if (file.size > 1 << 22) { // File larger than 4 MiB
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
const code = async file => {
	text_type = "code"
	await tick()

	if (file.size > 1 << 22) { // File larger than 4 MiB
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
		<section bind:this={md_container} class="md">
			Loading...
		</section>
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
	background: var(--body_background);
	position: relative;
	text-align: left;
	height: 100%;
	width: 100%;
	font-size: 0.9em;
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
}
.container > .md {
	display: block;
	padding: 10px;
	margin: auto;
}
</style>
