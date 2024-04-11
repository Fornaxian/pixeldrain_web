<script>
import Spinner from "../util/Spinner.svelte"

export let file = {
	id: "",
	name: "",
	get_href: "",
	mime_type: "",
}
export let list = {
	id: "",
	files: [],
}

const filter_visual = type => {
	return type.startsWith("image/") ||
		type.startsWith("video/") ||
		type === "application/pdf"
}
const filter_audiovisual = type => {
	return type.startsWith("image/") ||
		type.startsWith("video/") ||
		type.startsWith("audio/") ||
		type === "application/pdf"
}
const filter_app = type => {
	return type.startsWith("application/") ||
		type.startsWith("text/")
}

const abuse_categories = [
	{
		type: "copyright", name: "Copyright",
		desc: `Protected content which is shared without constent from the
			rightsholder`,
	}, {
		type: "porn", name: "Porn",
		desc: `Sexually explicit videos or images`,
		filter: filter_visual,
	}, {
		type: "terrorism", name: "Terrorism",
		desc: `Videos, images or audio fragments showing or promoting the use
			of intentional violence to achieve political aims`,
		filter: filter_audiovisual,
	}, {
		type: "gore", name: "Gore",
		desc: `Graphic and shocking videos or images depicting severe harm to
			humans (or animals)`,
		filter: filter_visual,
	}, {
		type: "child_abuse", name: "Child abuse",
		desc: `Videos or images depicting inappropriate touching or nudity of
			children under 18 years old`,
	}, {
		type: "zoophilia", name: "Zoophilia",
		desc: `Videos or images depicting of sexual acts being performed on
			animals`,
	}, {
		type: "revenge_porn", name: "Revenge porn",
		desc: `The distribution of sexually explicit images or videos of
			individuals without their consent`,
	}, {
		type: "doxing", name: "Doxing",
		desc: `Personally identifiable information being shared without the
			consent of the owner. This includes things like passport scans,
			e-mail addresses, telephone numbers and passwords`,
	}, {
		type: "malware", name: "Malware",
		desc: `Software programs designed to cause harm to computer systems`,
		filter: filter_app,
	},
]

let abuse_type = ""
let single_or_all = "single"
let loading = false
let results = []

let submit = async e => {
	e.preventDefault()

	if (abuse_type === "") {
		results = [{success: false, text: "Please select an abuse type"}]
		return
	} else if (description.length > 500) {
		results = [{success: false, text: "Description is too long"}]
		return
	}

	loading = true
	let files = []

	if (file.id === "") {
		single_or_all = "all"
	} else if (list.id === "") {
		single_or_all = "single"
	}

	if (single_or_all === "all") {
		list.files.forEach(file => {
			// Only report files which have not been blocked yet
			if (file.abuse_type === "") {
				files.push(file.id)
			}
		})
	} else {
		files.push(file.id)
	}

	const form = new FormData()
	form.append("type", abuse_type)
	form.append("description", report_description())

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

let description = ""
let copyright_rightsholder = ""
let copyright_email =  ""
let copyright_sources = ""
let malware_proof = ""
let child_abuse_password = ""

const report_description = () => {
	if (abuse_type === "copyright") {
		return "Rightholder name: " + copyright_rightsholder + "\n" +
			"Contact e-mail: " + copyright_email + "\n" +
			"Sources:\n" + copyright_sources + "\n\n" +
			"Description:\n" + description;
	} else if (abuse_type === "malware") {
		return "Proof: " + malware_proof + "\n" +
			"Description:\n" + description;
	} else if (abuse_type === "child_abuse") {
		return "Password: " + child_abuse_password + "\n" +
			"Description:\n" + description;
	} else {
		return description
	}
}
</script>

<div class="container">
	<p>
		If you think this file violates pixeldrain's
		<a href="/abuse">content policy</a> you can report it for moderation
		with this form.
	</p>
	<form on:submit={submit} style="width: 100%" class="report_form">
		<h3>Abuse type</h3>
		<p>
			Which type of abuse is shown in this file? Pick the most
			appropriate one.
		</p>

		{#each abuse_categories as cat}
			{#if cat.filter === undefined || cat.filter(file.mime_type) }
				<label class="type_label" for="type_{cat.type}">
					<input class="type_button" type="radio" bind:group={abuse_type} id="type_{cat.type}" name="abuse_type" value="{cat.type}">
					<span class="type_desc"><b>{cat.name}</b>: {cat.desc}</span>
				</label>
			{/if}
		{/each}

		{#if list.id !== "" && file.id !== ""}
			<h3>Report multiple files?</h3>
			<label for="report_single">
				<input type="radio" bind:group={single_or_all} id="report_single" name="single_or_all" value="single">
				Report only the selected file ({file.name})
			</label>
			<label for="report_all" style="border-bottom: none;">
				<input type="radio" bind:group={single_or_all} id="report_all" name="single_or_all" value="all">
				Report all {list.files.length} files in this album
			</label>
		{/if}

		<h3>Description</h3>

		{#if abuse_type === "copyright"}

			<div>Name rightsholder (can be a registered company name)</div>
			<input type="text" bind:value={copyright_rightsholder} required/>

			<div>Contact e-mail</div>
			<input type="email" bind:value={copyright_email} required/>

			<div>Source URLs (links to the places where this content was allegedly stolen from)</div>
			<textarea bind:value={copyright_sources} placeholder="https://some.store.com" required></textarea>

		{:else if abuse_type === "malware"}

			<div>
				Proof that this file is malware. This can be a link to
				<a href="https://www.virustotal.com/"target="_blank">VirusTotal</a>
				scan results, or some other security vendor which has
				information about this file
			</div>
			<input type="text" bind:value={malware_proof} required/>

		{:else if abuse_type === "child_abuse"}

			<div>If this file is an encrypted archive, please provide the password so we can verify the contents</div>
			<input type="text" bind:value={child_abuse_password} placeholder="Password..."/>

		{/if}

		<div>
			Please provide some context for your report. Why do you think this
			file violates the content policy? ({description.length}/500)
		</div>
		<textarea bind:value={description} placeholder="Context here..." required></textarea>

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
		<div style="text-align: center;">
			<button class="button_highlight abuse_report_submit" type="submit" style="justify-content: center; width: 100%; max-width: 200px">
				<i class="icon">send</i>
				<span>Submit report</span>
			</button>
		</div>
	</form>
</div>

<style>
.container {
	width: 100%;
	padding: 10px;
	overflow: hidden;
}
label {
	display: block;
	border-bottom: 1px var(--separator) solid;
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
.report_form {
	width: 100%;
}
.report_form > input[type="text"],
.report_form > input[type="email"],
.report_form > textarea {
	width: 100%;
	margin: 0 0 0.5em 0;
}
.report_form > textarea {
	height: 5em;
}
.type_label {
	display: flex;
	flex-direction: row;
}
.type_button {
	flex: 0 0 auto;
	margin-right: 1em;
}
.type_label {
	flex: 1 1 auto;
}
</style>
