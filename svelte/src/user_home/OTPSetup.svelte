<script lang="ts">
import { onMount } from "svelte";
import Button from "../layout/Button.svelte";
import CopyButton from "../layout/CopyButton.svelte";
import ToggleButton from "../layout/ToggleButton.svelte";
import { check_response, get_endpoint, get_user, type User } from "../lib/PixeldrainAPI.mjs";

let user: User = null
let secret = ""
let uri = ""
let qr = ""
let reveal_key = false
const generate_key = async () => {
	try {
		let form = new FormData()
		form.set("action", "generate")
		const resp = await check_response(await fetch(
			get_endpoint() + "/user/totp",
			{method: "POST", body: form},
		))

		secret = resp.secret
		uri = resp.uri
		qr = get_endpoint()+"/misc/qr?text=" +encodeURIComponent(resp.uri)
		console.log(resp)
	} catch (err) {
		alert("Verification failed: "+err.value+"\n"+err.message)
	}
}

let otp = ""
const verify = async (e: SubmitEvent) => {
	e.preventDefault()

	let form = new FormData()
	form.set("action", "verify")
	form.set("otp", otp)
	form.set("secret", secret)

	try {
		await check_response(await fetch(
			get_endpoint() + "/user/totp",
			{method: "POST", body: form},
		))

		user.otp_enabled = true
		alert("Success!")
	} catch (err) {
		if (err.value === "otp_incorrect") {
			alert(
				"The entered one-time password is not valid. It may have "+
				"expired. Please return to your authenticator app and retry."+
				"\n\n"+
				"If it still doesn't work after that then your system clock "+
				"might be incorrect. Please enable time synchronization in "+
				"your operating system."
			)
		} else {
			alert("Verification failed: "+err.value+"\n"+err.message)
		}
	}
}

const disable = async () => {
	let form = new FormData()
	form.set("action", "delete")
	await check_response(await fetch(
		get_endpoint() + "/user/totp",
		{method: "POST", body: form},
	))

	user.otp_enabled = false
}

onMount(async () => {
	user = await get_user()
})
</script>

<div class="form">
	{#if user !== null && user.otp_enabled}
		<p>
			Two-factor authentication is enabled on your account. Your account
			is secure. If you have lost your recovery keys or authenticator
			device, you can disable 2FA with the button below. After disabling
			2FA you can enable it again.
			<br/>
			<Button click={disable} icon="close" label="Disable 2FA"/>
		</p>
	{:else if secret === ""}
		<p>
			You can improve your account security by enabling two-factor
			authentication. When this is enabled you will be asked to enter a
			second password when logging in. This password changes periodically.
		</p>
		<p>
			Get started by generating an OTP key:
			<Button click={generate_key} label="Generate OTP key"/>
		</p>
	{:else}
		<h4>Key created</h4>
		<p>
			Now enter the secret in your Authenticator app. Most password
			managers support one-time passwords. A popular option for Android is
			<a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">Google Authenticator</a>.
		</p>
		<p>
			If your authenticator app has a QR code scanner you can scan the
			code below. If not then you must enter the key manually.
		</p>
		<div class="qr_container">
			<img src="{qr}" alt="OTP QR code" class="qr"/>

			<div class="copy_container">
				<Button click={() => window.location.href = uri} icon="key" label="Open in Authenticator app"/>
				<CopyButton text={secret}>Copy secret key to clipboard</CopyButton>
				<ToggleButton bind:on={reveal_key} icon_on="visibility" icon_off="visibility_off">Reveal secret key</ToggleButton>
				{#if reveal_key}
					<div class="key highlight_border">
						{secret}
					</div>
				{/if}
			</div>
		</div>

		<p>
			Please save the secret key in your password manager or another safe
			place. If you lose your authenticator app then the secret key is the
			only way to gain access to your account.
		</p>
		<p>
			Now enter the generated password to verify that the authenticator
			app is working properly. This step enables two-factor authentication
			on your account.
		</p>
		<form id="otp_verify" on:submit={verify} class="otp_form">
			<input bind:value={otp} type="text" autocomplete="one-time-code" pattern={"[0-9]{6}"} required>
			<Button form="otp_verify" label="Verify OTP"/>
		</form>
	{/if}
</div>

<style>
.qr_container {
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	gap: 8px;
}
@media(max-width: 500px) {
	.qr_container {
		flex-direction: column;
		align-items: center;
	}
}
.qr {
	flex: 1 1 auto;
	max-width: 250px;
}
.copy_container {
	flex: 1 1 auto;
	display: flex;
	flex-direction: column;
}
.key {
	line-break: anywhere;
}
.otp_form {
	display: flex;
	flex-direction: row;
}
.otp_form > input {
	flex: 1 1 auto;
}
</style>
