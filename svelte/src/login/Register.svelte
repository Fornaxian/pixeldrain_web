<script>
import { createEventDispatcher, onMount } from "svelte";
import Form from "../util/Form.svelte"

let dispatch = createEventDispatcher()

let form = {
	name: "register",
	fields: [
		{
			name: "username",
			label: "Username",
			type: "username",
			description: "Used for logging into your account",
		}, {
			name: "email",
			label: "E-mail address",
			type: "email",
			description: "Your e-mail address is only used for recovering lost passwords and billing notifications",
		}, {
			name: "password",
			label: "Password",
			type: "new_password",
		}, {
			name: "password2",
			label: "Password verification",
			type: "new_password",
			description: "You need to enter your password twice so we " +
				"can verify that no typing errors were made, which would " +
				"prevent you from logging into your new account"
		},
	],
	submit_label: `<i class="icon">send</i> Register`,
	on_submit: async fields => {
		if (fields.password !== fields.password2) {
			return {
				error_json: {
					value: "password_verification_failed",
					message: "Password verification failed. Please enter the same " +
						"password in both password fields"
				},
			}
		}

		const form = new FormData()
		form.append("username", fields.username)
		form.append("email", fields.email)
		form.append("password", fields.password)

		const resp = await fetch(
			window.api_endpoint+"/user/register",
			{ method: "POST", body: form }
		);
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}

		// Register successful, now we will try logging in with the same
		// credentials

		const login_form = new FormData()
		login_form.append("username", fields.username)
		login_form.append("password", fields.password)
		login_form.append("app_name", "website login")

		const login_resp = await fetch(
			window.api_endpoint+"/user/login",
			{ method: "POST", body: form }
		);
		if(login_resp.status >= 400) {
			return {error_json: await login_resp.json()}
		}
		let jresp = await login_resp.json()

		dispatch("login", {key: jresp.auth_key})

		return {success: true, message: "Successfully registered a new account"}
	},
}
</script>

<Form config={form}></Form>
