<script>
import { createEventDispatcher } from "svelte";
import Form from "./../util/Form.svelte"

let dispatch = createEventDispatcher()

let form = {
	name: "login",
	fields: [
		{
			name: "username",
			label: "Username",
			type: "username",
		}, {
			name: "password",
			label: "Password",
			type: "current_password",
		},
	],
	submit_label: `<i class="icon">send</i> Login`,
	on_submit: async fields => {
		const form = new FormData()
		form.append("username", fields.username)
		form.append("password", fields.password)
		form.append("app_name", "website login")

		const resp = await fetch(
			window.api_endpoint+"/user/login",
			{ method: "POST", body: form }
		);
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}
		let jresp = await resp.json()

		dispatch("login", {key: jresp.auth_key})

		return {success: true, message: "Successfully logged in"}
	},
}
</script>

<Form config={form}></Form>
