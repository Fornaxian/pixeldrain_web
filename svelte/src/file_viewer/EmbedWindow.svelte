<script>
import CopyButton from "layout/CopyButton.svelte";
import ThemePicker from "util/ThemePicker.svelte";
import { domain_url } from "util/Util.svelte";
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

let style = ""
let set_style = s => {
	style = s
	embed_iframe()
	update_example()
}

let embed_iframe = () => {
	tab = "iframe"

	let style_part = ""
	if (style) {
		style_part = "&style="+style
	}

	let url
	if (list.id === "") {
		// Not a list, use file ID
		url = domain_url()+"/u/"+file.id+"?embed"+style_part
	} else {
		url = domain_url()+"/l/"+list.id+"?embed"+style_part+window.location.hash
	}

	embed_html = `<iframe ` +
		`src="${url}" ` +
		`style="border: none; width: 800px; max-width: 100%; height: 600px; max-height: 100%; border-radius: 8px;" ` +
		`allowfullscreen` +
		`></iframe>`
}
let embed_hotlink = () => {
	tab = "hotlink"

	let t = file_type(file)
	if (t === "video") {
		embed_html = `<video controls playsinline style="max-width: 100%; max-height: 100%;">`+
			`<source src="${domain_url()}${file.get_href}" type="${file.mime_type}" />`+
			`</video>`
	} else if (t === "audio") {
		embed_html = `<audio controls style="width: 100%;">`+
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

let example = false
const toggle_example = () => {
	example = !example
	update_example()
}
const update_example = () => {
	if (example) {
		preview_area.innerHTML = embed_html
	} else {
		preview_area.innerHTML = ""
	}
}
</script>

<div class="container">
	<div class="indent">
		<p>
			If you have a website you can embed pixeldrain files in your own
			webpages here.
		</p>
		<p>
			The IFrame embed gives you a frame with a slightly more minimalistic
			file viewer in it. The embedded file viewer has a fullscreen button
			and the toolbar is collapsed by default. If you do not have a
			pixeldrain Pro account the frame will also have advertisements in
			it.
		</p>
		<p>
			Embedding is a premium-only feature. To use it you must configure a
			list of domains which are allowed to embed your files in the <a
			href="/user/sharing/embedding">embedding controls</a> page. To use
			the hotlink embed you must also enable hotlinking on the <a
			href="/user/sharing/bandwidth">sharing settings page</a>.
		</p>
	</div>
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

	<div class="indent">
		{#if tab === "iframe"}
			<h3>Appearance</h3>
			<p>
				You can change the pixeldrain theme for your embedded file. Try the
				available themes <a href="/appearance">here</a>.
			</p>

			<ThemePicker on:theme_change={e => set_style(e.detail)}></ThemePicker>
		{:else}
			<h3>Direct link</h3>
			<p>
				Hotlinking is only supported on <a href="/#pro">Pro</a>
				accounts. If this file was not uploaded with a Pro account the
				download will be blocked.
			</p>
			<p>
				You can directly download the file from this link without using the
				file viewer:
				<br/>
				{domain_url()}{file.get_href}
			</p>
		{/if}

		<h3>Code</h3>
		<p>
			Put this code in your website to embed the file.
		</p>
		<div class="center">
			<textarea bind:value={embed_html} style="width: 99%; height: 4em;"></textarea>
			<br/>
			<CopyButton text={embed_html}>Copy HTML</CopyButton>
			<button on:click={toggle_example} class:button_highlight={example}>
				<i class="icon">visibility</i> Show example
			</button>
		</div>
		<h3>Example</h3>
	</div>
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
.tab_bar {
	border-bottom: 2px solid var(--separator);
}
</style>
