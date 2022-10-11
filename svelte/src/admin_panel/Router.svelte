<script>
import AbuseReporters from "./AbuseReporters.svelte"
import AbuseReports from "./AbuseReports.svelte"
import IpBans from "./IPBans.svelte"
import Home from "./Home.svelte"
import { onMount } from "svelte";
import BlockFiles from "./BlockFiles.svelte";
import Subscriptions from "./Subscriptions.svelte";
import Footer from "../layout/Footer.svelte";

let page = ""

let navigate = (path, title) => {
	page = path
	window.document.title = title+" ~ pixeldrain"
	window.history.pushState(
		{}, window.document.title, "/admin/"+path
	)
}

onMount(() => {
	let newpage = window.location.pathname.substring(window.location.pathname.lastIndexOf("/")+1)
	if (newpage === "admin") {
		newpage = "status"
	}
	page = newpage
})
</script>

<header>
	<h1>Admin Panel</h1>

	<div class="tab_bar">
		<a class="button"
			href="/admin"
			class:button_highlight={page === "status"}
			on:click|preventDefault={() => {navigate("status", "Status")}}>
			<i class="icon">home</i><br/>
			Status
		</a>
		<a class="button"
			href="/admin/block_files"
			class:button_highlight={page === "block_files"}
			on:click|preventDefault={() => {navigate("block_files", "Block files")}}>
			<i class="icon">block</i><br/>
			Block files
		</a>
		<a class="button"
			href="/admin/abuse_reports"
			class:button_highlight={page === "abuse_reports"}
			on:click|preventDefault={() => {navigate("abuse_reports", "Abuse reports")}}>
			<i class="icon">flag</i><br/>
			User reports
		</a>
		<a class="button"
			href="/admin/abuse_reporters"
			class:button_highlight={page === "abuse_reporters"}
			on:click|preventDefault={() => {navigate("abuse_reporters", "Abuse reporters")}}>
			<i class="icon">email</i><br/>
			E-mail reporters
		</a>
		<a class="button"
			href="/admin/ip_bans"
			class:button_highlight={page === "ip_bans"}
			on:click|preventDefault={() => {navigate("ip_bans", "IP bans")}}>
			<i class="icon">remove_circle</i><br/>
			IP bans
		</a>
		<a class="button"
			href="/admin/subscriptions"
			class:button_highlight={page === "subscriptions"}
			on:click|preventDefault={() => {navigate("subscriptions", "Subscriptions")}}>
			<i class="icon">receipt_long</i><br/>
			Subscriptions
		</a>
		<a class="button" href="/admin/globals">
			<i class="icon">edit</i><br/>
			Global settings
		</a>
	</div>
</header>

<div id="page_content" class="page_content">
	{#if page === "status"}
		<Home></Home>
	{:else if page === "block_files"}
		<BlockFiles></BlockFiles>
	{:else if page === "abuse_reports"}
		<AbuseReports></AbuseReports>
	{:else if page === "abuse_reporters"}
		<AbuseReporters></AbuseReporters>
	{:else if page === "ip_bans"}
		<IpBans></IpBans>
	{:else if page === "subscriptions"}
		<Subscriptions></Subscriptions>
	{/if}
</div>
<Footer/>
