<script lang="ts" context="module">
export type FormConfig = {
	fields: FormField[],
	submit_label: string
	submit_red?: boolean,
	on_submit: (values: {[key: string]: string}) => Promise<SubmitResult>,
}
export type FormField = {
	type: string,
	name?: string,
	label?: string,
	default_value?: string,
	description?: string,
	separator?: boolean,
	radio_values?: string[], // Options to choose from when type is "radio"
	pattern?: string, // Used for pattern matching on input fields
	binding?: any
}
export type SubmitResult = {
	success: boolean,
	message?: string,
	messages?: string[],
	error_json?: GenericResponse,
}
</script>
<script lang="ts">
import { onMount } from "svelte";
import Spinner from "./Spinner.svelte";
import type { GenericResponse } from "lib/PixeldrainAPI.mjs";

export let config: FormConfig

onMount(() => {
	config.fields.forEach(field => {
		if(field.default_value === undefined) {
			field.default_value = ""
		}
	})
})

let loading = false
let submitted = false
let submit_result: SubmitResult

const submit = async (event: SubmitEvent) => {
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
	if (submit_result && submit_result.error_json) {
		submit_result = handle_errors(submit_result.error_json)
	}
	submitted = true

	loading = false
	return false
}

const field_label = (field: string) => {
	let label = ""
	config.fields.forEach(val => {
		if (val.name === field) {
			label = val.label
		}
	})
	return label
}

const handle_errors = (response: GenericResponse) => {
	console.log(response)
	let result = {success: false, message: "", messages: null}

	if (response.value === "multiple_errors") {
		result.messages = []

		response.errors.forEach(err => {
			if (err.value === "string_out_of_range") {
				result.messages.push(
					`${field_label(<string>err.extra.field)} is too long or too short.
					It should be between ${err.extra.min_len} and
					${err.extra.max_len} characters. Current length:
					${err.extra.len}`
				)
			} else if (err.value === "field_contains_illegal_character") {
				result.messages.push(
					`Character '${err.extra.char}' is not allowed in ${field_label(<string>err.extra.field)}`
				)
			} else if (err.value === "missing_field") {
				result.messages.push(
					`${field_label(<string>err.extra.field)} is required`
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
	{#if submitted && submit_result !== undefined}
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

	<div class="form">
		{#each config.fields as field}
			{#if field.type !== "description"}
				<label for="input_{field.name}">
					{field.label}
				</label>
				{#if field.type === "text"}
					<input bind:this={field.binding}
						id="input_{field.name}"
						name="{field.name}"
						value="{field.default_value}"
						pattern={field.pattern}
						type="text"
						class="form_input"
					/>
				{:else if field.type === "text_area"}
					<textarea bind:this={field.binding}
						id="input_{field.name}"
						name="{field.name}"
						class="form_input"
						style="width: 100%; height: 10em; resize: vertical;"
					>{field.default_value}</textarea>
				{:else if field.type === "number"}
					<input bind:this={field.binding}
						id="input_{field.name}"
						name="{field.name}"
						value="{field.default_value}"
						pattern={field.pattern}
						type="number"
						class="form_input"
					/>
				{:else if field.type === "decimal"}
					<input bind:this={field.binding}
						id="input_{field.name}"
						name="{field.name}"
						value="{field.default_value}"
						pattern={field.pattern}
						type="number"
						step="0.1"
						class="form_input"
					/>
				{:else if field.type === "datetime-local"}
					<input bind:this={field.binding}
						id="input_{field.name}"
						name="{field.name}"
						value="{field.default_value}"
						pattern={field.pattern}
						type="datetime-local"
						class="form_input"
					/>
				{:else if field.type === "username"}
					<input bind:this={field.binding}
						id="input_{field.name}"
						name="{field.name}"
						value="{field.default_value}"
						pattern={field.pattern}
						type="text"
						autocomplete="username"
						class="form_input"
					/>
				{:else if field.type === "email"}
					<input bind:this={field.binding}
						id="input_{field.name}"
						name="{field.name}"
						value="{field.default_value}"
						pattern={field.pattern}
						type="email"
						autocomplete="email"
						class="form_input"
					/>
				{:else if field.type === "current_password"}
					<input bind:this={field.binding}
						id="input_{field.name}"
						name="{field.name}"
						value="{field.default_value}"
						pattern={field.pattern}
						type="password"
						autocomplete="current-password"
						class="form_input"
					/>
				{:else if field.type === "new_password"}
					<input bind:this={field.binding}
						id="input_{field.name}"
						name="{field.name}"
						value="{field.default_value}"
						pattern={field.pattern}
						type="password"
						autocomplete="new-password"
						class="form_input"
					/>
				{:else if field.type === "totp"}
					<input bind:this={field.binding}
						id="input_{field.name}"
						name="{field.name}"
						value="{field.default_value?field.default_value:""}"
						type="text"
						autocomplete="one-time-code"
						pattern={"[0-9]{6}"}
						class="form_input"
					/>
				{:else if field.type === "radio"}
					<div>
						{#each field.radio_values as val}
							<input bind:group={field.binding}
								id="input_{field.name}_choice_{val}"
								name="{field.name}"
								value={val}
								type="radio"
								checked={val === field.default_value}/>
							<label for="input_{field.name}_choice_{val}">{val}</label><br/>
						{/each}
					</div>
				{/if}
			{/if}
			{#if field.description}
				<div>
					{@html field.description}
				</div>
			{/if}
			{#if field.separator}
				<hr/>
			{/if}
		{/each}

		<!-- Submit button -->
		{#if config.submit_red}
			<button type="submit" class="button_red">{@html config.submit_label}</button>
		{:else}
			<button type="submit" class="button_highlight">{@html config.submit_label}</button>
		{/if}
	</div>

	{#if loading}
		<div class="spinner_container">
			<Spinner></Spinner>
		</div>
	{/if}
</form>

<style>
.spinner_container {
	position: absolute;
	top: 10px;
	right: 10px;
	height: 100px;
	width: 100px;
}
</style>
