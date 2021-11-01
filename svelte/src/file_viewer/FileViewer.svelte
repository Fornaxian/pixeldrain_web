<script>
import { onMount, tick } from "svelte";
import Modal from "../util/Modal.svelte";
import PixeldrainLogo from "../util/PixeldrainLogo.svelte";
import DetailsWindow from "./DetailsWindow.svelte";
import FilePreview from "./FilePreview.svelte";
import ListNavigator from "./ListNavigator.svelte";
import FileStats from "./FileStats.svelte";
import { copy_text } from "../util/Util.svelte";
import EditWindow from "./EditWindow.svelte";
import EmbedWindow from "./EmbedWindow.svelte";
import ReportWindow from "./ReportWindow.svelte";
import IntroPopup from "./IntroPopup.svelte";
import AdLeaderboard from "./AdLeaderboard.svelte";
import AdSkyscraper from "./AdSkyscraper.svelte";
import Sharebar from "./Sharebar.svelte";

let is_list = false
let embedded = false
let view_token = ""
let file_preview
let current_file = {
	id: "",
	name: "loading...",
	size: 0,
	bandwidth_used: 0,
	downloads: 0,
	views: 0,
	mime_type: "",
	availability: "",
	show_ads: false,
	can_edit: false,
	get_href: "",
	download_href: "",
	icon_href: "",
}
let current_list = {
	id: "",
	title: "",
	files: [],
	download_href: "",
}
let button_home
let list_navigator
let list_shuffle = false
let toggle_shuffle = () => {
	list_shuffle = !list_shuffle
	list_navigator.set_shuffle(list_shuffle)
}

let sharebar
let sharebar_visible = false
let toggle_sharebar = () => {
	if (navigator.share) {
		let name = current_file.name
		if (is_list) {
			name = current_list.title
		}

		navigator.share({
			title: name,
			text: "I would like to share '" + name + "' with you",
			url: window.location.href
		})
		return
	}

	sharebar_visible = !sharebar_visible
	if (sharebar_visible) {
		sharebar.show()
	} else {
		sharebar.hide()
	}
}
let toolbar_visible = (window.innerWidth > 600)
let toolbar_toggle = () => {
	toolbar_visible = !toolbar_visible
	if (!toolbar_visible && sharebar_visible) {
		toggle_sharebar()
	}
}
let details_window
let details_visible = false
let qr_window
let qr_visible = false
let edit_window
let edit_visible = false
let report_window
let report_visible = false
let embed_window
let embed_visible = false
let skyscraper_visible = false

onMount(() => {
	let viewer_data = window.viewer_data
	embedded = viewer_data.embedded

	if (embedded) {
		toolbar_visible = false
	}

	view_token = viewer_data.view_token

	if (viewer_data.type === "list") {
		open_list(viewer_data.api_response)
	} else {
		open_file(viewer_data.api_response)
	}
})

const open_list = (list) => {
	list.download_href = window.api_endpoint+"/list/"+list.id+"/zip"
	list.files.forEach(file => {
		file_set_href(file)
	})

	current_list = list

	// Setting is_list to true activates the ListNavgator, which makes sure the
	// correct file is opened
	is_list = true
}

const open_file = (file) => {
	file_set_href(file)
	current_file = file

	// Register a file view
	fetch(window.api_endpoint + "/file/" + current_file.id + "/view", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: "token=" + view_token
	})
}

const file_set_href = file => {
	file.get_href = window.api_endpoint+"/file/"+file.id
	file.download_href = window.api_endpoint+"/file/"+file.id+"?download"
	file.icon_href = window.api_endpoint+"/file/"+file.id+"/thumbnail"
	file.timeseries_href = window.api_endpoint+"/file/"+file.id+"/timeseries"
}

let download_frame
let is_captcha_script_loaded = false
let download_captcha_window
let captcha_type = "" // rate_limit or malware
let captcha_window_title = ""
let captcha_container
const download = () => {
	if (!window.viewer_data.captcha_key) {
		console.debug("Server doesn't support captcha, starting download")
		download_frame.src = current_file.download_href
		return
	}
	if (current_file.availability === "") {
		console.debug("File is available, starting download")
		download_frame.src = current_file.download_href
		return
	}

	console.debug("File is not readily available, showing captcha dialog")

	// When the captcha is filled in by the user this function is called. Here
	// we trigger the download using the captcha token Google provided us with
	let captcha_complete_callback = token => {
		// Download the file using the recaptcha token
		download_frame.src = current_file.download_href + "&recaptcha_response=" + token
		download_captcha_window.hide()
	}

	// Function which will be called when the captcha script is loaded. This
	// renders the checkbox in the modal window
	window.captcha_script_loaded = async () => {
		download_captcha_window.show()
		await tick()
		grecaptcha.render(captcha_container, {
			sitekey: window.viewer_data.captcha_key,
			theme: "dark",
			callback: captcha_complete_callback,
		})
	}

	if (current_file.availability === "file_rate_limited_captcha_required") {
		captcha_type = "rate_limit"
		captcha_window_title = "Rate limiting enabled!"
	} else if (current_file.availability === "virus_detected_captcha_required") {
		captcha_type = "malware"
		captcha_window_title = "Malware warning!"
	}

	if (is_captcha_script_loaded) {
		console.debug("Captcha script is already loaded. Show the modal")
		captcha_script_loaded()
	} else {
		console.debug("Captcha script has not been loaded yet. Embedding now")

		let script = document.createElement("script")
		script.src = "https://www.google.com/recaptcha/api.js?onload=captcha_script_loaded&render=explicit"
		document.body.appendChild(script)
		is_captcha_script_loaded = true
	}
}
const download_list = () => {
	if (is_list) {
		download_frame.src = current_list.download_href
	}
}

let supports_fullscreen = !!document.documentElement.requestFullscreen
let fullscreen = false
const toggle_fullscreen = () => {
	if (!fullscreen) {
		document.documentElement.requestFullscreen()
		document.getElementById("btn_fullscreen_icon").innerText = "fullscreen_exit"
		fullscreen = true
	} else {
		document.exitFullscreen()
		document.getElementById("btn_fullscreen_icon").innerText = "fullscreen"
		fullscreen = false
	}
}

let copy_url_status = "" // empty, copied, or error
const copy_url = () => {
	if (copy_text(window.location.href)) {
		copy_url_status = "copied"
	} else {
		copy_url_status = "error"
		alert("Your browser does not support copying text.")
	}

	setTimeout(() => { copy_url_status = "" }, 60000)
}

const grab_file = async () => {
	if (!window.user_authenticated || current_file.can_edit) {
		return
	}

	const form = new FormData()
	form.append("grab_file", current_file.id)

	try {
		const resp = await fetch(
			window.api_endpoint + "/file",
			{ method: "POST", body: form },
		);
		if (resp.status >= 400) {
			throw (await resp.json()).message
		}

		window.open("/u/" + (await resp.json()).id, "_blank")
	} catch (err) {
		alert("Failed to grab file: " + err)
		return
	}
}

const keyboard_event = evt => {
	if (evt.ctrlKey || evt.altKey || evt.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}
	if (document.activeElement.type && document.activeElement.type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}

	console.debug("Key pressed: " + evt.keyCode)
	switch (evt.keyCode) {
		case 65: // A or left arrow key go to previous file
		case 37:
			if (list_navigator) {
				list_navigator.prev()
			}
			break
		case 68: // D or right arrow key go to next file
		case 39:
			if (list_navigator) {
				list_navigator.next()
			}
			break
		case 83:
			if (evt.shiftKey) {
				download_list() // SHIFT + S downloads all files in list
			} else {
				download() // S to download the current file
			}
			break
		case 82: // R to toggle list shuffle
			if (list_navigator) {
				toggle_shuffle()
			}
			break
		case 67: // C to copy to clipboard
			copy_url()
			break
		case 73: // I to open the details window
			details_window.toggle()
			break
		case 69: // E to open the edit window
			if (current_file.can_edit) {
				edit_window.toggle()
			}
			break
		case 77: // M to open the embed window
			embed_window.toggle()
			break
		case 71: // G to grab this file
			this.grabFile()
			break
		case 81: // Q to close the window
			window.close()
			break
	}
}

</script>

<svelte:window on:keydown={keyboard_event}/>

<div id="file_viewer" class="file_viewer">
	<div id="headerbar" class="headerbar" class:embedded>
		<button on:click={toolbar_toggle} class="button_toggle_toolbar round" class:button_highlight={toolbar_visible}>
			<i class="icon">menu</i>
		</button>
		<a href="/" bind:this={button_home} class="button button_home round" target={embedded ? "_blank" : ""}>
			<PixeldrainLogo style="height: 1.6em; width: 1.6em; margin: 0 4px 0 0;"></PixeldrainLogo>
		</a>
		<div id="file_viewer_headerbar_title" class="file_viewer_headerbar_title">
			<div id="list_title">{current_list.title}</div>
			<div id="lile_title">{current_file.name}</div>
		</div>
		{#if embedded && supports_fullscreen}
			<button class="round" on:click={toggle_fullscreen}>
				<i class="icon" id="btn_fullscreen_icon">fullscreen</i>
			</button>
		{/if}
	</div>

	{#if is_list}
		<ListNavigator bind:this={list_navigator} files={current_list.files} on:set_file={(e) => { open_file(e.detail) }}></ListNavigator>
	{/if}

	<div id="file_preview_window" class="file_preview_window">
		<div id="toolbar" class="toolbar" class:toolbar_visible><div><div>
			<FileStats file={current_file}></FileStats>

			<hr/>
			<button on:click={download} class="toolbar_button button_full_width">
				<i class="icon">save</i>
				<span>Download</span>
			</button>
			{#if is_list}
				<button on:click={download_list} class="toolbar_button button_full_width">
					<i class="icon">save</i>
					<span>DL all files</span>
				</button>
			{/if}
			<button on:click={copy_url}
				class="toolbar_button button_full_width"
				class:button_highlight={copy_url_status === "copied"}
				class:button_red={copy_url_status === "error"}>
				<i class="icon">content_copy</i>
				<span>
					{#if copy_url_status === "copied"}
						Copied!
					{:else if copy_url_status === "error"}
						Error!
					{:else}
						<u>C</u>opy link
					{/if}
				</span>
			</button>
			<button on:click={toggle_sharebar} class="toolbar_button button_full_width" class:button_highlight={sharebar_visible}>
				<i class="icon">share</i>
				<span>Share</span>
			</button>
			<button class="toolbar_button button_full_width" on:click={qr_window.toggle} class:button_highlight={qr_visible}>
				<i class="icon">qr_code</i>
				<span>QR code</span>
			</button>
			{#if is_list}
				<button
					class="toolbar_button button_full_width"
					title="Randomize the order of the files in this list"
					class:button_highlight={list_shuffle}
					on:click={toggle_shuffle}
				>
					<i class="icon">shuffle</i>
					{#if list_shuffle}
						<span>Shuffle&nbsp;&#x2611;</span>
					{:else}
						<span>Shuffle&nbsp;&#x2610;</span>
					{/if}
				</button>
			{/if}
			<button class="toolbar_button button_full_width" on:click={details_window.toggle} class:button_highlight={details_visible}>
				<i class="icon">help</i>
				<span>Deta<u>i</u>ls</span>
			</button>
			<hr/>
			{#if current_file.can_edit}
				<button class="toolbar_button button_full_width" on:click={edit_window.toggle} class:button_highlight={edit_visible}>
					<i class="icon">edit</i>
					<span><u>E</u>dit</span>
				</button>
			{/if}
			{#if window.user_authenticated && !current_file.can_edit}
				<button on:click={grab_file} class="toolbar_button button_full_width" title="Copy this file to your own pixeldrain account">
					<i class="icon">save_alt</i>
					<span><u>G</u>rab file</span>
				</button>
			{/if}
			<button class="toolbar_button button_full_width" title="Include this file in your own webpages" on:click={embed_window.toggle} class:button_highlight={embed_visible}>
				<i class="icon">code</i>
				<span>E<u>m</u>bed</span>
			</button>
			<button class="toolbar_button button_full_width" title="Report abuse in this file" on:click={report_window.toggle} class:button_highlight={report_visible}>
				<i class="icon">flag</i>
				<span>Report</span>
			</button>
			<br/>
		</div></div></div>

		<Sharebar bind:this={sharebar}></Sharebar>

		<div id="file_preview" class="file_preview checkers" class:toolbar_visible class:skyscraper_visible>
			<FilePreview
				file={current_file}
				bind:this={file_preview}
				on:download={download}
				on:prev={() => { if (list_navigator) { list_navigator.prev() }}}
				on:next={() => { if (list_navigator) { list_navigator.next() }}}>
			</FilePreview>
		</div>

		{#if current_file.show_ads && window.viewer_data.user_ads_enabled}
			<AdSkyscraper on:visibility={e => {skyscraper_visible = e.detail}}></AdSkyscraper>
		{/if}

		<!-- This frame will load the download URL when a download button is pressed -->
		<iframe bind:this={download_frame} title="File download frame" style="display: none; width: 1px; height: 1px;"></iframe>
	</div>

	{#if current_file.show_ads && window.viewer_data.user_ads_enabled}
		<AdLeaderboard></AdLeaderboard>
	{:else if !window.viewer_data.user_ads_enabled}
		<div style="text-align: center; line-height: 1.3em; font-size: 13px;">
			Thank you for supporting pixeldrain!
		</div>
	{:else if !current_file.show_ads}
		<div style="text-align: center; line-height: 1.3em; font-size: 13px;">
			The uploader of this file disabled advertisements. You can do the same for <a href="/#pro">only €2 per month</a>!
		</div>
	{/if}

	<Modal bind:this={details_window} on:is_visible={e => {details_visible = e.detail}} title="File details" width="1200px">
		<DetailsWindow file={current_file}></DetailsWindow>
	</Modal>

	<Modal bind:this={qr_window} on:is_visible={e => {qr_visible = e.detail}} title="QR code" width="500px">
		<img src="{window.api_endpoint}/misc/qr?text={encodeURIComponent(window.location.href)}" alt="QR code" style="display: block; width: 100%;"/>
	</Modal>

	<Modal bind:this={edit_window} on:is_visible={e => {edit_visible = e.detail}} title={"Editing "+current_file.name}>
		<EditWindow file={current_file} list={current_list}></EditWindow>
	</Modal>

	<Modal bind:this={embed_window} on:is_visible={e => {embed_visible = e.detail}} title="Embed file" width="850px">
		<EmbedWindow file={current_file} list={current_list}></EmbedWindow>
	</Modal>

	<Modal bind:this={report_window} on:is_visible={e => {report_visible = e.detail}} title="Report abuse" width="800px">
		<ReportWindow file={current_file} list={current_list}></ReportWindow>
	</Modal>

	<Modal bind:this={download_captcha_window} title={captcha_window_title} width="500px">
		{#if captcha_type === "rate_limit"}
			<p>
				This file is using a suspicious amount of bandwidth relative to
				its popularity. To continue downloading this file you will have
				to prove that you're a human first.
			</p>
		{:else if captcha_type === "malware"}
			<p>
				According to our scanning systems this file may contain a virus.
				You can continue downloading this file at your own risk, but you
				will have to prove that you're a human first.
			</p>
		{/if}
		<br/>
		<div bind:this={captcha_container} class="captcha_container"></div>
	</Modal>

	<IntroPopup target={button_home}></IntroPopup>
</div>


<style>
/* Viewer container */
.file_viewer {
	position: absolute;
	display: flex;
	flex-direction: column;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	overflow: hidden;
	background-color: var(--layer_2_color);
}

/* Headerbar (row 1) */
.headerbar {
	flex-grow: 0;
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
	text-align: left;
	z-index: 10;
	box-shadow: none;
	padding: 4px;
}
.headerbar.embedded {
	padding: 2px;
}

/* Headerbar components */
.headerbar > * {
	flex-grow: 0;
	flex-shrink: 0;
	margin-left: 4px;
	margin-right: 4px;
	display: inline;
}
.headerbar > .file_viewer_headerbar_title {
	flex-grow: 1;
	flex-shrink: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	line-height: 1.2em; /* When the page is a list there will be two lines. Dont's want to stretch the container*/
	white-space: nowrap;
	text-overflow: ellipsis;
	justify-content: center;
}
.headerbar > button > .icon {
	font-size: 1.6em;
}
.headerbar > .button_home::after {
	content: "pixeldrain";
}
@media (max-width: 600px) {
	.headerbar > .button_home::after {
		content: "pd";
	}
}

/* File preview area (row 3) */
.file_preview_window {
	flex-grow: 1;
	flex-shrink: 1;
	position: relative;
	display: inline-block;
	width: auto;
	height: auto;
	margin: 0;
	z-index: 9;
}
.file_preview {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	display: inline-block;
	min-height: 100px;
	min-width: 100px;
	text-align: center;
	vertical-align: middle;
	transition: left 0.5s, right 0.5s;
	overflow: hidden;
	box-shadow: inset 2px 2px 10px 2px var(--shadow_color);
	border-radius: 16px;
}

/* Toolbars */
.toolbar {
	position: absolute;
	width: 8em;
	z-index: 49;
	overflow: hidden;
	left: -8em;
	bottom: 0;
	top: 0;
	padding: 0;
	text-align: left;
	transition: left 0.5s, right 0.5s;
	background-color: var(--layer_2_color);
}
.toolbar.toolbar_visible { left: 0; }
.file_preview.toolbar_visible { left: 8em; }
.file_preview.skyscraper_visible { right: 160px; }

/* Workaround to hide the scrollbar in non webkit browsers, it's really ugly' */
.toolbar > div {
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	right: -30px;
	overflow-y: scroll;
	overflow-x: hidden;
}
.toolbar > div > div {
	position: absolute;
	left: 0;
	top: 0;
	width: 8em;
	height: auto;
	text-align: center;
}

.toolbar_button{
	text-align: left;
}
.toolbar_button > span {
	vertical-align: middle;
}

/* =====================
	|| MISC COMPONENTS ||
	===================== */

.captcha_container {
	text-align: center;
}
/* global() to silence the unused selector warning */
.captcha_container > :global(div) {
	display: inline-block;
}
</style>
