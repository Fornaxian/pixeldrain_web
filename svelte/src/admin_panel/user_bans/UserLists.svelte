<script>
import { onMount } from "svelte";
import LoadingIndicator from "../../util/LoadingIndicator.svelte";
import { formatDataVolume, formatDate } from "../../util/Formatting.svelte";

export let user_id = ""
let lists = []
let loading = true

onMount(() => reload())

export const reload = async () => {
	try {
		const req = await fetch(
			window.api_endpoint+"/user/lists",
			{
				headers: {
					"Admin-User-Override": user_id,
				}
			}
		);
		if(req.status >= 400) {
			alert(await req.text())
			return
		}

		lists = (await req.json()).lists
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
}
</script>

<LoadingIndicator loading={loading}/>

<div class="table_scroll">
	<table>
		<thead>
			<tr>
				<td></td>
				<td>Name</td>
				<td>Files</td>
				<td>Created</td>
			</tr>
		</thead>
		<tbody>
			{#each lists as list (list.id)}
				<tr>
					<td style="padding: 0; line-height: 1em;">
						<img src="{window.api_endpoint}/list/{list.id}/thumbnail?height=48&width=48" alt="icon" class="thumbnail" />
					</td>
					<td>
						<a href="/l/{list.id}" target="_blank">{list.title}</a>
					</td>
					<td>
						{list.file_count}
					</td>
					<td>
						{formatDate(list.date_created, true, true, true)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
.thumbnail {
	width: 48px;
	height: 48px;
}
</style>
