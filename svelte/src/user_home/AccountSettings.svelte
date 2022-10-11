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
			label: "E-mail address",
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
			label: "Name",
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
</script>

<section>
	<br/>
	<div class="highlight_border">
		<h3>Change password</h3>
		<Form config={password_change}></Form>
	</div>
	<br/>

	<div class="highlight_border">
		<h3>Change e-mail address</h3>
		<Form config={email_change}></Form>
	</div>
	<br/>

	<div class="highlight_border">
		<h3>Change name</h3>
		<Form config={name_change}></Form>
	</div>
	<br/>

	<div class="highlight_border">
		<h3>Delete account</h3>
		<Form config={delete_account}></Form>
	</div>
	<br/>
</section>
