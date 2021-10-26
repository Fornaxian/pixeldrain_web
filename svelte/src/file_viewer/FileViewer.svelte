<script>
import { onMount } from "svelte";
import Modal from "../util/Modal.svelte";

import PixeldrainLogo from "../util/PixeldrainLogo.svelte";
import DetailsWindow from "./DetailsWindow.svelte";
import FilePreview from "./FilePreview.svelte";
import ListNavigator from "./ListNavigator.svelte";
import Pdf from "./viewers/PDF.svelte";

let is_list = false
let embedded = false
let view_token = ""
let file_preview
let current_file = {
	id: "",
	name: "loading...",
	mime_type: "",
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
let list_navigator
let list_shuffle = false
let toggle_shuffle = () => {
	list_shuffle = !list_shuffle
	list_navigator.set_shuffle(list_shuffle)
}

let sharebar_visible = false
let toolbar_visible = (window.innerWidth > 600)
let toolbar_toggle = () => {
	toolbar_visible = !toolbar_visible
	if (!toolbar_visible) {
		sharebar_visible = false
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
	is_list = true

	list.download_href = window.api_endpoint+"/list/"+list.id+"/zip"
	list.files.forEach(file => {
		file_set_href(file)
	})

	current_list = list
	open_file(list.files[0])
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
const download = () => {
	download_frame.src = current_file.download_href
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
			this.toolbar.copyUrl()
			break
		case 73: // I to open the details window
			details_window.toggle()
			break
		case 69: // E to open the edit window
			edit_window.toggle()
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
		<a href="/" id="button_home" class="button button_home round" target={embedded ? "_blank" : ""}>
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
			<div id="stat_views_label" class="toolbar_label">Views</div>
			<div id="stat_views" style="text-align: center;">N/A</div>
			<div id="stat_downloads_label" class="toolbar_label">Downloads</div>
			<div id="stat_downloads" style="text-align: center;">N/A</div>
			<div id="stat_size_label" class="toolbar_label">Size</div>
			<div id="stat_size" style="text-align: center;">N/A</div>

			<hr/>
			<button on:click={download} class="toolbar_button button_full_width">
				<i class="icon">save</i>
				<span>Download</span>
			</button>
			{#if is_list}
				<button class="toolbar_button button_full_width">
					<i class="icon">save</i>
					<span>DL all files</span>
				</button>
			{/if}
			<button class="toolbar_button button_full_width">
				<i class="icon">content_copy</i>
				<span><u>C</u>opy link</span>
			</button>
			<button on:click={() => sharebar_visible = !sharebar_visible} class="toolbar_button button_full_width" class:button_highlight={sharebar_visible}>
				<i class="icon">share</i> Share
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
			<button class="toolbar_button button_full_width" on:click={edit_window.toggle} class:button_highlight={edit_visible}>
				<i class="icon">edit</i>
				<span><u>E</u>dit</span>
			</button>
			<button class="toolbar_button button_full_width" title="Copy this file to your own pixeldrain account">
				<i class="icon">save_alt</i>
				<span><u>G</u>rab file</span>
			</button>
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

		<div id="sharebar" class="sharebar" class:sharebar_visible>
			Share on:<br/>
			<button class="sharebar-button button_full_width" onclick="window.open('mailto:please@set.address?subject=File%20on%20pixeldrain&body=' + window.location.href);">
				E-Mail
			</button>
			<button class="sharebar-button button_full_width" onclick="window.open('https://www.reddit.com/submit?url=' + window.location.href);">
				Reddit
			</button>
			<button class="sharebar-button button_full_width" onclick="window.open('https://twitter.com/share?url=' + window.location.href);">
				Twitter
			</button>
			<button class="sharebar-button button_full_width" onclick="window.open('http://www.facebook.com/sharer.php?u=' + window.location.href);">
				Facebook
			</button>
			<button class="sharebar-button button_full_width" onclick="window.open('http://www.tumblr.com/share/link?url=' + window.location.href);">
				Tumblr
			</button>
		</div>

		<div id="file_preview" class="file_preview checkers" class:toolbar_visible>
			<FilePreview
				file={current_file}
				bind:this={file_preview}
				on:download={download}
				on:prev={() => { if (list_navigator) { list_navigator.prev() }}}
				on:next={() => { if (list_navigator) { list_navigator.next() }}}>
			</FilePreview>
		</div>

		<div id="skyscraper" class="skyscraper">
			<button id="btn_skyscraper_close" class="round">
				<i class="icon">close</i> Close ad
			</button>
			<div id="skyscraper_ad_space" class="skyscraper_ad_space"></div>
		</div>

		<!-- This frame will load the download URL when a download button is pressed -->
		<iframe bind:this={download_frame} title="File download frame" style="display: none; width: 1px; height: 1px;"></iframe>
	</div>

	<div id="sponsors" class="sponsors">
		<div style="text-align: center; line-height: 1.3em; font-size: 13px;">
			Thank you for supporting pixeldrain!
		</div>
	</div>

	<Modal bind:this={details_window} on:is_visible={e => {details_visible = e.detail}} title="File details" width="1200px">
		<DetailsWindow file={current_file}></DetailsWindow>
	</Modal>
	<Modal bind:this={qr_window} on:is_visible={e => {qr_visible = e.detail}} title="QR code">
		Hi!
	</Modal>
	<Modal bind:this={edit_window} on:is_visible={e => {edit_visible = e.detail}} title={"Editing "+current_file.name}>
		Hi!
	</Modal>
	<Modal bind:this={embed_window} on:is_visible={e => {embed_visible = e.detail}} title="Embed file">
		Hi!
	</Modal>
	<Modal bind:this={report_window} on:is_visible={e => {report_visible = e.detail}} title="Report abuse">
		Hi!
	</Modal>
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

/* List Navigator (row 2) */

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


/* Sponsors (row 4) */
.file_viewer > .sponsors {
	font-size: 0;
	line-height: 0;
}
.file_viewer > .sponsors > .sponsors_banner {
	display: block;
	margin: auto;
	transform-origin: 0 0;
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
	transition: left 0.5s;
	background-color: var(--layer_2_color);
}
.toolbar.toolbar_visible { left: 0; }
.file_preview.toolbar_visible { left: 8em; }

.sharebar {
	position: absolute;
	width: 7em;
	left: -8em;
	bottom: 0;
	top: 0;
	overflow-y: scroll;
	overflow-x: hidden;
	box-shadow: inset 1px 1px 5px var(--shadow_color);
	background-color: var(--layer_1_color);
	border-radius: 16px;
	text-align: center;
	z-index: 48;
	overflow: hidden;
	transition: left 0.5s;
}
.sharebar.sharebar_visible { left: 8em; }

.file_viewer > .file_viewer_window > .skyscraper {
	position: absolute;
	width: 160px;
	z-index: 49;
	overflow: hidden;
	right: -170px;
	bottom: 0;
	top: 0;
	padding: 0;
	text-align: center;
	transition: right 0.5s;
	background-color: var(--layer_2_color);
}
.file_viewer > .file_viewer_window > .skyscraper > .skyscraper_ad_space {
	width: 100%;
	height: 100%;
}


/* =====================
	== FILE CONTAINERS ==
	=====================*/


/* ========================
	|| TOOLBAR COMPONENTS ||
	======================== */


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
.toolbar_label {
	text-align: left;
	padding-left: 10px;
	font-size: 0.8em;
	line-height: 0.7em;
	margin-top: 0.5em;
}

/* =========================
	|| SHAREBAR COMPONENTS ||
	========================= */

.sharebar-button {text-align: center;}
.sharebar-button > svg,
.sharebar-button > img {
	width: 40px;
	height: 40px;
}

/* =====================
	|| MISC COMPONENTS ||
	===================== */

.captcha_popup_captcha > div {
	display: inline-block;
}

table {width: auto !important;}

/* Abuse report label*/
.abuse_type_form > label {
	display: block;
	border-bottom: 1px var(--layer_2_color_border) solid;
	padding: 0.5em;
}
.abuse_type_form > label:last-of-type {
	border-bottom: none;
}


/* ====================
	|| LIST NAVIGATOR ||
	==================== */

.file-container{
	position: absolute;
	top: 100px;
	left: 0px;
	right: 0px;
	bottom: 0px;
	width: 100%;
	overflow: hidden;
	border: none;
}

.file-container-frame{
	position: absolute;
	width: 100%;
	height: 100%;
	border: none;
}

.intro_popup {
	position: absolute;
	width: 380px;
	max-width: 80%;
	height: auto;
	background-color: var(--layer_4_color);
	box-shadow: 1px 1px 10px var(--shadow_color);
	border-radius: 20px;
	z-index: 50;
	transition: opacity .4s, left .5s, top .5s;
}
.intro_popup:before {
	content: "";
	display: block;
	position: absolute;
	left: 30px;
	top: -15px;
	border-bottom: 15px solid var(--layer_4_color);
	border-left: 15px solid transparent;
	border-right: 15px solid transparent;
}

</style>
