<script>
import { tick } from "svelte";
import { fs_path_url } from "../FilesystemAPI";

export let nav
let text_type = "text"

export const update = () => {
	console.debug("Loading text file", nav.base.name)

	if (nav.base.size > 1 << 21) { // File larger than 2 MiB
		text_pre.innerText = "File is too large to view online.\nPlease download and view it locally."
		return
	}

	if (
		nav.base.file_type.startsWith("text/markdown") ||
		nav.base.name.endsWith(".md") ||
		nav.base.name.endsWith(".markdown")
	) {
		markdown(nav.base)
	} else {
		text(nav.base)
	}
}

let text_pre
const text = async file => {
	text_type = "text"
	await tick()

	fetch(fs_path_url(file.path)).then(resp => {
		if (!resp.ok) {
			return Promise.reject(resp.status)
		}
		return resp.text()
	}).then(resp => {
		text_pre.innerText = resp
	}).catch(err => {
		text_pre.innerText = "Error loading file: " + err
	})
}

let md_container
const markdown = async file => {
	text_type = "markdown"
	await tick()

	fetch(fs_path_url(file.path)+"?render_markdown").then(resp => {
		if (!resp.ok) {
			return Promise.reject(resp.status)
		}
		return resp.text()
	}).then(resp => {
		md_container.innerHTML = resp
	}).catch(err => {
		md_container.innerText = "Error loading file: " + err
	})
}
</script>

<div class="container">
	<slot></slot>

	{#if text_type === "markdown"}
		<section bind:this={md_container} class="md">
			Loading...
		</section>
	{:else if text_type === "text"}
		<pre bind:this={text_pre}>
			Loading...
		</pre>
	{/if}
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
	word-break: break-word;
}
.container > .md {
	display: block;
	padding: 10px;
	margin: auto;
	text-align: justify;
}
</style>
