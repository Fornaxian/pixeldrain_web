<script>
import { formatDataVolume, formatDate } from "../util/Formatting.svelte";
import Modal from "../util/Modal.svelte";
import { fs_path_url } from "./FilesystemUtil";

export let state
export let visible = false
export const toggle = () => {visible = !visible}
</script>

<Modal bind:visible={visible} title="Details" width="800px">
	<table style="min-width: 100%;">
		<tr><td colspan="2"><h3>Node details</h3></td></tr>
		<tr><td>Name</td><td>{state.base.name}</td></tr>
		<tr><td>Path</td><td>{state.base.path}</td></tr>
		<tr><td>Type</td><td>{state.base.type}</td></tr>
		<tr><td>Date created</td><td>{formatDate(state.base.date_created, true, true, true)}</td></tr>
		<tr><td>Date modified</td><td>{formatDate(state.base.date_modified, true, true, true)}</td></tr>
		<tr><td>Mode</td><td>{state.base.mode_string}</td></tr>
		{#if state.base.id}
			<tr>
				<td>Public ID</td>
				<td><a href="/d/{state.base.id}">{state.base.id}</a></td>
			</tr>
		{/if}
		{#if state.base.type === "file"}
		<tr><td>File type</td><td>{state.base.file_type}</td></tr>
		<tr><td>File size</td><td>{formatDataVolume(state.base.file_size)}</td></tr>
		<tr><td>SHA256 sum</td><td>{state.base.sha256_sum}</td></tr>
		{/if}
		<tr>
			<td>Stat</td>
			<td>
				<a href="{fs_path_url(state.root.id, state.base.path)}?stat">Open stat API</a>
			</td>
		</tr>
		<tr>
			<td>Direct link</td>
			<td>
				<a href="{fs_path_url(state.root.id, state.base.path)}">Open direct link</a>
			</td>
		</tr>

		<tr><td colspan="2"><h3>Bucket details</h3></td></tr>
		<tr><td>ID</td><td>{state.root.id}</td></tr>
		<tr><td>Name</td><td>{state.root.name}</td></tr>
		<tr><td>Date created</td><td>{formatDate(state.root.date_created, true, true, true)}</td></tr>
		<tr><td>Date modified</td><td>{formatDate(state.root.date_modified, true, true, true)}</td></tr>
	</table>
</Modal>
