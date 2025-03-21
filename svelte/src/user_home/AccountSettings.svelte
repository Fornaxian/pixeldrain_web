<script>
import CopyButton from "../layout/CopyButton.svelte";
import Form from "./../util/Form.svelte";

let affiliate_link = window.location.protocol+"//"+window.location.host + "?ref=" + window.user.username

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
			separator: true,
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

		const resp = await fetch(window.api_endpoint+"/user", { method: "PUT", body: form });
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}
		return {success: true, message: "Success! Your changes have been saved"}
	},
}

const affiliate_settings = {
	name: "affiliate_settings",
	fields: [
		{
			name: "affiliate_user_name",
			label: "Affiliate user name",
			type: "text",
			default_value: window.user.affiliate_user_name,
			description: `The affiliate user name can be the name of a
				pixeldrain account you wish to support with your subscription.
				The account will receive a fee of €0.50 for every month that
				your premium plan is active. This does not cost you anything
				extra.`,
		},
	],
	submit_label: `<i class="icon">save</i> Save`,
	on_submit: async fields => {
		const form = new FormData()
		form.append("affiliate_user_name", fields.affiliate_user_name)

		const resp = await fetch(window.api_endpoint+"/user", { method: "PUT", body: form });
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
	<fieldset>
		<legend>Account settings</legend>
		<Form config={account_settings}></Form>
	</fieldset>

	<fieldset>
		<legend>Affiliate settings</legend>
		<Form config={affiliate_settings}></Form>
		<div class="form">
			<p>
				Your own affiliate link is
				<a href="{affiliate_link}">{affiliate_link}</a>
				<CopyButton small_icon text={affiliate_link}/>. Share this link
				with premium pixeldrain users to gain commissions. For a
				detailed description of the affiliate program please check out
				the <a href="/about#toc_12">Q&A page</a>.
			</p>
			<p>
				Note that the link includes the name of your pixeldrain
				account. If you change your account name the link will stop
				working and you might stop receiving commissions.
			</p>
		</div>
	</fieldset>

	<fieldset>
		<legend>Delete account</legend>
		<Form config={delete_account}></Form>
	</fieldset>
</section>
