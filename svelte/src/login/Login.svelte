<script lang="ts">
import { createEventDispatcher, onMount } from "svelte";
import Form, { type FormConfig } from "util/Form.svelte"
import { check_response, get_endpoint } from "lib/PixeldrainAPI";

let dispatch = createEventDispatcher()

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
			description:
				`A password is not required to log in. If your account has an
				e-mail address configured you can just enter that and press
				login.`
		},
	],
	submit_label: `<i class="icon">send</i> Login`,
	on_submit: async (fields) => {
		username = fields.username
		password = fields.password
		return await login()
	},
}
const form_otp: FormConfig = {
	fields: [
		{
			name: "totp",
			label: "One-time password",
			type: "totp",
			description: `Please enter the one-time password from your authenticator app`
		},
	],
	submit_label: `<i class="icon">send</i> Login`,
	on_submit: async (fields) => {
		totp = fields.totp
		return await login()
	},
}

// The currently rendered form
let form: FormConfig = form_login

let username = ""
let password = ""
let totp = ""

// Link login
let link_login_user_id = ""
let link_login_id = ""
let login_redirect = ""
let new_email = ""
const login = async (e?: SubmitEvent) => {
	if (e !== undefined) {
		e.preventDefault()
	}

	let fd = new FormData()
	fd.set("username", username)
	fd.append("app_name", "website login")

	if (password !== "") {
		fd.set("password", password)
	}
	if (link_login_user_id !== "" && link_login_id !== "") {
		fd.set("link_login_user_id", link_login_user_id)
		fd.set("link_login_id", link_login_id)
		if (new_email !== "") {
			fd.set("new_email", new_email)
		}
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
				credentials: "omit", // Dont send existing session cookies
			},
		))

		if (resp.value !== undefined && resp.value === "login_link_sent") {
			return {
				success: true,
				message: "A login link was sent to your e-mail address. Click it to continue logging in",
			}
		}

		// Save the session cookie
		document.cookie = "pd_auth_key="+resp.auth_key+"; Max-Age=31536000;"

		dispatch("login", {key: resp.auth_key})

		if (typeof login_redirect === "string" && login_redirect.startsWith("/")) {
			console.debug("redirecting user to requested path", login_redirect)
			window.location.href = window.location.protocol+"//"+window.location.host+login_redirect
		} else if (window.location.pathname === "/login") {
			window.location.href = "/user"
		}

		return {success: true, message: "Successfully logged in"}
	} catch (err) {
		if (err.value === "otp_required") {
			form = form_otp
			return
		} else if (err.value === "login_link_already_sent") {
			return {
				success: false,
				message: `A login link was already recently sent to your inbox.
					Please use that one before requesting a new one. You can
					only have one login link at a time. Login links stay active
					for 15 minutes.`
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

onMount(() => {
	const params = new URLSearchParams(document.location.search)
	if (params.get("redirect") !== null) {
		login_redirect = params.get("redirect")
	}

	if (params.get("link_login_user_id") !== null && params.get("link_login_id") !== null) {
		link_login_user_id = params.get("link_login_user_id")
		link_login_id = params.get("link_login_id")

		if (params.get("new_email") !== null) {
			new_email = params.get("new_email")
		}

		login()
	}
})
</script>

<section>
	<Form config={form}/>
	<br/>
	<p>
		If you log in with just your e-mail address then a login link will be
		sent to your inbox. Click the link to log in to your account. If the
		link did not arrive, please check your spam folder. Your account needs a
		verified e-mail address for this login method to work.
	</p>
	<p>
		If you have lost your password you can use this method to log in. Please
		configure a new password after logging in.
	</p>
</section>
