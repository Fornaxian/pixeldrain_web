<script>
import { onMount } from "svelte";
import Home from "./Home.svelte";
import AccountSettings from "./AccountSettings.svelte";
import APIKeys from "./APIKeys.svelte";

let page = ""

let navigate = (path, title) => {
	page = path
	window.document.title = title+" ~ pixeldrain"
	window.history.pushState(
		{}, window.document.title, "/user/"+path
	)
}

onMount(() => {
	let newpage = window.location.pathname.substring(window.location.pathname.lastIndexOf("/")+1)
	if (newpage === "user") {
		newpage = ""
	}
	page = newpage
})
</script>

<div>
	<div class="tab_bar">
		<a class="button"
			href="/user"
			class:button_highlight={page === ""}
			on:click|preventDefault={() => {navigate("", "My home")}}>
			<i class="icon">home</i>
			My home
		</a>
		<a class="button"
			href="/user/settings"
			class:button_highlight={page === "settings"}
			on:click|preventDefault={() => {navigate("settings", "Account settings")}}>
			<i class="icon">settings</i>
			Account settings
		</a>
		<a class="button"
			href="/user/api_keys"
			class:button_highlight={page === "api_keys"}
			on:click|preventDefault={() => {navigate("api_keys", "API keys")}}>
			<i class="icon">vpn_key</i>
			API keys
		</a>
	</div>

	{#if page === ""}
	<Home></Home>
	{:else if page === "settings"}
	<AccountSettings></AccountSettings>
	{:else if page === "api_keys"}
	<APIKeys></APIKeys>
	{/if}
</div>

<style>
</style>
