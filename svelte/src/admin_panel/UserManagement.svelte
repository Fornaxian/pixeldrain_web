<script>
import Form from "../util/Form.svelte";

let credit_form = {
	name: "give_credit",
	fields: [
		{
			name: "user_id",
			label: "User ID",
			type: "text",
			default_value: "",
		}, {
			name: "user_name",
			label: "User name",
			type: "text",
			default_value: "",
		}, {
			name: "user_email",
			label: "User e-mail",
			type: "text",
			default_value: "",
		}, {
			name: "credit",
			label: "Credit",
			type: "decimal",
			default_value: 0,
		},
	],
	submit_label: `<i class="icon">send</i> Submit`,
	on_submit: async fields => {
		const form = new FormData()
		form.append("id", fields.user_id)
		form.append("name", fields.user_name)
		form.append("email", fields.user_email)
		form.append("credit", fields.credit*1e6)

		const resp = await fetch(
			window.api_endpoint+"/admin/give_credit",
			{ method: "POST", body: form }
		);
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}

		return {success: true, message: "Success: Granted user "+fields.credit+" credits"}
	},
}

let impersonate_form = {
	name: "impersonate",
	fields: [
		{
			name: "user_id",
			label: "User ID",
			type: "text",
			default_value: "",
		}, {
			name: "user_name",
			label: "User name",
			type: "text",
			default_value: "",
		}, {
			name: "user_email",
			label: "User e-mail",
			type: "text",
			default_value: "",
		}, {
			name: "patron_id",
			label: "Patreon user ID",
			type: "text",
			default_value: "",
		},
	],
	submit_label: `<i class="icon">send</i> Submit`,
	on_submit: async fields => {
		const form = new FormData()
		form.append("id", fields.user_id)
		form.append("name", fields.user_name)
		form.append("email", fields.user_email)
		form.append("patron_id", fields.patron_id)

		const resp = await fetch(
			window.api_endpoint+"/admin/impersonate",
			{ method: "POST", body: form }
		);
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}

		window.location = "/user"

		return {success: true, message: "Success"}
	},
}
</script>

<section>
	<h2>Impersonate user</h2>
	<div class="highlight_shaded">
		<Form config={impersonate_form}></Form>
	</div>

	<h2>Give user credit</h2>
	<p>
		This adds credit to a user's account. You only need to enter one of
		the user id, username or email.
	</p>
	<div class="highlight_shaded">
		<Form config={credit_form}></Form>
	</div>
</section>
