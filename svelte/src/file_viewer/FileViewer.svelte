<script>
import { onMount, tick } from "svelte";
import { file_struct, list_struct, file_set_href } from "./FileUtilities.svelte";
import Modal from "../util/Modal.svelte";
import DetailsWindow from "./DetailsWindow.svelte";
import FilePreview from "./viewers/FilePreview.svelte";
import ListNavigator from "./ListNavigator.svelte";
import FileStats from "./FileStats.svelte";
import EditWindow from "./EditWindow.svelte";
import EmbedWindow from "./EmbedWindow.svelte";
import ReportWindow from "./ReportWindow.svelte";
import BottomBanner from "./BottomBanner.svelte";
import Sharebar from "./Sharebar.svelte";
import GalleryView from "./GalleryView.svelte";
import Downloader from "./Downloader.svelte";
import CustomBanner from "./CustomBanner.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import TransferLimit from "./TransferLimit.svelte";
import ListStats from "./ListStats.svelte";
import ListUpdater from "./ListUpdater.svelte";
import HomeButton from "./HomeButton.svelte";
import CopyButton from "../layout/CopyButton.svelte";

let loading = true
let embedded = false
let view_token = ""
let ads_enabled = false

let view = "" // file or gallery
let file = file_struct
let list = list_struct
let is_list = false
let list_downloadable = false
let file_viewer
let file_preview
let list_navigator
let sharebar
let sharebar_visible = false
let fullscreen = false
let toggle_sharebar = () => {
	if (navigator.share) {
		let name = file.name
		if (is_list) {
			name = list.title
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

let downloader
let list_updater
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
		list.files = [viewer_data.api_response]
		open_file_index(0)
	}

	ads_enabled = list.files[0].show_ads
	loading = false
})
const reload = async () => {
	loading = true
	if (is_list) {
		try {
			const resp = await fetch(list.info_href);
			if (resp.status >= 400) {
				throw (await resp.json()).message
			}

			open_list(await resp.json())
		} catch (err) {
			alert(err)
		}
	} else {
		try {
			const resp = await fetch(file.info_href);
			if (resp.status >= 400) {
				throw (await resp.json()).message
			}

			list.files = [await resp.json()]
			open_file_index(0)
		} catch (err) {
			alert(err)
		}
	}
	loading = false
}

const open_list = l => {
	l.download_href = window.api_endpoint+"/list/"+l.id+"/zip"
	l.info_href = window.api_endpoint+"/list/"+l.id
	list_downloadable = true
	l.files.forEach(f => {
		file_set_href(f)

		if (!f.can_download) {
			list_downloadable = false
		}
	})

	list = l

	// Setting is_list to true activates the ListNavgator, which makes sure the
	// correct file is opened
	is_list = true

	if (l.files.length !== 0) {
		apply_customizations(l.files[0])
	}

	hash_change()
}
const hash_change = () => {
	// Skip to the file defined in the link hash
	let matches = location.hash.match(/item=([\d]+)/)
	let index = parseInt(matches ? matches[1] : null)
	if (Number.isInteger(index)) {
		// The URL contains an item number. Navigate to that item
		open_file_index(index)
		return
	}

	// If the hash does not contain a file ID we open the gallery
	if (view !== "gallery") {
		view = "gallery"
		file = file_struct // Empty the file struct
		document.title = list.title+" ~ pixeldrain"
	}
}
const open_file_index = async index => {
	if (index >= list.files.length) {
		index = 0
	} else if (index < 0) {
		index = list.files.length - 1
	}
	if (list.files[index] === file) {
		console.debug("ignoring request to load the same file that is currently loaded")
		return
	}

	console.debug("received request to open file", index)

	file_set_href(list.files[index])
	file = list.files[index]

	// Switch from gallery view to file view if it's not already so
	if (view !== "file") {
		view = "file"
		await tick() // Wait for the file_preview and list_navigator to render
	}

	// Tell the preview window to start rendering the file
	file_preview.set_file(file)

	// Tell the list_navigator to highlight the loaded file
	if (is_list) {
		// Update the URL. This triggers the hash_change again, but it gets
		// ignored because the file is already loaded
		window.location.hash = "#item=" + index
		document.title = file.name+" ~ "+list.title+" ~ pixeldrain"
		list_navigator.set_item(index)
	} else {
		document.title = file.name+" ~ pixeldrain"
	}

	apply_customizations(file)

	// Register a file view
	fetch(window.api_endpoint + "/file/" + file.id + "/view", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: "token=" + view_token
	})
}
const toggle_gallery = () => {
	if (view === "gallery") {
		window.location.hash = "#item=0"
	} else {
		window.location.hash = ""
	}
}

const toggle_fullscreen = () => {
	if (fullscreen || document.fullscreenElement) {
		try {
			document.exitFullscreen()
		} catch (err) {
			console.debug("Failed to exit fullscreen", err)
		}
		fullscreen = false
	} else {
		file_viewer.requestFullscreen()
		fullscreen = true
	}
}

// Premium page customizations. In the gallery view we will use the
// customizations for the first file in the list, else we simply use the
// selected file. In most cases they are all the same so the user won't notice
// any change
let file_preview_background
let custom_header = ""
let custom_header_link = ""
let custom_background = ""
let custom_footer = ""
let custom_footer_link = ""
let disable_download_button = false
let disable_share_button = false
let disable_menu = false
const apply_customizations = file => {
	if (!file.branding) {
		return
	}
	if (file.branding.header_image) {
		custom_header = window.api_endpoint+"/file/"+file.branding.header_image
	}
	if (file.branding.header_link) {
		custom_header_link = file.branding.header_link
	}
	if (file.branding.footer_image) {
		custom_footer = window.api_endpoint+"/file/"+file.branding.footer_image
	}
	if (file.branding.footer_link) {
		custom_footer_link = file.branding.footer_link
	}
	if (file.branding.disable_download_button && !file.can_edit) {
		disable_download_button = true
	}
	if (file.branding.disable_share_button && !file.can_edit) {
		disable_share_button = true
	}
	if (file.branding.disable_menu && !file.can_edit) {
		disable_menu = true
		if (toolbar_visible) {
			toolbar_toggle()
		}
	}

	if (file.branding.background_image) {
		custom_background = window.api_endpoint+"/file/"+file.branding.background_image
		file_preview_background.style.backgroundImage = "url('"+custom_background+"')"
	} else {
		file_preview_background.style.backgroundImage = ""
	}
}

const grab_file = async () => {
	if (!window.user_authenticated) {
		return
	}

	const form = new FormData()
	form.append("grab_file", file.id)

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

let copy_btn
const keyboard_event = evt => {
	if (evt.ctrlKey || evt.altKey || evt.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	}
	if (
		document.activeElement.type && (
			document.activeElement.type === "text" ||
			document.activeElement.type === "email" ||
			document.activeElement.type === "textarea"
		)
	) {
		return // Prevent shortcuts from interfering with input fields
	}

	console.debug("Key pressed: " + evt.key)
	switch (evt.key) {
		case "a": // A or left arrow key go to previous file
		case "ArrowLeft":
			if (list_navigator) {
				list_navigator.prev()
			}
			break
		case "d": // D or right arrow key go to next file
		case "ArrowRight":
			if (list_navigator) {
				list_navigator.next()
			}
			break
		case " ": // Spacebar pauses / unpauses video and audio playback
			file_preview.toggle_playback()
			break
		case "s":
		case "S":
			if (evt.shiftKey) {
				downloader.download_list() // SHIFT + S downloads all files in list
			} else {
				downloader.download_file() // S to download the current file
			}
			break
		case "r": // R to toggle the report window
			report_window.toggle()
			break
		case "c": // C to copy to clipboard
			copy_btn.copy()
			break
		case "i": // I to open the details window
			details_window.toggle()
			break
		case "e": // E to open the edit window
			if (file.can_edit || list.can_edit) {
				edit_window.toggle()
			}
			break
		case "m": // M to open the embed window
			embed_window.toggle()
			break
		case "g": // G to grab this file
			this.grabFile()
			break
		case "q": // Q to close the window
			window.close()
			break
		case "u": // U to upload new files
			if (list_updater) {
				list_updater.pick_files()
			}
	}
}
</script>

<svelte:window on:keydown={keyboard_event} on:hashchange={hash_change}/>

<div class="file_viewer" bind:this={file_viewer}>
	<div class="headerbar">
		{#if !disable_menu}
			<button
				on:click={toolbar_toggle}
				class="round"
				class:button_highlight={toolbar_visible}
				style="line-height: 1em;"
				title="Open or close the toolbar">
				<i class="icon">menu</i>
			</button>
		{/if}

		<HomeButton embedded_viewer={embedded}/>

		<div class="file_viewer_headerbar_title">
			{#if list.title !== ""}{list.title}<br/>{/if}
			{#if file.name !== ""}{file.name}{/if}
		</div>
		{#if embedded}
			<a href={window.location.pathname} target="_blank" class="button round" title="Open this page in a new tab" rel="noreferrer">
				<i class="icon" id="btn_fullscreen_icon">open_in_new</i>
			</a>
		{/if}
	</div>

	{#if is_list && view === "file"}
		<ListNavigator
			bind:this={list_navigator}
			files={list.files}
			on:set_file={e => open_file_index(e.detail)}
			on:toggle_gallery={toggle_gallery}
		>
		</ListNavigator>
	{/if}

	<CustomBanner src={custom_header} link={custom_header_link} border_top={true}></CustomBanner>

	<div class="file_preview_row">
		<div class="toolbar" class:toolbar_visible>
			{#if view === "file"}
				<FileStats file={file}/>
			{:else if view === "gallery"}
				<ListStats list={list}/>
			{/if}

			<div class="separator"></div>

			{#if view === "file" && !disable_download_button}
				<button
					on:click={downloader.download_file}
					class="toolbar_button"
					class:button_red={file.can_download === false}
					title="Save this file to your computer">
					<i class="icon">download</i>
					<span>Download</span>
				</button>
			{/if}

			{#if is_list && list_downloadable && !disable_download_button}
				<button
					on:click={downloader.download_list}
					class="toolbar_button"
					title="Download all files in this album as a zip archive">
					<i class="icon">download</i>
					<span>DL all files</span>
				</button>
			{/if}

			<CopyButton bind:this={copy_btn} text={window.location.href} style="width: calc(100% - 4px)">
				<u>C</u>opy link
			</CopyButton>

			{#if !disable_share_button}
				<button
					on:click={toggle_sharebar}
					class="toolbar_button"
					class:button_highlight={sharebar_visible}
					title="Share this file on social media">
					<i class="icon">share</i>
					<span>Share</span>
				</button>
			{/if}

			<button
				class="toolbar_button"
				on:click={qr_window.toggle}
				class:button_highlight={qr_visible}
				title="Show a QR code with a link to this page. Useful for sharing files in-person">
				<i class="icon">qr_code</i>
				<span>QR code</span>
			</button>

			<button
				class="toolbar_button"
				on:click={toggle_fullscreen}
				class:button_highlight={fullscreen}
				title="Open page in full screen mode">
				{#if fullscreen}
					<i class="icon">fullscreen_exit</i>
				{:else}
					<i class="icon">fullscreen</i>
				{/if}
				<span>Fullscreen</span>
			</button>

			{#if view === "file"}
				<button
					class="toolbar_button"
					on:click={details_window.toggle}
					class:button_highlight={details_visible}
					title="Information and statistics about this file">
					<i class="icon">help</i>
					<span>Deta<u>i</u>ls</span>
				</button>
			{/if}

			<div class="separator"></div>

			{#if file.can_edit || list.can_edit}
				<button
					class="toolbar_button"
					on:click={edit_window.toggle}
					class:button_highlight={edit_visible}
					title="Edit or delete this file or album">
					<i class="icon">edit</i>
					<span><u>E</u>dit</span>
				</button>
			{/if}

			{#if view === "file" && window.user_authenticated && !disable_download_button}
				<button
					on:click={grab_file}
					class="toolbar_button"
					title="Copy this file to your own pixeldrain account">
					<i class="icon">save_alt</i>
					<span><u>G</u>rab file</span>
				</button>
			{/if}

			<button
				class="toolbar_button"
				title="Report this file as abusive"
				on:click={report_window.toggle}
				class:button_highlight={report_visible}>
				<i class="icon">flag</i>
				<span>Report</span>
			</button>

			{#if !disable_download_button}
				<button
					class="toolbar_button"
					title="Include this file in your own webpages"
					on:click={embed_window.toggle}
					class:button_highlight={embed_visible}>
					<i class="icon">code</i>
					<span>E<u>m</u>bed</span>
				</button>
			{/if}
		</div>

		<div bind:this={file_preview_background}
			class="file_preview"
			class:checkers={!custom_background}
			class:custom_background={!!custom_background}
			class:toolbar_visible
		>
			{#if view === "file"}
				<FilePreview
					bind:this={file_preview}
					is_list={is_list}
					on:download={downloader.download_file}
					on:prev={() => { if (list_navigator) { list_navigator.prev() }}}
					on:next={() => { if (list_navigator) { list_navigator.next() }}}
					on:loading={e => {loading = e.detail}}
					on:reload={reload}
				/>
			{:else if view === "gallery"}
				<GalleryView
					list={list}
					on:reload={reload}
					on:update_list={e => list_updater.update(e.detail)}
					on:pick_files={() => list_updater.pick_files()}
					on:upload_files={e => list_updater.upload_files(e.detail)}
				/>
			{/if}
		</div>

		<Sharebar bind:this={sharebar}></Sharebar>
	</div>

	{#if ads_enabled}
		<BottomBanner/>
		<TransferLimit/>
	{:else if custom_footer}
		<CustomBanner src={custom_footer} link={custom_footer_link}></CustomBanner>
	{/if}

	<Modal bind:this={details_window} on:is_visible={e => {details_visible = e.detail}} title="File details" width="1000px">
		<DetailsWindow file={file}></DetailsWindow>
	</Modal>

	<Modal bind:this={qr_window} on:is_visible={e => {qr_visible = e.detail}} title="QR code" width="500px">
		<img src="{window.api_endpoint}/misc/qr?text={encodeURIComponent(window.location.href)}" alt="QR code" style="display: block; width: 100%;"/>
	</Modal>

	<Modal bind:this={edit_window} on:is_visible={e => {edit_visible = e.detail}} title={"Editing "+file.name}>
		<EditWindow file={file} list={list} on:reload={reload}></EditWindow>
	</Modal>

	<Modal bind:this={embed_window} on:is_visible={e => {embed_visible = e.detail}} title="Embed file" width="820px">
		<EmbedWindow file={file} list={list}></EmbedWindow>
	</Modal>

	<Modal bind:this={report_window} on:is_visible={e => {report_visible = e.detail}} title="Report abuse" width="800px">
		<ReportWindow file={file} list={list}></ReportWindow>
	</Modal>

	<Downloader bind:this={downloader} file={file} list={list}></Downloader>

	{#if is_list && list.can_edit}
		<ListUpdater
			bind:this={list_updater}
			list={list}
			on:reload={reload}
			on:loading={e => {loading = e.detail}}
		/>
	{/if}

	<!-- At the bottom so it renders over everything else -->
	<LoadingIndicator loading={loading}/>
</div>

<style>
.file_viewer {
	position: absolute;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
	background: var(--body_background);
}

/* Headerbar (row 1) */
.headerbar {
	flex-grow: 0;
	flex-shrink: 0;
	display: flex;
	flex-direction: row;
	text-align: left;
	padding: 2px;
	align-items: center;
}
@media(max-height: 600px) {
	.headerbar {
		padding: 1px;
	}
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

/* File preview area (row 3) */
.file_preview_row {
	flex-grow: 1;
	flex-shrink: 1;
	position: relative;
	display: block;
}
.file_preview {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	display: block;
	min-height: 100px;
	min-width: 100px;
	transition: left 0.5s;
	overflow: auto;
	text-align: center;
	border-radius: 8px;
	border: 2px solid var(--separator);
}
.file_preview.toolbar_visible { left: 8.2em; }
.file_preview.custom_background {
	background-size: cover;
	background-position: center;
}

/* Toolbars */
.toolbar {
	position: absolute;
	width: 8.2em;
	overflow-y: auto;
	overflow-x: hidden;
	scrollbar-width: none;
	left: -8.2em;
	bottom: 0;
	top: 0;
	padding: 0;
	text-align: left;
	transition: left 0.5s, right 0.5s;
	z-index: 1;
}
.toolbar::-webkit-scrollbar {
	display: none;
}
.toolbar.toolbar_visible { left: 0; }

.toolbar_button{
	width: calc(100% - 4px);
}
.toolbar_button > span {
	vertical-align: middle;
}
.toolbar > .separator {
	height: 2px;
	width: 100%;
	margin: 4px 0;
	background-color: var(--separator);
}
</style>
