<script>
import { fs_delete_bucket } from "../filesystem/FilesystemAPI.svelte";
import { createEventDispatcher } from "svelte";
import Expandable from "../util/Expandable.svelte";
let dispatch = createEventDispatcher()

export let bucket

const save_bucket = () => {
	alert("save")
}
const delete_bucket = async () => {
	if (!confirm(
		"Are you sure you want to delete this bucket? All the files within "+
		"the bucket will be irrevocably deleted. There is no way to recover "+
		"from this! Press OK to proceed"
	)) {
		return
	}

	try {
		await fs_delete_bucket(bucket.id, true)
	} catch (err) {
		alert("Failed to delete bucket! "+err)
	}

	dispatch("refresh");
}

</script>

<Expandable highlight>
	<div slot="header">
		<a href={'/d/' + bucket.id} class="bucket_title">
			<img class="bucket_icon" src="/res/img/mime/folder-remote.png" alt="Bucket icon"/>
			{bucket.name}
		</a>
	</div>
	<div>
		<form on:submit|preventDefault={save_bucket}>
			<table class="form">
				<tr class="form">
					<td>Name</td>
					<td><input type="text" value={bucket.name} /></td>
				</tr>
				<tr class="form">
					<td colspan="2">
						<button class="button_red" on:click|preventDefault={delete_bucket}>
							<i class="icon">delete</i> Delete
						</button>
						<button class="button_highlight" type="submit" style="float: right;">
							<i class="icon">save</i> Save
						</button>
					</td>
				</tr>
			</table>
		</form>
	</div>
</Expandable>

<style>
.bucket_title {
	flex: 1 1 auto;
	align-self: center;
	display: block;
	text-decoration: none;
}
.bucket_icon {
	height: 32px;
	width: 32px;
	margin: 4px;
	vertical-align: middle;
}
</style>
