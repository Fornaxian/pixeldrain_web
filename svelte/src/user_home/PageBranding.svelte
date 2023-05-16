<script>
import FilePicker from "../file_viewer/FilePicker.svelte";
import CustomBanner from "../file_viewer/CustomBanner.svelte";
import LoadingIndicator from "../util/LoadingIndicator.svelte";
import SuccessMessage from "../util/SuccessMessage.svelte";
import ThemePicker from "../util/ThemePicker.svelte";
import { onMount } from "svelte";
import Persistence from "../icons/Persistence.svelte";

let loading = false
let success_message

let file_picker
let currently_selecting = "" // header, background or footer

let theme = ""
let header_image = ""
let header_link = ""
let background_image = ""
let footer_image = ""
let footer_link = ""
let disable_download_button = false
let disable_share_button = false
let disable_menu = false

let select_file = t => {
	currently_selecting = t
	file_picker.open()
}
let add_file = files => {
	let type = files[0].type
	if (type != "image/png" && type != "image/jpeg" && type != "image/gif" && type != "image/webp") {
		success_message.set(false, "File must be an image type")
		return
	}
	if (files[0].size > 10e6) {
		success_message.set(false, "Files larger than 10 MB are not allowed. Recommended size is below 1 MB")
		return
	}

	if (currently_selecting === "header") {
		header_image = files[0].id
	} else if (currently_selecting === "background") {
		background_image = files[0].id
	} else if (currently_selecting === "footer") {
		footer_image = files[0].id
	}

	save()
}

let save = async () => {
	loading = true
	const form = new FormData()
	form.append("theme", theme)
	form.append("header_image", header_image)
	form.append("header_link", header_link)
	form.append("background_image", background_image)
	form.append("footer_image", footer_image)
	form.append("footer_link", footer_link)
	form.append("disable_download_button", disable_download_button)
	form.append("disable_share_button", disable_share_button)
	form.append("disable_menu", disable_menu)

	try {
		const resp = await fetch(
			window.api_endpoint+"/user/file_customization",
			{ method: "PUT", body: form }
		);
		if(resp.status >= 400) {
			let json = await resp.json()
			console.debug(json)
			throw json.message
		}

		success_message.set(true, "Changes saved")
	} catch(err) {
		success_message.set(false, err)
	} finally {
		loading = false
	}
}

onMount(() => {
	// The fields are undefined when they're empty. So we need to check if each
	// field is defined before converting to a string
	if (window.user.file_viewer_branding) {
		let b = window.user.file_viewer_branding
		theme = b.theme ? b.theme : ""
		header_image = b.header_image ? b.header_image : ""
		header_link = b.header_link ? b.header_link : ""
		background_image = b.background_image ? b.background_image : ""
		footer_image = b.footer_image ? b.footer_image : ""
		footer_link = b.footer_link ? b.footer_link : ""
		disable_download_button = b.disable_download_button ? b.disable_download_button : false
		disable_share_button = b.disable_share_button ? b.disable_share_button : false
		disable_menu = b.disable_menu ? b.disable_menu : false
	}
})
</script>

<LoadingIndicator loading={loading}/>

<section>
	<h2><Persistence/>File viewer branding</h2>
	{#if !window.user.subscription.file_viewer_branding}
		<div class="highlight_yellow">
			Sharing settings are not available for your account. Subscribe to
			the Persistence plan or higher to enable these features.
		</div>
	{:else if !window.user.hotlinking_enabled}
		<div class="highlight_yellow">
			To use custom file viewer branding bandwidth sharing needs to be
			enabled. Enable bandwidth sharing on the
			<a href="/user/sharing/bandwidth">bandwidth sharing page</a>.
		</div>
	{/if}
	<SuccessMessage bind:this={success_message}></SuccessMessage>

	<p>
		You can change the appearance of your file viewer pages. The images you
		choose here will be loaded each time someone visits one of your files.
		The data usage will also be subtracted from your account's data cap.
		Keep in mind that large images can take a very long time to load over
		cellular connections. I recommend keeping the header and footer images
		below 100 kB, and the background image below 1 MB. Allowed image types
		are PNG, JPEG, GIF and WebP. If you want to use an animated banner you
		should use APNG or WebP. Avoid using animated GIFs as they are very slow
		to load.
	</p>
	<h3>Theme</h3>
	<p>
		Choose a theme for your download pages. This theme will override the
		theme preference of the person viewing the file. Set to 'None' to let
		the viewer choose their own theme.
	</p>
	<ThemePicker
		theme={theme}
		on:theme_change={e => {theme = e.detail; save()}}>
	</ThemePicker>

	<h3>Header image</h3>
	<p>
		Will be shown above the file. Maximum height is 90px. Will be shrunk if
		larger. You can also add a link to open when the visitor clicks the
		image. The link needs to start with 'https://'.
	</p>
	<button on:click={() => {select_file("header")}}>
		<i class="icon">add_photo_alternate</i>
		Select header image
	</button>
	<button on:click={() => {header_image = ""; save()}}>
		<i class="icon">close</i>
		Remove
	</button>
	<br/>
	Header image link:<br/>
	<form class="form_row" on:submit|preventDefault={save}>
		<input class="grow" bind:value={header_link} type="text" placeholder="https://"/>
		<button class="shrink" action="submit"><i class="icon">save</i> Save</button>
	</form>

	{#if header_image}
		<div class="highlight_shaded">
			<CustomBanner src={"/api/file/"+header_image} link={header_link}></CustomBanner>
		</div>
	{/if}

	<h3>Background image</h3>
	<p>
		This image will be shown behind the file which is being viewed. I
		recommend choosing something dark and not too distracting. Try to keep
		the file below 1 MB to not harm page loading times. Using a JPEG image
		with a quality value of 60 is usually good enough.
	</p>
	<button on:click={() => {select_file("background")}}>
		<i class="icon">add_photo_alternate</i>
		Select background image
	</button>
	<button on:click={() => {background_image = ""; save()}}>
		<i class="icon">close</i>
		Remove
	</button>
	{#if background_image}
		<div class="highlight_shaded">
			<img class="background_preview" src="/api/file/{background_image}" alt="Custom file viewer background"/>
		</div>
	{/if}

	<h3>Footer image</h3>
	<p>
		Will be shown below the file. Maximum height is 90px. Will be shrunk if
		larger.
	</p>
	<button on:click={() => {select_file("footer")}}>
		<i class="icon">add_photo_alternate</i>
		Select footer image
	</button>
	<button on:click={() => {footer_image = ""; save()}}>
		<i class="icon">close</i>
		Remove
	</button>
	<br/>
	Footer image link:<br/>
	<form class="form_row" on:submit|preventDefault={save}>
		<input class="grow" bind:value={footer_link} type="text" placeholder="https://"/>
		<button class="shrink" action="submit"><i class="icon">save</i> Save</button>
	</form>
	{#if footer_image}
		<div class="highlight_shaded">
			<CustomBanner src={"/api/file/"+footer_image} link={footer_link}></CustomBanner>
		</div>
	{/if}

	<h3>Toolbar buttons</h3>
	<p>
		If you don't want to make it obvious that your files can be downloaded
		or shared while still allowing people to view them through the site you
		can use these options.
	</p>
	<p>
		The buttons will be hidden, however your files can still be downloaded
		and shared through the API. The changes are purely cosmetic.
	</p>
	<p>
		For convenience these options only apply when other people view your
		files. The buttons are still available to you. If you want to see the
		effects you can open your file in an incognito window.
	</p>
	Disable download button:
	<button on:click={() => {disable_download_button = !disable_download_button; save()}}>
		{#if disable_download_button}
			<i class="icon">check</i> ON (click to turn off)
		{:else}
			<i class="icon">close</i> OFF (click to turn on)
		{/if}
	</button>
	<br/>
	Disable share button:
	<button on:click={() => {disable_share_button = !disable_share_button; save()}}>
		{#if disable_share_button}
			<i class="icon">check</i> ON (click to turn off)
		{:else}
			<i class="icon">close</i> OFF (click to turn on)
		{/if}
	</button>
	<p>
		You can also choose the hide the menu bar altogether
	</p>
	Disable menu:
	<button on:click={() => {disable_menu = !disable_menu; save()}}>
		{#if disable_menu}
			<i class="icon">check</i> ON (click to turn off)
		{:else}
			<i class="icon">close</i> OFF (click to turn on)
		{/if}
	</button>
</section>

<FilePicker
	bind:this={file_picker}
	on:files={e => {add_file(e.detail)}}
	multi_select={false}
	title="Select image file"
/>

<style>
.background_preview {
	max-height: 200px;
	max-width: 100%;
	display: block;
	margin: auto;
}
.form_row {
	display: inline-flex;
	flex-direction: row;
	width: 100%;
	align-items: center;
}
.grow {
	flex: 1 1 auto;
}
.shrink {
	flex: 0 0 auto;
}
</style>
