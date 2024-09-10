<script>
import UploadProgressBar from "./UploadProgressBar.svelte"
import { domain_url } from "../util/Util.svelte"
import { tick } from "svelte"
import Facebook from "../icons/Facebook.svelte"
import Reddit from "../icons/Reddit.svelte"
import Twitter from "../icons/Twitter.svelte"
import Tumblr from "../icons/Tumblr.svelte"
import StorageProgressBar from "../user_home/StorageProgressBar.svelte"
import Konami from "../util/Konami.svelte"
import UploadStats from "./UploadStats.svelte";
import CopyButton from "../layout/CopyButton.svelte";

// === UPLOAD LOGIC ===

let file_input_field
const file_input_change = (event) => {
	// Start uploading the files async
	upload_files(event.target.files)

	// This resets the file input field
	file_input_field.nodeValue = ""
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
let upload_stats

export const upload_files = async (files) => {
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
			total_size: files[i].size,
			loaded_size: 0,
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
			upload_queue[i].component.start()
		} else if (
			upload_queue[i].status == "finished" ||
			upload_queue[i].status == "error"
		) {
			finished_count++
		}
	}

	if (active_uploads === 0 && finished_count != 0) {
		state = "finished"
		upload_stats.finish()
		uploads_finished()
	} else {
		state = "uploading"
		upload_stats.start()
	}
}

const finish_upload = (file) => {
	active_uploads--
	start_upload()
}

const leave_confirmation = e => {
	if (state === "uploading") {
		e.preventDefault()
		e.returnValue = "If you close the page your files will stop uploading. Do you want to continue?"
		return e.returnValue
	} else {
		return null
	}
}

// === SHARING BUTTONS ===

let navigator_share = !!(window.navigator && window.navigator.share)
let share_title = ""
let share_link = ""
let input_album_name = ""

let btn_upload_text
let btn_copy_link
let btn_open_link
let btn_show_qr
let btn_share_email
let btn_share_twitter
let btn_share_facebook
let btn_share_reddit
let btn_share_tumblr
let btn_create_list
let btn_copy_links
let btn_copy_markdown
let btn_copy_bbcode

const uploads_finished = async () => {
	let count = upload_queue.reduce(
		(acc, curr) => curr.status === "finished" ? acc + 1 : acc, 0,
	)

	if (count === 1) {
		share_title = "Download " + upload_queue[0].name + " here"
		share_link = domain_url() + "/u/" + upload_queue[0].id
	} else if (count > 1) {
		try {
			const resp = await create_list(count+" files", true)
			console.log("Automatic list ID " + resp.id)
			share_title = "View a collection of "+count+" files here"
			share_link = domain_url() + "/l/" + resp.id
		} catch (err) {
			alert("Failed to generate link. Please check your internet connection and try again.\nError: " + err)
		}
	}

	generate_link_list()
}

async function create_list(title, anonymous) {
	let files = upload_queue.reduce(
		(acc, curr) => {
			if (curr.status === "finished") {
				acc.push({"id": curr.id})
			}
			return acc
		},
		[],
	)

	const resp = await fetch(
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
	)
	if(!resp.ok) {
		return Promise.reject("HTTP error: "+resp.status)
	}
	return await resp.json()
}

let qr_visible = false
const open_link = () => window.open(share_link, "_blank")
const show_qr_code = () => qr_visible = !qr_visible
const share_mail = () => window.open("mailto:please@set.address?subject=File%20on%20pixeldrain&body=" + share_link)
const share_twitter = () => window.open("https://twitter.com/share?url=" + share_link)
const share_facebook = () => window.open('https://www.facebook.com/sharer.php?u=' + share_link)
const share_reddit = () => window.open('https://www.reddit.com/submit?url=' + share_link)
const share_tumblr = () => window.open('https://www.tumblr.com/share/link?url=' + share_link)
const share_navigator = () => {
	window.navigator.share({ title: "Pixeldrain", text: share_title, url: share_link })
}

const create_album = () => {
	if (!input_album_name) {
		return
	}
	create_list(input_album_name, false).then(resp => {
		window.location = '/l/' + resp.id
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

let link_list = ""
let bbcode = ""
let markdown = ""
const generate_link_list = () => {
	// Add the text to the textarea
	link_list = ""
	bbcode = ""
	markdown = ""

	let files = get_finished_files()
	files.forEach(file => {
		// Link list example: https://pixeldrain.com/u/abcd1234 Some_file.png
		link_list += domain_url() + "/u/" + file.id + " " + file.name + "\n"

		// BBCode example: [url=https://pixeldrain.com/u/abcd1234]Some_file.png[/url]
		bbcode += "[url=" + domain_url() + "/u/" + file.id + "]" + file.name + "[/url]\n"

		// Markdown example: * [Some_file.png](https://pixeldrain.com/u/abcd1234)
		if (files.length > 1) {
			markdown += " * "
		}
		markdown += "[" + file.name + "](" + domain_url() + "/u/" + file.id + ")\n"
	})

	if (share_link.includes("/l/")) {
		link_list += "\n" + share_link + " All " + files.length + " files\n"
		bbcode += "\n[url=" + share_link + "]All " + files.length + " files[/url]\n"
		markdown += " * [All " + files.length + " files](" + share_link + ")\n"
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
	case "c": btn_copy_link.copy();       break
	case "o": btn_open_link.click();      break
	case "q": btn_show_qr.click();        break
	case "l": btn_create_list.click();    break
	case "e": btn_share_email.click();    break
	case "w": btn_share_twitter.click();  break
	case "f": btn_share_facebook.click(); break
	case "r": btn_share_reddit.click();   break
	case "m": btn_share_tumblr.click();   break
	case "a": btn_copy_links.copy();      break
	case "d": btn_copy_markdown.copy();   break
	case "b": btn_copy_bbcode.copy();     break
	}
}

</script>

<svelte:window on:paste={paste} on:keydown={keydown} on:beforeunload={leave_confirmation} />

<Konami/>

<!-- If the user is logged in and has used more than 50% of their storage space we will show a progress bar -->
{#if window.user.username !== "" && window.user.storage_space_used/window.user.subscription.storage_space > 0.5}
	<section>
		<StorageProgressBar used={window.user.storage_space_used} total={window.user.subscription.storage_space}></StorageProgressBar>
	</section>
{/if}

<section class="instruction" style="border-top: none;">
	<span class="big_number">1</span>
	<span class="instruction_text">Select files to upload</span>
	<br/>
	You can also drop files on this page from your file manager or
	paste an image from your clipboard
</section>

<input bind:this={file_input_field} on:change={file_input_change} type="file" name="file" multiple="multiple"/>
<button on:click={() => { file_input_field.click() }} class="big_button button_highlight">
	<i class="icon small">cloud_upload</i>
	<span><u>U</u>pload Files</span>
</button>

<a bind:this={btn_upload_text} href="/t" id="upload_text_button" class="button big_button button_highlight">
	<i class="icon small">text_fields</i>
	<span>Upload <u>T</u>ext</span>
</a>
<br/>
<p>
	By uploading files to pixeldrain you acknowledge and accept our
	<a href="/abuse">content policy</a>.
<p>
<br/>
<section class="instruction" style="margin-bottom: 0;">
	<span class="big_number">2</span>
	<span class="instruction_text">Wait for the files to finish uploading</span>
	<br/>

	<UploadStats bind:this={upload_stats} upload_queue={upload_queue}/>
</section>

{#each upload_queue as file}
	<UploadProgressBar bind:this={file.component} job={file}></UploadProgressBar>
{/each}

<br/>
<section class="instruction">
	<span class="big_number">3</span>
	<span class="instruction_text">Share the files</span>
</section>
<br/>

{#if upload_queue.length > 1}
	You can create an album to group your files together into one link<br/>
	Name:
	<form class="album_name_form" on:submit|preventDefault={create_album}>
		<input bind:value={input_album_name} type="text" disabled={state !== "finished"} placeholder="My album"/>
		<button type="submit" disabled={state !== "finished"}>
			<i class="icon">create_new_folder</i> Create
		</button>
	</form>
	<br/><br/>
	Other sharing methods:
	<br/>
{/if}

<div class="social_buttons" class:hide={!navigator_share}>
	<button id="btn_social_share" on:click={share_navigator} class="social_buttons" disabled={state !== "finished"}>
		<i class="icon">share</i><br/>
		Share
	</button>
</div>
<CopyButton bind:this={btn_copy_link} text={share_link} large_icon><u>C</u>opy link</CopyButton>
<button bind:this={btn_open_link} on:click={open_link} class="social_buttons" disabled={state !== "finished"}>
	<i class="icon">open_in_new</i>
	<span><u>O</u>pen link</span>
</button>
<button bind:this={btn_show_qr} on:click={show_qr_code} class="social_buttons" disabled={state !== "finished"} class:button_highlight={qr_visible}>
	<i class="icon">qr_code</i>
	<span><u>Q</u>R code</span>
</button>
<div style="display: inline-block;" class:hide={navigator_share}>
	<button bind:this={btn_share_email} on:click={share_mail} class="social_buttons" disabled={state !== "finished"}>
		<i class="icon">email</i>
		<span><u>E</u>-Mail</span>
	</button>
	<button bind:this={btn_share_twitter} on:click={share_twitter} class="social_buttons" disabled={state !== "finished"}>
		<Twitter style="width: 40px; height: 40px;"></Twitter>
		<span>T<u>w</u>itter</span>
	</button>
	<button bind:this={btn_share_facebook} on:click={share_facebook} class="social_buttons" disabled={state !== "finished"}>
		<Facebook style="width: 40px; height: 40px;"></Facebook>
		<span><u>F</u>acebook</span>
	</button>
	<button bind:this={btn_share_reddit} on:click={share_reddit} class="social_buttons" disabled={state !== "finished"}>
		<Reddit style="width: 40px; height: 40px;"></Reddit>
		<span><u>R</u>eddit</span>
	</button>
	<button bind:this={btn_share_tumblr} on:click={share_tumblr} class="social_buttons" disabled={state !== "finished"}>
		<Tumblr style="width: 40px; height: 40px;"></Tumblr>
		<span>Tu<u>m</u>blr</span>
	</button>
</div>
<br/>
{#if qr_visible}
	<img src="/api/misc/qr?text={encodeURIComponent(share_link)}" alt="QR code" style="width: 300px; max-width: 100%;">
	<br/>
{/if}

<CopyButton bind:this={btn_copy_links} text={link_list}>Copy <u>a</u>ll links to clipboard</CopyButton>
<CopyButton bind:this={btn_copy_markdown} text={markdown}>Copy mark<u>d</u>own to clipboard</CopyButton>
<CopyButton bind:this={btn_copy_bbcode} text={bbcode}>Copy <u>B</u>BCode to clipboard</CopyButton>
<br/>

{#if window.user.subscription.name === ""}
	<section>
		<div class="instruction">
			<span class="big_number">4</span>
			<span class="instruction_text">Support me on Patreon!</span>
		</div>
		<p>
			Pixeldrain costs a lot of money to maintain. Currently the site
			makes just barely enough money to pay for hosting. I have never been
			able to compensate myself for the hours I have put in developing
			this project. Please consider getting a subscription so I can
			continue working on pixeldrain and make it even better.
		</p>
		<p>
			Pro costs only <b>€40 per year</b> or <b>€4 per month</b>. You will
			get some nice benefits and more features are on the way. You can
			help with making pixeldrain the easiest and fastest way to share
			files online!
		</p>
		<br/>
		<div style="text-align: center;">
			<a href="#pro" class="button big_button" style="min-width: 350px;">
				<i class="icon">arrow_downward</i>
				Check out Pro
				<i class="icon">arrow_downward</i>
			</a>
		</div>
	</section>
{/if}

<br/>

<style>
.big_button {
	width: 40%;
	min-width: 300px;
	max-width: 400px;
	margin: 10px;
	border-radius: 32px;
	font-size: 1.8em;
	justify-content: center;
}
.instruction {
	border-top: 1px solid var(--separator);
	margin: 1em auto;
	padding: 5px;
}
.big_number {
	font-size: 1.5em;
	font-weight: bold;
	line-height: 1em;
	text-align: center;
	display: inline-block;
	background: var(--highlight_background);
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
	vertical-align: middle;
}

.album_name_form {
	display: inline-flex;
	flex-direction: row;
	align-items: center;
}

.social_buttons {
	flex-direction: column;
	min-width: 5em;
}
.social_buttons.hide {
	display: none;
}
.social_buttons > .icon {
	font-size: 40px;
	display: inline-block;
}
.hide {
	display: none;
}
</style>
