<script>
import { onMount } from "svelte";
import Euro from "../util/Euro.svelte";
import Form from "./../util/Form.svelte";
import Spinner from "../util/Spinner.svelte";

let loading = true

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
		},
	],
	submit_label: `<i class="icon">send</i> Submit`,
	on_submit: async fields => {
		const form = new FormData()
		form.append("id", fields.user_id)
		form.append("name", fields.user_name)
		form.append("email", fields.user_email)

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

let coupon_form = {
	name: "make_coupon",
	fields: [
		{
			name: "id",
			label: "Code",
			type: "text",
			default_value: "",
		}, {
			name: "credit",
			label: "Credit",
			type: "decimal",
			default_value: 0,
		}, {
			name: "uses",
			label: "Uses",
			type: "number",
			default_value: "",
		},
	],
	submit_label: `<i class="icon">send</i> Create`,
	on_submit: async fields => {
		const form = new FormData()
		form.append("id", fields.id)
		form.append("credit", fields.credit*1e6)
		form.append("uses", fields.uses)

		const resp = await fetch(
			window.api_endpoint+"/coupon",
			{ method: "POST", body: form }
		);
		if(resp.status >= 400) {
			return {error_json: await resp.json()}
		}

		get_coupons()
		return {success: true, message: "Success: Coupon created"}
	},
}

let coupons = []
const get_coupons = async () => {
	loading = true;
	try {
		const resp = await fetch(window.api_endpoint+"/coupon");
		if(resp.status >= 400) {
			throw new Error(resp.text());
		}
		coupons = await resp.json()
		coupons.sort((a, b) => {
			return a.id.localeCompare(b.id)
		});
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};
const delete_coupon = async (id) => {
	if (!confirm("Delete this coupon code?\n\n"+id)) {
		return
	}

	try {
		const resp = await fetch(
			window.api_endpoint+"/coupon/"+encodeURI(id),
			{ method: "DELETE" }
		);
		if(resp.status >= 400) {
			throw new Error(await resp.text());
		}
	} catch (err) {
		alert("Failed to delete ban! "+err)
	}

	get_coupons();
}
onMount(get_coupons)

</script>

<div class="limit_width">
	{#if loading}
		<div class="spinner_container">
			<Spinner />
		</div>
	{/if}
	<h2>Give user credit</h2>
	<p>
		This adds credit to a user's account. You only need to enter one of
		the user id, username or email.
	</p>
	<div class="highlight_dark">
		<Form config={credit_form}></Form>
	</div>

	<h2>Impersonate user</h2>
	<div class="highlight_dark">
		<Form config={impersonate_form}></Form>
	</div>

	<h2>Create coupon codes</h2>
	<div class="highlight_dark">
		<Form config={coupon_form}></Form>
	</div>

	<h3>Active coupon codes</h3>
	<div class="table_scroll">
		<table style="text-align: left;">
			<tr>
				<td>ID</td>
				<td>Uses</td>
				<td>Credit</td>
				<td></td>
			</tr>
			{#each coupons as row (row.id)}
				<tr>
					<td>{row.id}</td>
					<td>{row.uses}</td>
					<td><Euro amount={row.credit}></Euro></td>
					<td>
						<button on:click|preventDefault={() => {delete_coupon(row.id)}} class="button button_red round">
							<i class="icon">delete</i>
						</button>
					</td>
				</tr>
			{/each}
		</table>
	</div>
</div>

<style>
.spinner_container {
	position: absolute;
	top: 10px;
	left: 10px;
	height: 100px;
	width: 100px;
	z-index: 1000;
}
</style>
