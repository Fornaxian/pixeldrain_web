<script>
import { createEventDispatcher } from "svelte";
import IconBlock from "layout/IconBlock.svelte";
import TextBlock from "layout/TextBlock.svelte"
import FileTitle from "layout/FileTitle.svelte";

let dispatch = createEventDispatcher()

export const set_file = f => file = f
let file = {
	id: "",
	name: "",
	abuse_type: "",
	abuse_reporter_name: "",
	can_download: false,
	icon_href: "",
}
</script>

<FileTitle title={file.name}/>

<TextBlock>
	<h2>Unavailable for legal reasons</h2>
	<p>
		This file has been removed for violating pixeldrain's
		<a href="/abuse">content policy</a>. Type of abuse: {file.abuse_type}.
	</p>
	<p>
		{#if file.abuse_reporter_name === "User submitted reports"}

			The file was reported by users of pixeldrain with the report button
			in the toolbar.

		{:else}

			The file was reported through pixeldrain's abuse e-mail address.

		{/if}
	</p>
	<p>
		Pixeldrain has zero tolerance towards abuse. The IP address this file
		originated from has been banned and is no longer able to upload files to
		pixeldrain.
	</p>
</TextBlock>

{#if file.can_download}
	<IconBlock icon_href={file.icon_href}>

		This file cannot be shared, but since you are the uploader of the file
		you can still download it.
		<br/>
		<button class="button_highlight" on:click={() => {dispatch("download")}}>
			<i class="icon">download</i>
			<span>Download</span>
		</button>
	</IconBlock>
{/if}
