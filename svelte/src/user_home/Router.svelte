<script>
import { onMount } from "svelte";
import Home from "./Home.svelte";
import AccountSettings from "./AccountSettings.svelte";

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
	<a class="button tab"
		href="/user"
		class:button_highlight={page === ""}
		on:click|preventDefault={() => {navigate("", "My home")}}>
		<i class="icon">home</i>
		My home
	</a>
	<a class="button tab"
		href="/user/settings"
		class:button_highlight={page === "settings"}
		on:click|preventDefault={() => {navigate("settings", "Account settings")}}>
		<i class="icon">settings</i>
		Account settings
	</a>
	<hr/>

	{#if page === ""}
	<Home></Home>
	{:else if page === "settings"}
	<AccountSettings></AccountSettings>
	{/if}
</div>

<style>
</style>
