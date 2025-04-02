<script lang="ts">
import { createEventDispatcher } from "svelte";
import { domain_url } from "util/Util.svelte";
import CopyButton from "layout/CopyButton.svelte";
import { formatDate } from "util/Formatting";
import type { FSNode } from "filesystem/FilesystemAPI";

let dispatch = createEventDispatcher()
export let shared: boolean
export let file: FSNode = {} as FSNode

let embed_html: string
let preview_area: HTMLDivElement

$: is_shared = file.id !== undefined && file.id !== ""
$: share_link = window.location.protocol+"//"+window.location.host+"/d/"+file.id
$: embed_iframe(file)
let embed_iframe = (file: FSNode) => {
	if (!is_shared) {
		example = false
		embed_html = "File is not shared, can't generate embed code"
		return
	}

	let url = domain_url()+"/d/"+file.id
	embed_html = `<iframe ` +
		`src="${url}" ` +
		`style="border: none; width: 100%; max-width 90vw; height: 800px; max-height: 75vh; border-radius: 6px; "` +
		`allowfullscreen` +
		`></iframe>`
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

const update_shared = () => {
	// If sharing is enabled we automatically save the file so the user can copy
	// the sharing link. But if the user disables sharing we don't automatically
	// save so that the user can't accidentally discard a sharing link that's in
	// use
	if (shared) {
		dispatch("save")
	}
}
</script>

<fieldset>
	<legend>Public link</legend>

	{#if file.abuse_type !== undefined}
		<div class="highlight_red">
			This file or directory has received an abuse report. It cannot be
			shared.<br/>
			Type of abuse: {file.abuse_type}<br/>
			Report time: {formatDate(file.abuse_report_time, true, true, true)}
		</div>
	{/if}

	<div>
		<input
			form="edit_form"
			bind:checked={shared}
			on:change={update_shared}
			id="shared"
			type="checkbox"
			class="form_input"
		/>
		<label for="shared">Share this file or directory</label>
	</div>
	<div class="form_grid">
		{#if is_shared}
			<span>Public link: <a href={share_link}>{share_link}</a></span>
			<CopyButton text={share_link}>Copy</CopyButton>
		{/if}
	</div>

	<p>
		When a file or directory is shared it can be accessed through a
		unique link. You can get the URL with the 'Copy link' button on
		the toolbar, or share the link with the 'Share' button. If you
		share a directory all the files within the directory are also
		accessible from the link.
	</p>

</fieldset>

<fieldset>
	<legend>Embedding</legend>
	<p>
		If you have a website you can embed pixeldrain directories and files in your
		own webpages with the code below. If you embed a directory then all
		subdirectories and files will be accessible through the frame. Branding
		options will also apply in the frame, but only when applied to this
		directory. It will not inherit the style from parent directories.
	</p>
	<p>
		Put this code in your website to embed the file or directory.
	</p>
	<div class="center">
		<textarea bind:value={embed_html} style="width: 100%; height: 4em;"></textarea>
		<br/>
		<CopyButton text={embed_html}>Copy HTML</CopyButton>
		<button on:click={toggle_example} class:button_highlight={example} disabled={!is_shared}>
			<i class="icon">visibility</i> Show example
		</button>
	</div>
	<hr/>

	<div bind:this={preview_area} style="text-align: center;"></div>
</fieldset>

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
