<script>
import { onMount } from "svelte";
import { FSNavigator } from "filesystem/FSNavigator.ts"
import { fs_encode_path, fs_node_icon } from "filesystem/FilesystemAPI.mjs";
import Button from "layout/Button.svelte";
import CreateDirectory from "filesystem/filemanager/CreateDirectory.svelte";
import FSUploadWidget from "filesystem/upload_widget/FSUploadWidget.svelte";
import { drop_target } from "lib/DropTarget.ts"

const nav = new FSNavigator(false)
let upload_widget
var show_hidden = false
var creating_dir = false

onMount(() => nav.navigate("/me", false))
</script>

<div class="wrapper" use:drop_target={{upload: (files) => upload_widget.upload_files(files)}}>
	<div class="toolbar">
		{#if $nav.permissions.write}
			<Button
				click={() => upload_widget.pick_files()}
				icon="cloud_upload"
				title="Upload files to this directory"
				label="Upload files"
			/>
			<Button
				click={() => {creating_dir = !creating_dir}}
				highlight={creating_dir}
				icon="create_new_folder"
				title="Create folder"
				label="Create folder"
			/>
		{/if}

		<div class="toolbar_spacer"></div>

		<Button
			click={() => {show_hidden = !show_hidden}}
			highlight={show_hidden}
			icon={show_hidden ? "visibility_off" : "visibility"}
			title="Show hidden files and directories"
		/>
		<Button
			click={() => nav.reload()}
			icon="refresh"
			title="Refresh directory listing"
		/>
	</div>

	{#if creating_dir}
		<CreateDirectory nav={nav} />
	{/if}

	<div class="directory">
		{#each $nav.children as child (child.path)}
			<a
				href={"/d"+fs_encode_path(child.path)}
				class="node"
				class:node_selected={child.fm_selected}
				class:hidden={child.name.startsWith(".") && show_hidden === false}
			>
				<img src={fs_node_icon(child, 64, 64)} class="node_icon" alt="icon"/>

				<div class="node_name">
					{child.name}
				</div>

				{#if child.id}
					<a href="/d/{child.id}" class="button action_button">
						<i class="icon" title="This file / directory is shared. Click to open public link">share</i>
					</a>
				{/if}
			</a>
		{/each}
	</div>
</div>

<FSUploadWidget nav={nav} bind:this={upload_widget} />

<style>
.wrapper {
	border-radius: 4px;
}
.toolbar {
	display: flex;
	flex-direction: row;
	width: 100%;
	justify-content: center;
	align-items: center;
}
.toolbar > * { flex: 0 0 auto; }
.toolbar_spacer {
	flex: 1 1 auto;
	text-align: center;
}
.directory {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 6px;
}
.node {
	display: flex;
	flex: 1 1 auto;
	flex-direction: row;
	align-content: center;
	align-items: center;
	justify-content: center;
	text-decoration: none;
	color: var(--body_text-color);
	gap: 2px;
	padding: 2px;
	border-radius: 8px;
	width: 250px;
	max-width: 100%;
	border: 1px solid var(--input_background);
}
.node:hover {
	background: var(--input_hover_background);
	color: var(--input_text);
	text-decoration: none;
}
.node > * {
	flex: 0 0 auto;
}
.node_icon {
	height: 32px;
	width: 32px;
	vertical-align: middle;
	border-radius: 4px;
}
.node_name {
	flex: 1 1 auto;
	display: flex;
	align-items: center;
	word-break: break-all;
	line-height: 1.2em;
}
.action_button {
	margin: 0;
	background: none;
	color: var(--body_text_color);
	box-shadow: none;
}
.hidden {
	display: none;
}
</style>
