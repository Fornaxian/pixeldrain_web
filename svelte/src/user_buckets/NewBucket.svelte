<script>
import { fs_create_bucket } from "../filesystem/FilesystemAPI.svelte";

let name

const submit = async () => {
	if (!name.value) {
		alert("Please enter a name!")
		return
	}

	try {
		let bucket = await fs_create_bucket(name.value)
		console.log(bucket)
	} catch (err) {
		alert("Failed to create bucket! "+err)
	}
}

</script>

<div class="highlight_light">
	<form on:submit|preventDefault={submit}>
		<table class="form">
			<tr>
				<td>
					Name
				</td>
				<td>
					<input type="text" bind:this={name}/>
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
