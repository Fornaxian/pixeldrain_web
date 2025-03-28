<script lang="ts">
import TabMenu from "util/TabMenu.svelte";
import Register from "./Register.svelte";
import Login from "./Login.svelte";
import { onMount } from "svelte";
import { get_user } from "lib/PixeldrainAPI";

let pages = [
	{
		path: "/login",
		title: "Login",
		icon: "login",
		component: Login,
	}, {
		path: "/register",
		title: "Register",
		icon: "settings",
		component: Register,
	},
]

onMount(async () => {
	const params = new URLSearchParams(document.location.search)
	const user = await get_user()
	if (
		params.get("link_login_user_id") === null &&
		params.get("link_login_id") === null &&
		user.username !== ""
	) {
		console.debug("User is already logged in, redirecting to user dashboard")
		window.location.href = "/user"
	}
})
</script>

<TabMenu pages={pages} title="Login" />
