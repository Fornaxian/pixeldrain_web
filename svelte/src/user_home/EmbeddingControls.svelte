<script lang="ts">
import { onMount } from "svelte";
import Persistence from "icons/Persistence.svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import SuccessMessage from "util/SuccessMessage.svelte";
import { get_endpoint, get_user, type User } from "lib/PixeldrainAPI";

let loading = false
let success_message: SuccessMessage

// Embedding settings
let embed_domains: string[] = []

const save_embed = async () => {
	loading = true
	const domain_list = embed_domains.join(" ")

	const form = new FormData()
	form.append("embed_domains", domain_list)

	try {
		const resp = await fetch(
			get_endpoint()+"/user",
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

let new_domain: string = ""
const add = () => {
	console.debug("Adding domain", new_domain)
	embed_domains.push(new_domain)
	embed_domains = embed_domains
	new_domain = ""
	save_embed()
}
const remove = (index: number) => {
	embed_domains.splice(index, 1)
	embed_domains = embed_domains
	save_embed()
}

let user: User
onMount(async () => {
	user = await get_user()
	if (user.file_embed_domains !== "") {
		embed_domains = user.file_embed_domains.split(" ")
	}
})
</script>

<LoadingIndicator loading={loading}/>

<section>
	<h2><Persistence/>Embedding controls</h2>
	<SuccessMessage bind:this={success_message}></SuccessMessage>
	{#if user !== undefined && !user.subscription.file_viewer_branding}
		<div class="highlight_yellow">
			Sharing settings are not available for your account. Subscribe to
			the Persistence plan or higher to enable these features.
		</div>
	{:else if user !== undefined && !user.hotlinking_enabled}
		<div class="highlight_yellow">
			To use embedding restrictions hotlinking needs to be enabled.
			Enable hotlinking on the
			<a href="/user/sharing/bandwidth">sharing settings page</a>.
		</div>
	{/if}
	<p>
		Here you can control which websites are allowed to embed your files in
		their web pages. If a website that is not on this list tries to embed
		one of your files the request will be blocked. This applies to both
		hotlink and iframe embeds. If the list is empty, all domains are allowed
		to embed your files.
	</p>
	<div class="highlight_border">
		<form on:submit|preventDefault={() => add()}>
			<div class="form_row">
				<span>Add domain name</span>
				<input class="grow" bind:value={new_domain} type="text"/>
				<button class="shrink" type="submit"><i class="icon">add</i> Add</button>
			</div>
		</form>
		<hr/>
		{#if embed_domains.length === 0}
			<span>
				No domains specified. All websites are allowed to embed your files
			</span>
		{/if}
		{#each embed_domains as domain, index}
			<div class="form_row">
				<button class="shrink" type="button" on:click={() => remove(index)}>
					<i class="icon">delete</i>
				</button>
				<div>{domain}</div>
			</div>
		{/each}
	</div>
</section>

<style>
.highlight_border {
	text-align: initial;
}
.form_row {
	display: inline-flex;
	flex-direction: row;
	width: 100%;
	align-items: center;
	gap: 0.5em;
}
.grow {
	flex: 1 1 auto;
}
.shrink {
	flex: 0 0 auto;
}
</style>
