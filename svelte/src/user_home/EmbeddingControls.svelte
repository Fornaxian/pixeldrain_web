<script>
import { onMount } from "svelte";
import Persistence from "icons/Persistence.svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import SuccessMessage from "util/SuccessMessage.svelte";

let loading = false
let success_message

// Embedding settings
let embed_domains = ""

const save_embed = async () => {
	loading = true
	const form = new FormData()
	form.append("embed_domains", embed_domains)

	try {
		const resp = await fetch(
			window.api_endpoint+"/user",
			{ method: "PUT", body: form }
		);
		if(resp.status >= 400) {
			let json = await resp.json()
			console.debug(json)
			throw json.message
		}

		success_message.set(true, "Changes saved")
	} catch(err) {
		success_message.set(false, err)
	} finally {
		loading = false
	}
}

onMount(() => {
	embed_domains = window.user.file_embed_domains
})
</script>

<LoadingIndicator loading={loading}/>

<section>
	<h2><Persistence/>Embedding controls</h2>
	<SuccessMessage bind:this={success_message}></SuccessMessage>
	{#if !window.user.subscription.file_viewer_branding}
		<div class="highlight_yellow">
			Sharing settings are not available for your account. Subscribe to
			the Persistence plan or higher to enable these features.
		</div>
	{:else if !window.user.hotlinking_enabled}
		<div class="highlight_yellow">
			To use embedding restrictions hotlinking needs to be enabled.
			Enable hotlinking on the
			<a href="/user/sharing/bandwidth">sharing settings page</a>.
		</div>
	{/if}
	<p>
		Here you can control which websites are allowed to embed your files in
		their web pages. If a website that is not on this list tries to embed
		one of your files the request will be blocked.
	</p>
	<p>
		The list should be formatted as a list of domain names separated by a
		space. Like this: 'pixeldrain.com google.com twitter.com'
	</p>
	Domain names:<br/>
	<form class="form_row" on:submit|preventDefault={save_embed}>
		<input class="grow" bind:value={embed_domains} type="text"/>
		<button class="shrink" action="submit"><i class="icon">save</i> Save</button>
	</form>
</section>

<style>
.form_row {
	display: inline-flex;
	flex-direction: row;
	width: 100%;
	align-items: center;
}
.grow {
	flex: 1 1 auto;
}
.shrink {
	flex: 0 0 auto;
}
</style>
