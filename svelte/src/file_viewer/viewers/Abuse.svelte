<script>
import TextBlock from "./TextBlock.svelte"

export const set_file = f => file = f
let file = {
	id: "",
	name: "",
	abuse_type: "",
	abuse_reporter_name: "",
}
</script>

<h1>{file.name}</h1>

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
