<script>
import { onMount } from "svelte";
import FilePicker from "../file_viewer/FilePicker.svelte";
import SuccessMessage from "../util/SuccessMessage.svelte";
import ThemePicker from "../util/ThemePicker.svelte";
import Form from "./../util/Form.svelte";

let password_change = {
	name: "password_change",
	fields: [
		{
			name: "old_password",
			label: "Current password",
			type: "current_password",
		}, {
			name: "new_password",
			label: "New password",
			type: "new_password",
		}, {
			name: "new_password2",
			label: "New password again",
			type: "new_password",
			description: "we need you to repeat your password so you " +
					"won't be locked out of your account if you make a " +
					"typing error"
		},
	],
	submit_label: `<i class="icon">save</i> Save`,
	on_submit: async fields => {
		if (fields.new_password != fields.new_password2) {
			return {success: false, message: "Passwords do not match! Please enter the same password in both fields"}
		}

		const form = new FormData()
		form.append("old_password", fields.old_password)
		form.append("new_password", fields.new_password)

		const resp = await fetch(
			window.api_endpoint+"/user/password",
			{ method: "PUT", body: form }
		);
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}
		return {success: true, message: "Success! Your password has been updated"}
	},
}

let email_change = {
	name: "email_change",
	fields: [
		{
			name: "new_email",
			label: "New e-mail address",
			type: "email",
			default_value: window.user.email,
			description: `we will send an e-mail to the new address to
					verify that it's real. The address will be saved once the
					link in the message is clicked. If the e-mail doesn't arrive
					right away please check your spam box too. Leave the field
					empty to remove your current e-mail address from your
					account`,
		},
	],
	submit_label: `<i class="icon">save</i> Save`,
	on_submit: async fields => {
		const form = new FormData()
		form.append("new_email", fields.new_email)

		const resp = await fetch(
			window.api_endpoint+"/user/email_reset",
			{ method: "PUT", body: form }
		);
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}
		return {success: true, message: "Success! E-mail sent. Click the link in the message to verify your new address"}
	},
}

let name_change = {
	name: "name_change",
	fields: [
		{
			name: "new_username",
			label: "New name",
			type: "username",
			default_value: window.user.username,
			description: `changing your username also changes the name used to
				log in. If you forget your username you can still log in using
				your e-mail address if you have one configured`,
		},
	],
	submit_label: `<i class="icon">save</i> Save`,
	on_submit: async fields => {
		const form = new FormData()
		form.append("new_username", fields.new_username)

		const resp = await fetch(
			window.api_endpoint+"/user/username",
			{ method: "PUT", body: form }
		);
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}
		return {success: true, message: "Success! You are now known as "+fields.new_username}
	},
}


let delete_account = {
	name: "delete_account",
	fields: [
		{
			name: "description",
			label: "Description",
			type: "description",
			description: `When you delete your pixeldrain account you will be
				logged out on all of your devices. Your account will be
				scheduled for deletion in seven days. If you log back in to your
				account during those seven days the deletion will be canceled.
				<br/><br/>
				If you have an active Pro subscription you need to end that
				separately through your Patreon account. Deleting your
				pixeldrain account will not cancel the subscription.`,
		},
	],
	submit_red: true,
	submit_label: `<i class="icon">delete</i> Delete`,
	on_submit: async fields => {
		const resp = await fetch(
			window.api_endpoint+"/user",
			{ method: "DELETE" }
		);
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}
		setTimeout(() => { window.location = "/" }, 6000)
		return {success: true, message: "Success! Your account has been scheduled for deletion in 7 days"}
	},
}
let success_message

let file_picker
let theme = ""
let currently_selecting = "" // header, background or footer
let header_image_id = ""
let background_image_id = ""
let footer_image_id = ""
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
		header_image_id = files[0].id
	} else if (currently_selecting === "background") {
		background_image_id = files[0].id
	} else if (currently_selecting === "footer") {
		footer_image_id = files[0].id
	}
}
let save = async () => {
	const form = new FormData()
	form.append("file_theme", theme)
	form.append("file_header", header_image_id)
	form.append("file_background", background_image_id)
	form.append("file_footer", footer_image_id)

	const resp = await fetch(
		window.api_endpoint+"/user/file_customization",
		{ method: "PUT", body: form }
	);
	if(resp.status >= 400) {
		let json = await resp.json()
		console.debug(json)
		success_message.set(false, json.message)
		return
	}

	success_message.set(true, "Changes saved")
}

onMount(() => {
	theme = window.user.custom_file_theme
	header_image_id = window.user.custom_file_header
	background_image_id = window.user.custom_file_background
	footer_image_id = window.user.custom_file_footer
})

</script>

<section>
	<h2>Account settings</h2>
	<h3>Change password</h3>
	<Form config={password_change}></Form>

	<h3>Change e-mail address</h3>
	<Form config={email_change}></Form>

	<h3>Change name</h3>
	<Form config={name_change}></Form>

	<h3>Delete account</h3>
	<Form config={delete_account}></Form>

	<h2>File viewer branding</h2>
	{#if !window.user.subscription.file_viewer_branding}
		<div class="highlight_red">
			File viewer branding is not available for your account. Subscribe to
			the Persistence plan or higher to enable this feature.
		</div>
	{:else if !window.user.hotlinking_enabled}
		<div class="highlight_red">
			To use the branding feature bandwidth sharing needs to be enabled.
			Without this the custom images will not be able to load. Enable
			bandwidth sharing on the
			<a href="/user/subscription">subscription page</a>.
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
	<ThemePicker on:theme_change={e => theme = e.detail}></ThemePicker>

	<h3>Header image</h3>
	<p>
		Will be shown above the file. Maximum height is 100px. Will be shrunk if
		larger.
	</p>
	<button on:click={() => {select_file("header")}}>
		<i class="icon">add_photo_alternate</i>
		Select header image
	</button>
	<button on:click={() => {header_image_id = ""}}>
		<i class="icon">close</i>
		Remove
	</button>
	{#if header_image_id}
		<div class="highlight_dark">
			<img class="banner_preview" src="/api/file/{header_image_id}" alt="Custom file viewer header"/>
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
	<button on:click={() => {background_image_id = ""}}>
		<i class="icon">close</i>
		Remove
	</button>
	{#if background_image_id}
		<div class="highlight_dark">
			<img class="background_preview" src="/api/file/{background_image_id}" alt="Custom file viewer background"/>
		</div>
	{/if}

	<h3>Footer image</h3>
	<p>
		Will be shown below the file. Maximum height is 100px. Will be shrunk if
		larger.
	</p>
	<button on:click={() => {select_file("footer")}}>
		<i class="icon">add_photo_alternate</i>
		Select footer image
	</button>
	<button on:click={() => {footer_image_id = ""}}>
		<i class="icon">close</i>
		Remove
	</button>
	{#if footer_image_id}
		<div class="highlight_dark">
			<img class="banner_preview" src="/api/file/{footer_image_id}" alt="Custom file viewer footer"/>
		</div>
	{/if}

	<br/>
	<br/>

	<button on:click={save}>
		<i class="icon">save</i> Save
	</button>
</section>

<FilePicker bind:this={file_picker} on:files={e => {add_file(e.detail)}} multi_select={false}></FilePicker>

<style>
.banner_preview {
	max-height: 100px;
	max-width: 100%;
	display: block;
	margin: auto;
}
.background_preview {
	max-height: 200px;
	max-width: 100%;
	display: block;
	margin: auto;
}
</style>
