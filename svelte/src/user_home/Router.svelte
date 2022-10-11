<script>
import { onMount } from "svelte";
import Home from "./Home.svelte";
import AccountSettings from "./AccountSettings.svelte";
import APIKeys from "./APIKeys.svelte";
import Transactions from "./Transactions.svelte";
import Subscription from "./Subscription.svelte";
import ConnectApp from "./ConnectApp.svelte";
import ActivityLog from "./ActivityLog.svelte";
import SharingSettings from "./SharingSettings.svelte";
import Footer from "../layout/Footer.svelte";

let page = ""

let navigate = (path, title) => {
	page = path
	window.document.title = title+" ~ pixeldrain"
	window.history.pushState(
		{}, window.document.title, "/user/"+path
	)
}

let get_page = () => {
	let newpage = window.location.pathname.substring(window.location.pathname.lastIndexOf("/")+1)
	if (newpage === "user") {
		newpage = "home"
	}

	page = newpage
}

onMount(() => {
	get_page()
})
</script>

<svelte:window on:popstate={get_page} />

<header>
	<h1>Welcome home, {window.user.username}!</h1>

	<div class="tab_bar">
		<a class="button"
			href="/user"
			class:button_highlight={page === "home"}
			on:click|preventDefault={() => {navigate("home", "My home")}}>
			<i class="icon">home</i><br/>
			My home
		</a>
		<a class="button"
			href="/user/settings"
			class:button_highlight={page === "settings"}
			on:click|preventDefault={() => {navigate("settings", "Settings")}}>
			<i class="icon">settings</i><br/>
			Settings
		</a>
		<a class="button"
			href="/user/sharing"
			class:button_highlight={page === "sharing"}
			on:click|preventDefault={() => {navigate("sharing", "Sharing")}}>
			<i class="icon">share</i><br/>
			Sharing
		</a>
		<a class="button"
			href="/user/connect_app"
			class:button_highlight={page === "connect_app"}
			on:click|preventDefault={() => {navigate("connect_app", "Apps")}}>
			<i class="icon">app_registration</i><br/>
			Apps
		</a>
		<a class="button"
			href="/user/api_keys"
			class:button_highlight={page === "api_keys"}
			on:click|preventDefault={() => {navigate("api_keys", "API keys")}}>
			<i class="icon">vpn_key</i><br/>
			Keys
		</a>
		<a class="button"
			href="/user/activity"
			class:button_highlight={page === "activity"}
			on:click|preventDefault={() => {navigate("activity", "Activity log")}}>
			<i class="icon">list</i><br/>
			Activity log
		</a>
		<a class="button"
			href="/user/subscription"
			class:button_highlight={page === "subscription"}
			on:click|preventDefault={() => {navigate("subscription", "Subscription")}}>
			<i class="icon">shopping_cart</i><br/>
			Subscription
		</a>
		{#if window.user.subscription.type !== "patreon"}
			<a class="button"
				href="/user/transactions"
				class:button_highlight={page === "transactions"}
				on:click|preventDefault={() => {navigate("transactions", "Transactions")}}>
				<i class="icon">receipt_long</i><br/>
				Transactions
			</a>
		{/if}
	</div>
</header>
<div id="page_content" class="page_content">
	{#if page === "home"}
		<Home/>
	{:else if page === "settings"}
		<AccountSettings/>
	{:else if page === "sharing"}
		<SharingSettings/>
	{:else if page === "api_keys"}
		<APIKeys/>
	{:else if page === "activity"}
		<ActivityLog/>
	{:else if page === "connect_app"}
		<ConnectApp/>
	{:else if page === "transactions"}
		<Transactions/>
	{:else if page === "subscription"}
		<Subscription/>
	{/if}
</div>
<Footer/>
