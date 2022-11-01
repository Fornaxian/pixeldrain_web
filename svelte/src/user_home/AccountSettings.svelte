<script>
import Form from "./../util/Form.svelte";

let account_settings = {
	name: "account_settings",
	fields: [
		{
			name: "email",
			label: "E-mail address",
			type: "email",
			default_value: window.user.email,
			description: `We will send an e-mail to the new address to verify
				that it's real. The address will be saved once the link in the
				message is clicked. If the e-mail doesn't arrive right away
				please check your spam box too. Leave the field empty to remove
				your current e-mail address from your account`,
			separator: true
		}, {
			name: "password_old",
			label: "Current password",
			type: "current_password",
			discription: `Enter your password here if you would like to change
				your password.`
		}, {
			name: "password_new1",
			label: "New password",
			type: "new_password",
		}, {
			name: "password_new2",
			label: "New password again",
			type: "new_password",
			description: `We need you to repeat your password so you won't be
				locked out of your account if you make a typing error`,
			separator: true,
		}, {
			name: "username",
			label: "Name",
			type: "username",
			default_value: window.user.username,
			description: `Changing your username also changes the name used to
				log in. If you forget your username you can still log in using
				your e-mail address if you have one configured`,
		},
	],
	submit_label: `<i class="icon">save</i> Save`,
	on_submit: async fields => {
		if (fields.password_new1 != fields.password_new2) {
			return {
				success: false,
				message: "Passwords do not match! Please enter the same password in both fields"
			}
		}

		const form = new FormData()
		form.append("email", fields.email)
		form.append("password_old", fields.password_old)
		form.append("password_new", fields.password_new1)
		form.append("username", fields.username)

		const resp = await fetch(
			window.api_endpoint+"/user",
			{ method: "PUT", body: form }
		);
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}
		return {success: true, message: "Success! Your changes have been saved"}
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
		<h3>Account settings</h3>
		<Form config={account_settings}></Form>
	</div>
	<br/>
	<div class="highlight_border">
		<h3>Delete account</h3>
		<Form config={delete_account}></Form>
	</div>
	<br/>
</section>
