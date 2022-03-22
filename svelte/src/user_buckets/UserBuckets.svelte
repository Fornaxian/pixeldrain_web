<script>
import { onMount } from "svelte";
import UserBucket from "./UserBucket.svelte";
import Spinner from "../util/Spinner.svelte";
import { fs_get_buckets, fs_create_bucket } from "../filesystem/FilesystemAPI.svelte";

let loading = true
let buckets = []

let creating_bucket = false
let new_bucket_name

const get_buckets = async () => {
	loading = true;
	try {
		buckets = await fs_get_buckets();
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};

const create_bucket = async () => {
	if (!new_bucket_name.value) {
		alert("Please enter a name!")
		return
	}

	try {
		let bucket = await fs_create_bucket(new_bucket_name.value)
		console.log(bucket)
	} catch (err) {
		alert("Failed to create bucket! "+err)
	}

	creating_bucket = false
	get_buckets();
}

onMount(get_buckets);
</script>

{#if loading}
	<div class="spinner_container">
		<Spinner />
	</div>
{/if}

<section>
	<div class="toolbar" style="text-align: right;">
		<button
			class:button_highlight={creating_bucket}
			on:click={() => {creating_bucket = !creating_bucket}}
		>
			<i class="icon">create_new_folder</i> New bucket
		</button>
	</div>
	{#if creating_bucket}
		<div class="highlight_shaded">
			<form on:submit|preventDefault={create_bucket}>
				<table class="form">
					<tr>
						<td>
							Name
						</td>
						<td>
							<input type="text" bind:this={new_bucket_name}/>
						</td>
					</tr>
					<tr>
						<td colspan="2">
							<button class="button_highlight" type="submit" style="float: right;">
								<i class="icon">save</i> Save
							</button>
						</td>
					</tr>
				</table>
			</form>
		</div>
	{/if}

	{#each buckets as bucket (bucket.id)}
		<UserBucket bucket={bucket} on:refresh={get_buckets}></UserBucket>
	{/each}
</section>

<style>
.spinner_container {
	position: absolute;
	top: 10px;
	left: 10px;
	height: 100px;
	width: 100px;
}
</style>
