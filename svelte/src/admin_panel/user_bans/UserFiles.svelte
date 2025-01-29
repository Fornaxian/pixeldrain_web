<script>
import { onMount } from "svelte";
import LoadingIndicator from "../../util/LoadingIndicator.svelte";
import { formatDataVolume, formatDate } from "../../util/Formatting.svelte";
import SortButton from "../SortButton.svelte";

export let user_id = ""
let files = []
let loading = true

onMount(() => reload())

export const reload = async () => {
	try {
		const req = await fetch(
			window.api_endpoint+"/user/files",
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

		files = (await req.json()).files
		sort("")
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
}

let sort_field = "date_upload"
let asc = false
const sort = (field) => {
	if (field !== "" && field === sort_field) {
		asc = !asc
	}
	if (field === "") {
		field = sort_field
	}
	sort_field = field

	console.log("sorting by", field, "asc", asc)
	files.sort((a, b) => {
		if (typeof (a[field]) === "number") {
			// Sort ints from high to low
			if (asc) {
				return a[field] - b[field]
			} else {
				return b[field] - a[field]
			}
		} else {
			// Sort strings alphabetically
			if (asc) {
				return a[field].localeCompare(b[field])
			} else {
				return b[field].localeCompare(a[field])
			}
		}
	})
	files = files
}
</script>

<LoadingIndicator loading={loading}/>

<div class="table_scroll">
	<table>
		<thead>
			<tr>
				<td></td>
				<td><SortButton field="name" active_field={sort_field} asc={asc} sort_func={sort}>Name</SortButton></td>
				<td><SortButton field="abuse_type" active_field={sort_field} asc={asc} sort_func={sort}>Abuse</SortButton></td>
				<td><SortButton field="size" active_field={sort_field} asc={asc} sort_func={sort}>Size</SortButton></td>
				<td><SortButton field="views" active_field={sort_field} asc={asc} sort_func={sort}>V</SortButton></td>
				<td><SortButton field="downloads" active_field={sort_field} asc={asc} sort_func={sort}>DL</SortButton></td>
				<td><SortButton field="date_upload" active_field={sort_field} asc={asc} sort_func={sort}>Created</SortButton></td>
			</tr>
		</thead>
		<tbody>
			{#each files as file (file.id)}
				<tr>
					<td style="padding: 0; line-height: 1em;">
						<img src="{window.api_endpoint+file.thumbnail_href}?height=48&width=48" alt="icon" class="thumbnail" />
					</td>
					<td>
						<a href="/u/{file.id}" target="_blank">{file.name}</a>
					</td>
					<td>
						{file.abuse_type}
					</td>
					<td>
						{formatDataVolume(file.size, 3)}
					</td>
					<td>
						{file.views}
					</td>
					<td>
						{file.downloads}
					</td>
					<td>
						{formatDate(file.date_upload, true, true)}
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
