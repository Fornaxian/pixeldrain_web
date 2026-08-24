<script lang="ts">
import Form, { type FormConfig } from "util/Form.svelte"
import { get_endpoint } from "lib/PixeldrainAPI";

let form: FormConfig = {
	fields: [
		{
			name: "username",
			label: "Username (optional)",
			type: "username",
			description: "Used for logging into your account. If you leave " +
				"this empty we will pick a name based on your e-mail address",
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
				success: false,
				error_json: {
					value: "password_verification_failed",
					message: "Password verification failed. Please enter the same " +
						"password in both password fields"
				},
			}
		}

		const form = new FormData()
		if (fields.username !== "") {
			form.append("username", fields.username)
		}
		form.append("email", fields.email)
		form.append("password", fields.password)

		const resp = await fetch(
			get_endpoint()+"/user/register",
			{
				method: "POST",
				body: form,
				// The API sets the session cookie in the response, so the user
				// is logged in as soon as the account is created
				credentials: "same-origin",
			}
		);
		if(resp.status >= 400) {
			return {success: false, error_json: await resp.json()}
		}

		window.location.href = "/user"

		return {
			success: true,
			message: "Account registration successful. Please check your inbox for an e-mail verification link"
		}
	},
}
</script>

<Form config={form}></Form>
