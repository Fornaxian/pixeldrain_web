<script lang="ts">
import { onMount } from "svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import { check_response, get_endpoint, get_user } from "lib/PixeldrainAPI";

// An app sends the user here with an OAuth authorization request in the query
// string. The API gets it exactly as it came in, first to check it and then to
// approve it. Everything this page shows and every address it goes to comes
// out of the API's answer, the page itself never reads the request. The API
// and the browser can disagree about a query with the same parameter in it
// twice, and then the user would approve something else than what they see
const endpoint = get_endpoint() + "/user/oauth/authorize" + window.location.search

// What the app can do with each permission it can ask for
const permissions: {[name: string]: string} = {
	file_read: "See your uploaded files and lists",
	file_write: "Upload files, create lists, and change and delete them",
	filesystem_read: "See and download the files in your filesystem",
	filesystem_write: "Upload, change, share and delete files in your filesystem",
	account_read: `See your account details, like your e-mail address and how
		much storage you use`,
	session_read: "See your API keys, except the ones which can do more than its own",
	session_write: "Create API keys",
	billing_read: "See your invoices and transactions",
	billing_write: "Change your subscription and create invoices",
}

let loading = $state(false)
let username = $state("")
let request: {client_name: string, scope: string[], redirect_uri: string} = $state(null)
let errors: string[] = $state([])

const authorize = async (method: string) => {
	loading = true
	try {
		return await check_response(await fetch(endpoint, {method: method}))
	} catch (err) {
		// A request with several things wrong with it comes back as a list
		errors = (err.errors ?? [err]).map((e: any) =>
			(e.message ?? e) + (e.extra?.field ? " (" + e.extra.field + ")" : "")
		)
		request = null
	} finally {
		loading = false
	}
}

const approve = async () => {
	const approved = await authorize("POST")
	if (approved !== undefined) {
		window.location.href = approved.redirect_uri
	}
}

onMount(async () => {
	username = (await get_user()).username
	request = await authorize("GET")
})
</script>

<LoadingIndicator loading={loading}/>

<section>
	{#if errors.length !== 0}
		<h2>This app can't be given access</h2>
		{#each errors as error}
			<p>{error}</p>
		{/each}
	{:else if request}
		<h2>{request.client_name} wants access to your account</h2>
		<p>
			You are logged in as {username}. If you approve,
			{request.client_name} will be able to:
		</p>
		<ul>
			{#each request.scope as name}
				<li>{permissions[name]}</li>
			{/each}
		</ul>
		<p>
			You can take the access away again by deleting the key of the
			app on the <a href="/user/api_keys">API keys page</a>.
		</p>
		<button class="button_highlight" onclick={approve}>
			<i class="icon i_check"></i> Approve
		</button>
		<!-- For a request which was not approved the address has an error
		in it, which tells the app that the user said no -->
		<a class="button" href={request.redirect_uri}>
			<i class="icon i_close"></i> Deny
		</a>
	{/if}
</section>
