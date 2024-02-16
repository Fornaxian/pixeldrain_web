<script>
import { createEventDispatcher } from "svelte";
import { copy_text, domain_url } from "../../util/Util.svelte";
    import Button from "../../layout/Button.svelte";

let dispatch = createEventDispatcher()
export let shared
export let file

let embed_html
let preview_area

$: is_shared = file.id !== undefined && file.id !== ""
$: share_link = window.location.protocol+"//"+window.location.host+"/d/"+file.id
$: embed_iframe(file)
let embed_iframe = file => {
	if (!is_shared) {
		example = false
		embed_html = "File is not shared, can't generate embed code"
		return
	}

	let url = domain_url()+"/d/"+file.id
	embed_html = `<iframe ` +
		`src="${url}" ` +
		`style="border: none; width: 800px; max-width: 100%; height: 600px; max-height: 100%; border-radius: 8px;"` +
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

let example = false
const toggle_example = () => {
	if (is_shared) {
		example = !example
		if (example) {
			preview_area.innerHTML = embed_html
		} else {
			preview_area.innerHTML = ""
		}
	}
}
</script>

<h2>Share this file/directory</h2>
<p>
	When a file or directory is shared it can be accessed through a
	unique link. You can get the URL with the 'Copy link' button on
	the toolbar, or share the link with the 'Share' button. If you
	share a directory all the files within the directory are also
	accessible from the link.
</p>
<div class="form_grid">
	<div>
		<input form="edit_form" bind:checked={shared} id="shared" type="checkbox" class="form_input"/>
		<label for="shared">Share this file or directory</label>
	</div>
	<button on:click={() => dispatch("save")}><i class="icon">save</i> Save</button>

	{#if is_shared}
		<span>Your sharing link: <a href={share_link}>{share_link}</a></span>
		<Button highlight_on_click icon="content_copy" label="Copy" click={e => copy_text(share_link)}/>
	{/if}
</div>

<h2>Embedding</h2>
<p>
	If you have a website you can embed pixeldrain directories and files in your
	own webpages with the code below. If you embed a directory then all
	subdirectories and files will be accessible through the frame. Branding
	options will also apply in the frame, but only when applied to this
	directory. It will not inherit the style from parent directories.
</p>

<h3>Code</h3>
<p>
	Put this code in your website to embed the file or directory.
</p>
<div class="center">
	<textarea bind:value={embed_html} style="width: 100%; height: 4em;"></textarea>
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
	<button on:click={toggle_example} class:button_highlight={example} disabled={!is_shared}>
		<i class="icon">visibility</i> Show example
	</button>
</div>

<div bind:this={preview_area} style="text-align: center;"></div>

<style>
.center {
	text-align: center;
}

.form_grid {
	display: grid;
	grid-template-columns: 10fr auto;
	align-items: center;
}
</style>
