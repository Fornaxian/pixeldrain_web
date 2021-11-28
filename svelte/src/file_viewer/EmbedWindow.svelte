<script>
import { copy_text, domain_url } from "../util/Util.svelte";
import { file_type } from "./FileUtilities.svelte";

export let file = {
	id: "",
	mime_type: "",
	get_href: "",
	download_href: "",
}
export let list = {
	id: "",
}

let tab = "iframe"
let embed_html = ""
let preview_area

$: update_file(file.id, list.id)
let update_file = () => {
	if (preview_area) {
		preview_area.innerHTML = ""
	}

	if (tab === "iframe") {
		embed_iframe()
	} else if (tab === "hotlink") {
		embed_hotlink()
	}
}

let embed_iframe = () => {
	tab = "iframe"

	let url
	if (list.id === "") {
		// Not a list, use file ID
		url = domain_url()+"/u/"+file.id+"?embed"
	} else {
		url = domain_url()+"/l/"+list.id+"?embed"+window.location.hash
	}

	embed_html = `<iframe ` +
		`src="${url}" ` +
		`style="border: none; width: 800px; max-width: 100%; height: 600px; max-height: 100%; border-radius: 16px;"` +
		`></iframe>`
}
let embed_hotlink = () => {
	tab = "hotlink"

	let t = file_type(file)
	if (t === "video") {
		embed_html = `<video controls playsinline autoplay style="max-width: 100%; max-height: 100%;">`+
			`<source src="${domain_url()}${file.get_href}" type="${file.mime_type}" />`+
			`</video>`
	} else if (t === "audio") {
		embed_html = `<audio controls autoplay style="width: 100%;">`+
			`<source src="${domain_url()}${file.get_href}" type="${file.mime_type}" />`+
			`</audio>`
	} else if (t === "image") {
		embed_html = `<img src="${domain_url()}${file.get_href}" alt="${html_escape(file.name)}" style="max-width: 100%; max-height: 100%;">`
	} else {
		embed_html = `<a href="${domain_url()}${file.download_href}">`+
			`Download ${html_escape(file.name)} here`+
			`</a>`
	}
}

let html_escape = s => {
	return s.replace(/&/g, "&amp;").
		replace(/</g, "&lt;").
		replace(/>/g, "&gt;").
		replace(/"/g, "&quot;").
		replace(/'/g, "&#039;");
}

let copy_status = "" // empty, success or error
const copy = () => {
	if (copy_text(embed_html)) {
		copy_status = "success"
	} else {
		copy_status = "error"
		alert("Your browser does not support copying text.")
	}
}

const example = () => {
	preview_area.innerHTML = embed_html
}
</script>

<div class="container">
	<p>
		If you have a website you can embed pixeldrain files in your own
		webpages here.
	</p>
	<p>
		The IFrame embed gives you a frame with a slightly more minimalistic
		file viewer in it. The embedded file viewer has a fullscreen button and
		the toolbar is collapsed by default. If you do not have a pixeldrain Pro
		account the frame will also have advertisements in it.
	</p>
	<p>
		The hotlink embed option only works for single files uploaded with a Pro
		account. You can use this to directly embed a video player, audio
		player, photo element or a download button in your site. Make sure you
		have bandwidth sharing enabled on your
		<a href="/user/subscription">subscription page</a> or the embed will not
		work.
	</p>
	<div class="tab_bar">
		<button on:click={embed_iframe} class:button_highlight={tab === "iframe"}>
			<i class="icon">code</i>
			IFrame
		</button>
		{#if file.id}
			<button on:click={embed_hotlink} class:button_highlight={tab === "hotlink"}>
				<i class="icon">code</i>
				Hotlink
			</button>
		{/if}
	</div>
	<h3>Code</h3>
	<p>
		Put this code in your website to embed the file.
	</p>
	<div class="center">
		<textarea bind:value={embed_html} style="width: 95%; height: 4em;"></textarea>
		<br/>
		<button on:click={copy} class:button_highlight={copy_status === "success"} class:button_red={copy_status === "error"}>
			<i class="icon">content_copy</i>
			{#if copy_status === "success"}
				Copied!
			{:else if copy_status === "error"}
				Error!
			{:else}
				Copy HTML
			{/if}
		</button>
		<button on:click={example}>
			<i class="icon">visibility</i> Show example
		</button>
	</div>
	<h3>Example</h3>
	<div bind:this={preview_area} style="text-align: center;"></div>
</div>

<style>
.center {
	text-align: center;
}
.container {
	width: 100%;
	overflow: hidden;
}
</style>
