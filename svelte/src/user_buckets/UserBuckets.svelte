<script>
import { onMount } from "svelte";
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

const expand_bucket = () => {

}

onMount(get_buckets);
</script>

<div>
	{#if loading}
		<div class="spinner_container">
			<Spinner />
		</div>
	{/if}

	<div class="limit_width">
		{#each buckets as bucket}
			<a class="bucket_header" href={'/d/' + bucket.id}>
				<div class="bucket_title">{bucket.name}</div>
				<button class="bucket_expand" on:click|preventDefault={expand_bucket}><i class="icon">expand_more</i></button>
			</a>
			<div class="bucket_details">
				Hello!
			</div>
		{/each}
	</div>
</div>

<style>
.spinner_container {
	display: inline-block;
	height: 100px;
	width: 100px;
}
.bucket_header {
	display: flex;
	flex-direction: row;
	text-decoration: none;
	color: var(--text_color);
	background-color: var(--layer_3_color);
	transition: box-shadow 0.5s;
	box-shadow: 1px 1px var(--layer_2_shadow) 0 var(--shadow_color);
}
.bucket_header:hover {
	box-shadow: 0 0 2px 2px var(--highlight_color), inset 0 0 1px 1px var(--highlight_color);
	color: var(--highlight_color);
	text-decoration: none;
}
.bucket_title {
	flex: 1 1 auto;
	align-self: center;
	padding: 0.4em;
}
.bucket_expand {
	flex: 0 0 auto;
}
.bucket_details {
	display: flex;
	flex-direction: column;
	text-decoration: none;
	color: var(--text_color);
	background-color: var(--layer_3_color);
	transition: box-shadow 0.5s;
}
</style>
