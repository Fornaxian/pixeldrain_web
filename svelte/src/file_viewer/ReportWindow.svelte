<script>
import Spinner from "../util/Spinner.svelte"

export let file = {
	id: "",
	name: "",
	get_href: "",
}
export let list = {
	id: "",
	files: [],
}

let abuse_type = ""
let single_or_all = "single"
let loading = false
let results = []

let submit = async e => {
	e.preventDefault()

	if (abuse_type === "") {
		result_success = false
		result_text = "Please select an abuse type"
		return
	}

	loading = true
	let files = []

	if (single_or_all === "all") {
		list.files.forEach(file => {
			files.push(file.id)
		})
	} else {
		files.push(file.id)
	}

	const form = new FormData()
	form.append("type", abuse_type)

	results = []

	for (let file_id of files) {
		try {
			const resp = await fetch(
				window.api_endpoint + "/file/" + file_id + "/report_abuse",
				{ method: "POST", body: form }
			);
			if (resp.status >= 400) {
				let json = await resp.json()
				if (json.value === "resource_already_exists") {
					throw "You have already reported this file"
				} else if (json.value === "file_already_blocked") {
					throw "This file has already been blocked"
				} else if (json.value === "multiple_errors") {
					throw json.errors[0].message
				}
				throw json.message
			}

			results.push({success: true, text: "Report has been sent"})
		} catch (err) {
			results.push({success: false, text: "Failed to send report: "+err})
		}

		results = results
	}

	loading = false
}
</script>

<div>
	<p>
		If you think this file violates pixeldrain's
		<a href="/about#content-policy">content policy</a> you can
		report it for moderation with this form. You cannot report
		copyright abuse with this form, send a formal DMCA notification
		to the
		<a href="/about#content-policy">abuse e-mail address</a>
		instead.
	</p>
	<form on:submit={submit} style="width: 100%">
		<h3>Abuse type</h3>
		<p>
			Which type of abuse is shown in this file? Pick the most
			appropriate one.
		</p>
		<label for="type_terrorism">
			<input type="radio" bind:group={abuse_type} id="type_terrorism" name="abuse_type" value="terrorism">
			<b>Terrorism</b>: Videos, images or audio fragments showing
			or promoting the use of intentional violence to achieve
			political aims.
		</label>
		<label for="type_gore">
			<input type="radio" bind:group={abuse_type} id="type_gore" name="abuse_type" value="gore">
			<b>Gore</b>: Graphic and shocking videos or images depicting
			severe harm to humans (or animals).
		</label>
		<label for="type_child_abuse">
			<input type="radio" bind:group={abuse_type} id="type_child_abuse" name="abuse_type" value="child_abuse">
			<b>Child abuse</b>: Videos or images depicting inappropriate
			touching or nudity of minors.
		</label>
		<label for="type_malware" style="border-bottom: none;">
			<input type="radio" bind:group={abuse_type} id="type_malware" name="abuse_type" value="malware">
			<b>Malware</b>: Software programs designed to cause harm to
			computer systems.
		</label>

		{#if list.id !== ""}
			<h3>Report multiple files?</h3>
			<label for="report_single">
				<input type="radio" bind:group={single_or_all} id="report_single" name="single_or_all" value="single">
				Report only the selected file ({file.name})
			</label>
			<label for="report_all" style="border-bottom: none;">
				<input type="radio" bind:group={single_or_all} id="report_all" name="single_or_all" value="all">
				Report all {list.files.length} files in this list
			</label>
		{/if}

		<h3>Send</h3>
		{#if loading}
			<div class="spinner_container">
				<Spinner></Spinner>
			</div>
		{/if}

		{#each results as result}
			<div class:highlight_green={result.success} class:highlight_red={!result.success}>
				{result.text}
			</div>
		{/each}
		<p>
			Abuse reports are manually reviewed. Normally this shouldn't
			take more than 24 hours. During busy periods it can take
			longer.
		</p>
		<div style="text-align: right;">
			<button class="button_highlight abuse_report_submit" type="submit">
				<i class="icon">send</i> Send
			</button>
		</div>
	</form>
</div>

<style>
label {
	display: block;
	border-bottom: 1px var(--layer_2_color_border) solid;
	padding: 0.5em;
}
.spinner_container {
	position: absolute;
	top: auto;
	left: 10px;
	height: 100px;
	width: 100px;
	z-index: 1000;
}
</style>
