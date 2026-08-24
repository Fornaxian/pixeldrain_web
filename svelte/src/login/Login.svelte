<script lang="ts">
import { createEventDispatcher, onMount } from "svelte";
import Form, { type FormConfig } from "util/Form.svelte"
import { check_response, get_endpoint, get_user } from "lib/PixeldrainAPI";

let dispatch = createEventDispatcher()

// Form state. When the user is recovering a lost password we hide the password
// field, that way only an e-mail address is sent and the API replies with a
// login link
let recover = false
let otp_required = false
let otp_lost = false

// Switching between the login and recovery form re-renders the inputs, so we
// carry the entered username over to the form we're switching to
const toggle_recover = (from: FormConfig, to: FormConfig, value: string) => {
	to.fields[0].default_value = from.fields[0].binding.value
	recover = value === "true"
}

const form_login: FormConfig = {
	fields: [
		{
			name: "username",
			label: "E-mail or username",
			type: "username",
		}, {
			name: "password",
			label: "Password",
			type: "current_password",
		}, {
			name: "recover",
			label: "Recover lost password",
			type: "checkbox",
			on_change: value => toggle_recover(form_login, form_recover, value),
		},
	],
	submit_label: `<i class="icon">send</i> Login`,
	on_submit: async (fields) => {
		username = fields.username
		password = fields.password
		return await login()
	},
}
const form_recover: FormConfig = {
	fields: [
		{
			name: "username",
			label: "E-mail or username",
			type: "username",
		}, {
			name: "recover",
			label: "Recover lost password",
			type: "checkbox",
			default_value: "true",
			on_change: value => toggle_recover(form_recover, form_login, value),
		},
	],
	submit_label: `<i class="icon">send</i> Send login link`,
	on_submit: async (fields) => {
		username = fields.username
		password = ""
		return await login()
	},
}
// The one-time password form. When the user lost their authenticator app they
// can log in with the two factors they do have: a login link combined with
// their password. If they don't have a login link yet we send them one
$: form_otp = {
	fields: [
		...(otp_lost ? [] : [{
			name: "totp",
			label: "One-time password",
			type: "totp",
			description: `Please enter the one-time password from your authenticator app`,
		}]),
		...(otp_lost && link_login_id !== "" ? [{
			name: "password",
			label: "Password",
			type: "current_password",
			description: `You are logging in with a link from your inbox. Enter
				your account password to complete the login`,
		}] : []),
		{
			name: "otp_lost",
			label: "I lost my authenticator app",
			type: "checkbox",
			default_value: otp_lost ? "true" : "",
			description: otp_lost && link_login_id === "" ? `We will send a
				login link to your e-mail address. Open the link and enter your
				account password to log in` : "",
			on_change: value => otp_lost = value === "true",
		},
	],
	submit_label: otp_lost && link_login_id === "" ?
		`<i class="icon">send</i> Send login link` :
		`<i class="icon">send</i> Login`,
	on_submit: async (fields) => {
		if (otp_lost) {
			// Without a password the API sends a login link
			totp = ""
			password = fields.password !== undefined ? fields.password : ""
		} else {
			totp = fields.totp
		}
		return await login()
	},
} as FormConfig

// The currently rendered form
$: form = otp_required ? form_otp : (recover ? form_recover : form_login)

let username = ""
let password = ""
let totp = ""

// Link login
let link_login_user_id = ""
let link_login_id = ""
let login_redirect = ""

// Sends the user to the path they were trying to reach before they ended up on
// the login page, or to their dashboard when there is no such path
const leave_login_page = () => {
	if (login_redirect.startsWith("/")) {
		console.debug("redirecting user to requested path", login_redirect)
		window.location.href = window.location.protocol+"//"+window.location.host+login_redirect
	} else if (window.location.pathname === "/login") {
		window.location.href = "/user"
	}
}

const login = async (e?: SubmitEvent) => {
	if (e !== undefined) {
		e.preventDefault()
	}

	let fd = new FormData()
	fd.set("username", username)

	if (password !== "") {
		fd.set("password", password)
	}
	if (link_login_user_id !== "" && link_login_id !== "") {
		fd.set("link_login_user_id", link_login_user_id)
		fd.set("link_login_id", link_login_id)
	}
	if (totp !== "") {
		fd.set("totp", totp)
	}
	if (login_redirect !== "") {
		fd.set("redirect", login_redirect)
	}

	try {
		const resp = await check_response(await fetch(
			get_endpoint() + "/user/login",
			{
				method: "POST",
				body: fd,
				// The API sets the session cookie in the response. This has to
				// be done by the server because the cookie is HttpOnly, which
				// means JS is not allowed to write it. If we would set the
				// cookie with document.cookie the write would silently fail
				// when a session cookie already exists
				credentials: "same-origin",
			},
		))

		if (resp.value !== undefined && resp.value === "login_link_sent") {
			return {
				success: true,
				message: "A login link was sent to your e-mail address. Click it to continue logging in",
			}
		}


		dispatch("login", {key: resp.auth_key})

		leave_login_page()

		return {success: true, message: "Successfully logged in"}
	} catch (err) {
		if (err.value === "otp_required") {
			otp_required = true
			return
		} else if (err.value === "login_link_already_sent") {
			return {
				success: false,
				message: `A login link was already recently sent to your inbox.
					Please use that one before requesting a new one. You can
					only have one login link at a time. Login links stay active
					for 60 minutes.`
			}
		} else if (err.value === "password_incorrect") {
			return {
				success: false,
				message: `The entered password is not correct for this user. If
					you have an e-mail address configured on your account you
					can try logging in with only your e-mail address to get a
					login link. If you have forgotten your password you can
					change it from the account settings page after logging in.`
			}
		}

		return {success: false, message: undefined, error_json: err}
	}
}

onMount(async () => {
	const params = new URLSearchParams(document.location.search)
	if (params.get("redirect") !== null) {
		login_redirect = params.get("redirect")
	}

	if (params.get("link_login_user_id") !== null && params.get("link_login_id") !== null) {
		link_login_user_id = params.get("link_login_user_id")
		link_login_id = params.get("link_login_id")

		await login()

		// Using the link is what verifies a pending e-mail address, and the API
		// does that before it checks the second factor. So by now the link has
		// done its job and a visitor who was already logged in has nothing left
		// to do here, even if the link turned out to be expired
		if ((await get_user()).username !== "") {
			leave_login_page()
		}
	}
})
</script>

<section>
	<Form config={form}/>

	<p>
		When you recover a lost password we send a login link to your e-mail
		address. Click the link to log in to your account, then set a new
		password in the account settings. If the link did not arrive, please
		check your spam folder. This also works with an address which is not
		verified yet, clicking the link verifies it.
	</p>
</section>
