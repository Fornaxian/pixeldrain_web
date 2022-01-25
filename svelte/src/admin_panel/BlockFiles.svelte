<script>
import { onMount } from "svelte";

import Form from "./../util/Form.svelte";

let block_form = {
	name: "block_files",
	fields: [
		{
			name: "text",
			label: "Files to delete",
			type: "text_area",
		}, {
			name: "type",
			label: "Type",
			type: "radio",
			radio_values: [
				"unknown",
				"copyright",
				"child_abuse",
				"terrorism",
				"gore",
				"malware",
				"doxing",
			]
		}, {
			name: "reporter",
			label: "Reporter",
			type: "text",
			default_value: "Anonymous tip",
		},
	],
	submit_label: `<i class="icon">send</i> Submit`,
	on_submit: async fields => {
		const form = new FormData()
		form.append("text", fields.text)
		form.append("type", fields.type)
		form.append("reporter", fields.reporter)

		const resp = await fetch(
			window.api_endpoint+"/admin/block_files",
			{ method: "POST", body: form }
		);
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}
		let jresp = await resp.json()
		let message = "The following files were blocked:<br/>"
		message += "<ul>"
		jresp.files_blocked.forEach(file => {
			message += "<li>pixeldrain.com/u/" + file + "</li>"
		})
		message += "</ul>"

		return {success: true, message: message}
	},
}

onMount(() => {
	// Automatically select the text in the textarea when clicked
	let ta = document.getElementById("input_text")
	ta.addEventListener("click", (evt) => {
		ta.focus()
		ta.select()
	})
})
</script>

<section>
	<h2>File removal</h2>
	<p>
		Paste any pixeldrain file links in here to remove them
	</p>
	<div class="highlight_dark">
		<Form config={block_form}></Form>
	</div>
</section>
