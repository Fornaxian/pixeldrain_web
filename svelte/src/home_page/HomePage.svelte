<script>
import UploadProgressBar from "./UploadProgressBar.svelte"
import { copy_text, domain_url } from "../util/Util.svelte"
import { tick } from "svelte"
import Facebook from "../icons/Facebook.svelte"
import Reddit from "../icons/Reddit.svelte"
import Twitter from "../icons/Twitter.svelte"
import Tumblr from "../icons/Tumblr.svelte"

// === UPLOAD LOGIC ===

let file_input_field
const file_input_change = (event) => {
	// Start uploading the files async
	upload_files(event.target.files)

	// This resets the file input field
	file_input_field.nodeValue = ""
}
let dragging = false
const drop = (e) => {
	dragging = false;
	if (e.dataTransfer && e.dataTransfer.items.length > 0) {
		e.preventDefault()
		e.stopPropagation()
		upload_files(e.dataTransfer.files)
	}
}
const paste = (e) => {
	if (e.clipboardData.files[0]) {
		e.preventDefault();
		e.stopPropagation();
		upload_files(e.clipboardData.files)
	}
}

let active_uploads = 0
let upload_queue = []
let state = "idle" // idle, uploading, finished

const upload_files = async (files) => {
	if (files.length === 0) {
		return
	}

	// Add files to the queue
	for (let i = 0; i < files.length; i++) {
		if (files[i].type === "" && files[i].size === 0) {
			continue
		}

		upload_queue.push({
			file: files[i],
			name: files[i].name,
			status: "queued",
			component: null,
			id: "",
			on_finished: finish_upload,
		})
	}

	// Reassign array and wait for tick to complete. After the tick is completed
	// each upload progress bar will have bound itself to its array item
	upload_queue = upload_queue
	await tick()

	start_upload()
}

const start_upload = () => {
	let finished_count = 0

	for (let i = 0; i < upload_queue.length && active_uploads < 3; i++) {
		if (upload_queue[i].status == "queued") {
			active_uploads++
			upload_queue[i].status = "uploading"
			upload_queue[i].component.start()
		} else if (upload_queue[i].status == "finished") {
			finished_count++
		}
	}

	if (active_uploads === 0 && finished_count != 0) {
		state = "finished"
		uploads_finished()
	} else {
		state = "uploading"
	}
}

const finish_upload = (file) => {
	active_uploads--
	start_upload()
}

// === SHARING BUTTONS ===

let navigator_share = !!(window.navigator && window.navigator.share)
let share_title = ""
let share_link = ""

let btn_upload_text
let btn_copy_link
let btn_open_link
let btn_share_email
let btn_share_twitter
let btn_share_facebook
let btn_share_reddit
let btn_share_tumblr
let btn_create_list
let btn_copy_links
let btn_copy_markdown
let btn_copy_bbcode

const uploads_finished = () => {
	let count = upload_queue.reduce(
		(acc, curr) => curr.status === "finished" ? acc + 1 : acc, 0,
	)

	if (count === 1) {
		share_title = "Download " + upload_queue[0].name + " here"
		share_link = domain_url() + "/u/" + upload_queue[0].id
	} else if (count > 1) {
		create_list(count+" files", true).then(resp => {
			console.log("Automatic list ID " + resp.id)
			share_title = "View a collection of "+count+" files here"
			share_link = domain_url() + "/l/" + resp.id
		}).catch(err => {
			alert("Failed to generate link. Please check your internet connection and try again.\nError: " + err)
		})
	}
}

function create_list(title, anonymous) {
	let files = upload_queue.reduce(
		(acc, curr) => {
			if (curr.status === "finished") {
				acc.push({"id": curr.id})
			}
			return acc
		},
		[],
	)

	return fetch(
		window.api_endpoint+"/list",
		{
			method: "POST",
			headers: { "Content-Type": "application/json; charset=UTF-8" },
			body: JSON.stringify({
				"title": title,
				"anonymous": anonymous,
				"files": files
			})
		}
	).then(resp => {
		if (!resp.ok) {
			return Promise.reject("HTTP error: " + resp.status)
		}
		return resp.json()
	})
}

const copy_link = () => {
	if (copy_text(share_link)) {
		console.log('Text copied')
		btn_copy_link.querySelector("span").textContent = "Copied!"
		btn_copy_link.classList.add("button_highlight")
	} else {
		console.log('Copying not supported')
		btn_copy_link.querySelector("span").textContent = "Failed"
		btn_copy_link.classList.add("button_red")
		alert("Your browser does not support copying text.")
	}
}

const open_link = () => window.open(share_link, "_blank")
const share_mail = () => window.open("mailto:please@set.address?subject=File%20on%20pixeldrain&body=" + share_link)
const share_twitter = () => window.open("https://twitter.com/share?url=" + share_link)
const share_facebook = () => window.open('https://www.facebook.com/sharer.php?u=' + share_link)
const share_reddit = () => window.open('https://www.reddit.com/submit?url=' + share_link)
const share_tumblr = () => window.open('https://www.tumblr.com/share/link?url=' + share_link)
const share_navigator = () => {
	window.navigator.share({ title: "Pixeldrain", text: share_title, url: share_link })
}

let created_lists = []
const make_list_button = () => {
	let count = upload_queue.reduce(
		(acc, curr) => curr.status === "finished" ? acc + 1 : acc,
		0,
	)

	let title = prompt(
		"You are creating a list containing " + count + " files.\n"
		+ "What do you want to call it?", "My New Album"
	)
	if (title === null) {
		return
	}
	create_list(title, false).then(resp => {
		created_lists.push({
			title: title,
			id: resp.id,
			link: domain_url()+"/l/"+resp.id,
			thumbnail: "/api/list/"+resp.id+"/thumbnail",
		})
		created_lists = created_lists
		window.open('/l/' + resp.id, '_blank')
	}).catch(err => {
		alert("Failed to create list. Server says this:\n"+err)
	})
}

const get_finished_files = () => {
	return upload_queue.reduce(
		(acc, curr) => {
			if (curr.status === "finished") {
				acc.push(curr)
			}
			return acc
		},
		[],
	)
}
const copy_links = () => {
	// Add the text to the textarea
	let text = ""
	let files = get_finished_files()
	files.forEach(file => {
		// Example: https://pixeldrain.com/u/abcd1234 Some_file.png
		text += domain_url() + "/u/" + file.id + " " + file.name + "\n"
	})
	if (share_link.includes("/l/")) {
		text += "\n" + share_link + " All " + files.length + " files\n"
	}

	// Copy the selected text
	if (copy_text(text)) {
		btn_copy_links.classList.add("button_highlight")
		btn_copy_links.innerHTML = "Links copied to clipboard!"
	} else {
		btn_copy_links.classList.add("button_red")
		btn_copy_links.innerHTML = "Copying links failed"
	}
}
const copy_bbcode = () => {
	// Add the text to the textarea
	let text = ""
	let files = get_finished_files()
	files.forEach(file => {
		// Example: [url=https://pixeldrain.com/u/abcd1234]Some_file.png[/url]
		text += "[url=" + domain_url() + "/u/" + file.id + "]" + file.name + "[/url]\n"
	})
	if (share_link.includes("/l/")) {
		text += "\n[url=" + share_link + "]All " + files.length + " files[/url]\n"
	}

	// Copy the selected text
	if (copy_text(text)) {
		btn_copy_bbcode.classList.add("button_highlight")
		btn_copy_bbcode.innerHTML = "BBCode copied to clipboard!"
	} else {
		btn_copy_bbcode.classList.add("button_red")
		btn_copy_bbcode.innerHTML = "Copying links failed"
	}
}
const copy_markdown = () => {
	// Add the text to the textarea
	let text = ""
	let files = get_finished_files()
	files.forEach(file => {
		// Example: * [Some_file.png](https://pixeldrain.com/u/abcd1234)

		if (files.length > 1) { text += " * " }
		text += "[" + file.name + "](" + domain_url() + "/u/" + file.id + ")\n"
	})
	if (share_link.includes("/l/")) {
		text += " * [All " + files.length + " files](" + share_link + ")\n"
	}

	// Copy the selected text
	if (copy_text(text)) {
		btn_copy_markdown.classList.add("button_highlight")
		btn_copy_markdown.innerHTML = "Markdown copied to clipboard!"
	} else {
		btn_copy_markdown.classList.add("button_red")
		btn_copy_markdown.innerHTML = "Copying links failed"
	}
}

const keydown = (e) => {
	if (e.ctrlKey || e.altKey || e.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}
	if (document.activeElement.type && document.activeElement.type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}
	switch (e.key) {
	case "u": file_input_field.click();   break
	case "t": btn_upload_text.click();    break
	case "c": btn_copy_link.click();      break
	case "o": btn_open_link.click();      break
	case "l": btn_create_list.click();    break
	case "e": btn_share_email.click();    break
	case "w": btn_share_twitter.click();  break
	case "f": btn_share_facebook.click(); break
	case "r": btn_share_reddit.click();   break
	case "m": btn_share_tumblr.click();   break
	case "a": btn_copy_links.click();     break
	case "d": btn_copy_markdown.click();  break
	case "b": btn_copy_bbcode.click();    break
	}
}

</script>

<svelte:window
	on:dragover|preventDefault|stopPropagation={() => { dragging = true }}
	on:dragenter|preventDefault|stopPropagation={() => { dragging = true }}
	on:dragleave|preventDefault|stopPropagation={() => { dragging = false }}
	on:drop={drop}
	on:paste={paste}
	on:keydown={keydown} />

<div>
	<div class="instruction" style="margin-top: 0;">
		<div class="limit_width">
			<span class="big_number">1</span>
			<span class="instruction_text">Select files to upload</span>
			<br/>
			You can also drop files on this page from your file
			manager or paste an image from your clipboard
		</div>
	</div>

	<input bind:this={file_input_field} on:change={file_input_change} type="file" name="file" multiple="multiple"/>
	<button on:click={() => { file_input_field.click() }} class="big_button button_highlight">
		<i class="icon small">cloud_upload</i>
		<u>U</u>pload Files
	</button>

	<a bind:this={btn_upload_text} href="/t" id="upload_text_button" class="button big_button button_highlight">
		<i class="icon small">text_fields</i>
		Upload <u>T</u>ext
	</a>
	<br/>
	<p>
		By uploading files to pixeldrain you acknowledge and accept our
		<a href="/about#content-policy">content policy</a>.
	<p>

	<div class="instruction">
		<div class="limit_width">
			<span class="big_number">2</span>
			<span class="instruction_text">Wait for the files to finish uploading</span>
		</div>
	</div>

	<div id="file_drop_highlight" class="highlight_green" class:hide={!dragging}>
		Gimme gimme gimme!<br/>
		Drop your files to upload them
	</div>

	{#each upload_queue as file}
		<UploadProgressBar bind:this={file.component} job={file}></UploadProgressBar>
	{/each}

	<div class="instruction">
		<div class="limit_width">
			<span class="big_number">3</span>
			<span class="instruction_text">Share the files</span>
		</div>
	</div>

	<div class="social_buttons" class:hide={!navigator_share}>
		<button id="btn_social_share" on:click={share_navigator} class="social_buttons" disabled={state !== "finished"}>
			<i class="icon">share</i><br/>
			Share
		</button>
	</div>
	<button bind:this={btn_copy_link} on:click={copy_link} class="social_buttons" disabled={state !== "finished"}>
		<i class="icon">content_copy</i><br/>
		<span><u>C</u>opy link</span>
	</button>
	<button bind:this={btn_open_link} on:click={open_link} class="social_buttons" disabled={state !== "finished"}>
		<i class="icon">open_in_new</i><br/>
		<span><u>O</u>pen link</span>
	</button>
	<div class="social_buttons" class:hide={navigator_share}>
		<button bind:this={btn_share_email} on:click={share_mail} class="social_buttons" disabled={state !== "finished"}>
			<i class="icon">email</i><br/>
			<u>E</u>-Mail
		</button>
		<button bind:this={btn_share_twitter} on:click={share_twitter} class="social_buttons" disabled={state !== "finished"}>
			<Twitter style="width: 40px; height: 40px; margin: 5px 15px;"></Twitter><br/>
			T<u>w</u>itter
		</button>
		<button bind:this={btn_share_facebook} on:click={share_facebook} class="social_buttons" disabled={state !== "finished"}>
			<Facebook style="width: 40px; height: 40px; margin: 5px 15px;"></Facebook><br/>
			<u>F</u>acebook
		</button>
		<button bind:this={btn_share_reddit} on:click={share_reddit} class="social_buttons" disabled={state !== "finished"}>
			<Reddit style="width: 40px; height: 40px; margin: 5px 15px;"></Reddit><br/>
			<u>R</u>eddit
		</button>
		<button bind:this={btn_share_tumblr} on:click={share_tumblr} class="social_buttons" disabled={state !== "finished"}>
			<Tumblr style="width: 40px; height: 40px; margin: 5px 15px;"></Tumblr><br/>
			Tu<u>m</u>blr
		</button>
	</div>
	<br/><br/>
	<button bind:this={btn_create_list} on:click={make_list_button} disabled={state !== "finished"}>
		<i class="icon">list</i> Create <u>l</u>ist with uploaded files
	</button>
	<button bind:this={btn_copy_links} on:click={copy_links} disabled={state !== "finished"}>
		<i class="icon">content_copy</i> Copy <u>a</u>ll links to clipboard
	</button>
	<button bind:this={btn_copy_markdown} on:click={copy_markdown} disabled={state !== "finished"}>
		<i class="icon">content_copy</i> Copy mark<u>d</u>own to clipboard
	</button>
	<button bind:this={btn_copy_bbcode} on:click={copy_bbcode} disabled={state !== "finished"}>
		<i class="icon">content_copy</i> Copy <u>B</u>BCode to clipboard
	</button>
	<br/>

	{#each created_lists as list}
		<a class="file_button" href="{list.link}" target="_blank">
			<img src="/api/list/{list.id}/thumbnail" alt="list icon"/>
			List created!<br/>
			{list.title}<br/>
			<span class="file_button_title">{list.link}</span>
		</a>
	{/each}
</div>

<style>
.big_button{
	width: 40%;
	min-width: 250px;
	max-width: 400px;
	margin: 10px !important;
	border-radius: 5px;
	font-size: 1.8em;
}
.instruction {
	border-top: 1px solid var(--layer_2_color_border);
	border-bottom: 1px solid var(--layer_2_color_border);
	box-sizing: border-box;
	margin: 1.5em 0;
	padding: 5px;
}
.big_number {
	font-size: 1.5em;
	font-weight: bold;
	line-height: 1em;
	text-align: center;
	display: inline-block;
	box-sizing: border-box;
	background-color: var(--highlight_color);
	color: var(--highlight_text_color);
	border-radius: 30px;
	padding: 0.15em;
	margin-right: 0.4em;
	width: 1.4em;
	height: 1.4em;
	vertical-align: middle;
}
.instruction_text {
	margin: 0.1em;
	font-size: 1.5em;
	display: inline;
	box-sizing: border-box;
	vertical-align: middle;
}

.social_buttons {
	margin: 5px;
	display: inline-block
}
.social_buttons.hide {
	display: none;
}
.social_buttons > .icon {
	font-size: 40px;
	display: inline-block;
	width: 40px;
	height: 40px;
	margin: 5px 15px;
}
.hide {
	display: none;
}
</style>
