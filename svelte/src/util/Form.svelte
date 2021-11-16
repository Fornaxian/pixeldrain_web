<script>
import { onMount } from "svelte";
import Spinner from "./Spinner.svelte";


export let config = {
	fields: [
		{
			name: "",
			label: "",
			type: "",
			default_value: "",
			binding: null,
		}
	],
	submit_label: "",
	submit_red: false,
	on_submit: async field_values => {},
}

onMount(() => {
	config.fields.forEach(field => {
		if(field.default_value === undefined) {
			field.default_value = ""
		}
	})
})

let loading = false
let submitted = false
let submit_result = {
	success: false,
	message: "",
	messages: null,
}

let submit = async (event) => {
	loading = true
	event.preventDefault()

	let field_values = {}

	config.fields.forEach(field => {
		if (field.type === "radio") {
			if (field.binding === undefined) {
				field_values[field.name] = ""
			} else {
				field_values[field.name] = field.binding
			}
		} else if (field.type === "description") {
			field_values[field.name] = ""
		} else {
			field_values[field.name] = field.binding.value
		}
	})

	submit_result = await config.on_submit(field_values)
	if (submit_result.error_json) {
		submit_result = handle_errors(submit_result.error_json)
	}
	submitted = true

	loading = false
	return false
}
let field_label = (field) => {
	let label = ""
	config.fields.forEach(val => {
		if (val.name === field) {
			label = val.label
		}
	})
	return label
}
let handle_errors = (response) => {
	console.log(response)
	let result = {success: false, message: "", messages: null}

	if (response.value === "multiple_errors") {
		result.messages = []

		response.errors.forEach(err => {
			if (err.value === "string_out_of_range") {
				result.messages.push(
					`${field_label(err.extra.field)} is too long or too short.
					It should be between ${err.extra.min_len} and
					${err.extra.max_len} characters. Current length:
					${err.extra.len}`
				)
			} else if (err.value === "field_contains_illegal_character") {
				result.messages.push(
					`Character '${err.extra.char}' is not allowed in ${field_label(err.extra.field)}`
				)
			} else if (err.value === "missing_field") {
				result.messages.push(
					`${field_label(err.extra.field)} is required`
				)
			} else {
				result.messages.push(err.message)
			}
		})
	} else {
		result.message = response.message
	}

	return result
}
</script>

<form method="POST" on:submit={submit}>
	{#if loading}
		<div class="spinner_container">
			<Spinner></Spinner>
		</div>
	{/if}
	{#if submitted}
		{#if submit_result.messages}
			<div id="submit_result" class:highlight_green={submit_result.success} class:highlight_red={!submit_result.success}>
				Something went wrong, please correct these errors before continuing:<br/>
				<ul>
					{#each submit_result.messages as message}
						<li>{message}</li>
					{/each}
				</ul>
			</div>
		{:else}
			<div id="submit_result" class:highlight_green={submit_result.success} class:highlight_red={!submit_result.success}>
				{@html submit_result.message}
			</div>
		{/if}
	{/if}


	<table class="form">
		{#each config.fields as field}
			<tr class="form">
				{#if field.type === "text_area"}
					<td colspan="2">
						{field.label}
						<br/>
						<textarea bind:this={field.binding}
							id="input_{field.name}"
							name="{field.name}"
							class="form_input"
							style="width: 100%; height: 10em; resize: vertical;"
						>{field.default_value}</textarea>
					</td>
				{:else if field.type !== "description"}
					<td>{field.label}</td>
					<td>
						{#if field.type === "text"}
							<input bind:this={field.binding}
								id="input_{field.name}"
								name="{field.name}"
								value="{field.default_value}"
								type="text"
								class="form_input"/>
						{:else if field.type === "number"}
							<input bind:this={field.binding}
								id="input_{field.name}"
								name="{field.name}"
								value="{field.default_value}"
								type="number"
								class="form_input"/>
						{:else if field.type === "decimal"}
							<input bind:this={field.binding}
								id="input_{field.name}"
								name="{field.name}"
								value="{field.default_value}"
								type="number"
								step="0.1"
								class="form_input"/>
						{:else if field.type === "username"}
							<input bind:this={field.binding}
								id="input_{field.name}"
								name="{field.name}"
								value="{field.default_value}"
								type="text"
								autocomplete="username"
								class="form_input"/>
						{:else if field.type === "email"}
							<input bind:this={field.binding}
								id="input_{field.name}"
								name="{field.name}"
								value="{field.default_value}"
								type="email"
								autocomplete="email"
								class="form_input"/>
						{:else if field.type === "current_password"}
							<input bind:this={field.binding}
								id="input_{field.name}"
								name="{field.name}"
								value="{field.default_value}"
								type="password"
								autocomplete="current-password"
								class="form_input"/>
						{:else if field.type === "new_password"}
							<input bind:this={field.binding}
								id="input_{field.name}"
								name="{field.name}"
								value="{field.default_value}"
								type="password"
								autocomplete="new-password"
								class="form_input"/>
						{:else if field.type === "captcha"}
							<script src="https://www.google.com/recaptcha/api.js" async defer></script>
							<div class="g-recaptcha" data-theme="dark" data-sitekey="{field.captcha_site_key}"></div>
						{:else if field.type === "radio"}
							{#each field.radio_values as val}
								<input bind:group={field.binding}
									id="input_{field.name}_choice_{val}"
									name="{field.name}"
									value={val}
									type="radio"
									checked={val === field.default_value}/>
								<label for="input_{field.name}_choice_{val}">{val}</label><br/>
							{/each}
						{/if}
					</td>
				{/if}
			</tr>
			{#if field.description}
				<tr class="form">
					<td colspan="2">
						{@html field.description}
					</td>
				</tr>
			{/if}
			{#if field.separator}
				<tr class="form">
					<td colspan="2">
						<hr/>
					</td>
				</tr>
			{/if}
		{/each}

		<!-- Submit button -->
		<tr class="form">
			<td colspan="2" style="text-align: right;">
				{#if config.submit_red}
					<button type="submit" class="button_red" style="float: right;">{@html config.submit_label}</button>
				{:else}
					<button type="submit" class="button_highlight" style="float: right;">{@html config.submit_label}</button>
				{/if}
			</td>
		</tr>
	</table>
</form>

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
