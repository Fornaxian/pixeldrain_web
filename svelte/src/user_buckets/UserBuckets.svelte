<script>
import { onMount } from "svelte";
import Bucket from "./Bucket.svelte";
import Spinner from "../util/Spinner.svelte";
import { fs_get_buckets } from "../filesystem/FilesystemAPI.svelte";

let loading = true;
let buckets = [];

const get_buckets = async () => {
	try {
		let resp = await fs_get_buckets();
		buckets = resp.buckets;
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};

onMount(get_buckets);
</script>

<div>
	{#if loading}
		<div class="spinner_container">
			<Spinner />
		</div>
	{/if}

	<div class="limit_width">
		<button style="float: right;">
			<i class="icon">create_new_folder</i> New bucket
		</button>
		<br/>
		<h2>Persistent buckets</h2>
		<p>
			These buckets don't expire, but have limited storage space and
			bandwidth. Their limits can be raised by buying a subscription.
		</p>
		{#each buckets as bucket}
			<Bucket bucket={bucket}></Bucket>
		{/each}
		<br/>
		<h2>Temporary buckets</h2>
		<p>

		</p>
	</div>
</div>

<style>
.spinner_container {
	display: inline-block;
	height: 100px;
	width: 100px;
}
</style>
