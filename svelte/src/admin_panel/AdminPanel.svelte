<script>
import AbuseReporters from "./AbuseReporters.svelte"
import AbuseReports from "./AbuseReports.svelte"
import IpBans from "./IPBans.svelte"
import Home from "./Home.svelte"
import { onMount } from "svelte";

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
		newpage = ""
	}
	page = newpage
})
</script>

<div>
	<a class="button"
		href="/admin"
		class:button_highlight={page === ""}
		on:click|preventDefault={() => {navigate("", "Status")}}>
		<i class="icon">home</i>
		Status
	</a>
	<a class="button" href="/admin/abuse">
		<i class="icon">block</i>
		Block files
	</a>
	<a class="button"
		href="/admin/abuse_reports"
		class:button_highlight={page === "abuse_reports"}
		on:click|preventDefault={() => {navigate("abuse_reports", "Abuse reports")}}>
		<i class="icon">flag</i>
		User abuse reports
	</a>
	<a class="button"
		href="/admin/abuse_reporters"
		class:button_highlight={page === "abuse_reporters"}
		on:click|preventDefault={() => {navigate("abuse_reporters", "Abuse reporters")}}>
		<i class="icon">report</i>
		E-mail abuse reporters
	</a>
	<a class="button"
		href="/admin/ip_bans"
		class:button_highlight={page === "ip_bans"}
		on:click|preventDefault={() => {navigate("ip_bans", "IP bans")}}>
		<i class="icon">remove_circle</i>
		IP bans
	</a>
	<a class="button" href="/admin/globals">
		<i class="icon">edit</i>
		Update global settings
	</a>
	<hr/>

	{#if page === ""}
	<Home></Home>
	{:else if page === "abuse_reports"}
	<AbuseReports></AbuseReports>
	{:else if page === "abuse_reporters"}
	<AbuseReporters></AbuseReporters>
	{:else if page === "ip_bans"}
	<IpBans></IpBans>
	{/if}
</div>
