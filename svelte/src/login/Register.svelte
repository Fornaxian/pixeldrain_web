<script lang="ts">
import { onMount } from "svelte";
import Form, { type FormConfig } from "util/Form.svelte"
import { get_endpoint, get_misc_captcha } from "lib/PixeldrainAPI";

// The site key is fetched from the API instead of read from the page, so this
// form works on every page it's embedded in. Loading the script is what
// defines window.hcaptcha, so we wait for it before rendering the widget. It's
// rendered explicitly into a container which the form renders as its last
// field, so it ends up right above the submit button
let captcha_site_key = ""
let captcha_widget = null
onMount(async () => {
	try {
		captcha_site_key = (await get_misc_captcha()).hcaptcha_site_key
	} catch (err) {
		console.error("Failed to get the captcha site key", err)
		return
	}
	if (captcha_site_key === "") {
		return // Captcha disabled
	}

	for (let i = 0; window.hcaptcha === undefined && i < 100; i++) {
		await new Promise(resolve => setTimeout(resolve, 100))
	}
	if (window.hcaptcha === undefined) {
		console.error("hCaptcha script did not load")
		return
	}

	captcha_widget = window.hcaptcha.render("captcha_container", {
		sitekey: captcha_site_key,
	})
})

let form: FormConfig = {
	fields: [
		{
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
		}, {
			name: "captcha",
			type: "description",
			description: `<div id="captcha_container"></div>`,
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

		// No username is sent, the server generates one from the e-mail address
		const form = new FormData()
		form.append("email", fields.email)
		form.append("password", fields.password)

		if (captcha_site_key !== "" && captcha_widget === null) {
			return {
				success: false,
				error_json: {
					value: "captcha_unavailable",
					message: "The captcha could not be loaded. Please check " +
						"whether a browser extension is blocking it and reload " +
						"the page",
				},
			}
		}

		if (captcha_widget !== null) {
			const token = window.hcaptcha.getResponse(captcha_widget)
			if (token === "") {
				return {
					success: false,
					error_json: {
						value: "captcha_required",
						message: "Please complete the captcha to prove that you are human",
					},
				}
			}
			form.append("captcha", token)
		}

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
			// Captcha tokens can only be used once
			if (captcha_widget !== null) {
				window.hcaptcha.reset(captcha_widget)
			}
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

<svelte:head>
	{#if captcha_site_key !== ""}
		<script src="https://js.hcaptcha.com/1/api.js?render=explicit" async defer></script>
	{/if}
</svelte:head>

<Form config={form}></Form>
