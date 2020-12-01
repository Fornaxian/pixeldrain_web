<script>
import { onMount } from "svelte";
import Spinner from "../util/Spinner.svelte";
import { fs_get_buckets } from "../filesystem/FilesystemAPI.svelte";

let loading = true
let buckets = []

const get_buckets = async () => {
	try {
		let resp = await fs_get_buckets()
		buckets = resp.buckets
	} catch (err) {
		alert(err)
	} finally {
		loading = false
	}
}

onMount(get_buckets)

</script>

<div>
	{#if loading}
		<div class="spinner_container"><Spinner></Spinner></div>
	{/if}

	{#each buckets as bucket}
	<a href={"/d/"+bucket.id}>{bucket.name}</a>
	{/each}
</div>
<style>
	.spinner_container {
		display: inline-block;
		height: 100px;
		width: 100px;
	}
</style>
