<script>
import { copy_text, domain_url } from "../util/Util.svelte";


export let file = {
	id: "",
}
export let list = {
	id: "",
}

let embed_html = ""
let preview_area

$: update_file(file.id, list.id)
let update_file = () => {
	let url
	if (list.id === "") {
		// Not a list, use file ID
		url = domain_url()+"/u/"+file.id+"?embed"
	} else {
		url = domain_url()+"/l/"+list.id+"?embed"
	}

	embed_html = `<iframe ` +
		`src="${url}" ` +
		`style="border: none; width: 800px; max-width: 100%; height: 500px; border-radius: 16px;"` +
		`></iframe>`
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

<div>
	<p>
		You can embed pixeldrain's file viewer in your own web pages. We
		have created a special HTML code which renders a minimalistic
		version of the file viewer where the title bar is a bit thinner and
		the toolbar is collapsed by default.
	</p>
	<p>
		Unless it was uploaded using a pixeldrain Pro account the embedded
		file will also show advertisements.
	</p>
	<h3>Code</h3>
	<textarea bind:value={embed_html} style="width: 100%; height: 4em;" class="indent"></textarea>
	<br/>
	<button on:click={copy} class="indent" class:button_highlight={copy_status === "success"} class:button_red={copy_status === "error"}>
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
	<h3>Example</h3>
	<div bind:this={preview_area} style="text-align: center;"></div>
</div>
