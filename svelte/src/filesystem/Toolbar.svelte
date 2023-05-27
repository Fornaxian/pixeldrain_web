<script>
import { createEventDispatcher } from "svelte";
import Sharebar, { generate_share_url } from "./Sharebar.svelte";
import { formatDataVolume, formatThousands } from "../util/Formatting.svelte";
import { copy_text } from "../util/Util.svelte";
import FileStats from "./FileStats.svelte";

let dispatch = createEventDispatcher()

export let fs_navigator
export let state = {
	base: {
		type: "",
		path: "",
	},
	children: [],
	shuffle: false
}

export let view = "file"
export let details_visible = false
export let edit_window
export let edit_visible = false

export let visible = true
let sharebar_visible = false
$: {
	if (!visible) {
		sharebar_visible = false
	}
}

// Tallys
$: total_directories = state.children.reduce((acc, cur) => cur.type === "dir" ? acc + 1 : acc, 0)
$: total_files = state.children.reduce((acc, cur) => cur.type === "file" ? acc + 1 : acc, 0)
$: total_file_size = state.children.reduce((acc, cur) => acc + cur.file_size, 0)

$: share_url = generate_share_url(state.path)
let link_copied = false
const copy_link = () => {
	if (share_url === "") {
		edit_window.edit(state.base, "share", true)
		return
	}

	copy_text(share_url)
	link_copied = true
	setTimeout(() => {link_copied = false}, 60000)
}
let share = async () => {
	if (share_url === "") {
		edit_window.edit(state.base, "share", true)
		return
	}

	if (navigator.share) {
		await navigator.share({
			title: state.base.name,
			text: "I would like to share '" + state.base.name + "' with you",
			url: share_url
		})
	} else {
		console.debug("Navigator does not support sharing")
		sharebar_visible = !sharebar_visible
	}
}
</script>

<div class="toolbar" class:toolbar_visible={visible}>
	{#if state.base.type === "file"}
		<FileStats state={state}/>

		<div class="toolbar_label">Size</div>
		<div class="toolbar_statistic">{formatDataVolume(state.base.file_size, 3)}</div>
	{:else if state.base.type === "dir" || state.base.type === "bucket"}
		<div class="toolbar_label">Directories</div>
		<div class="toolbar_statistic">{formatThousands(total_directories, 3)}</div>
		<div class="toolbar_label">Files</div>
		<div class="toolbar_statistic">{formatThousands(total_files, 3)}</div>
		<div class="toolbar_label">Total size</div>
		<div class="toolbar_statistic">{formatDataVolume(total_file_size, 3)}</div>
	{/if}

	<div class="separator"></div>

	<div class="button_row">
		<button on:click={() => {fs_navigator.open_sibling(-1)}}>
			<i class="icon">skip_previous</i>
		</button>
		<button on:click={() => {state.shuffle = !state.shuffle}} class:button_highlight={state.shuffle}>
			<i class="icon">shuffle</i>
		</button>
		<button on:click={() => {fs_navigator.open_sibling(1)}}>
			<i class="icon">skip_next</i>
		</button>
	</div>

	{#if state.root.id === "me"}
		<button on:click={() => dispatch("search")} class="toolbar_button" class:button_highlight={view === "search"}>
			<i class="icon">search</i> Search
		</button>
	{/if}

	{#if state.base.type === "file"}
		<button on:click={() => dispatch("download")} class="toolbar_button">
			<i class="icon">save</i> Download
		</button>
	{/if}

	{#if share_url !== ""}
		<button id="btn_copy" class="toolbar_button" on:click={copy_link} class:button_highlight={link_copied}>
			<i class="icon">content_copy</i> <u>C</u>opy Link
		</button>

		<button on:click={share} class="toolbar_button" class:button_highlight={sharebar_visible}>
			<i class="icon">share</i> Share
		</button>
	{/if}

	<button on:click={() => details_visible = !details_visible} class="toolbar_button" class:button_highlight={details_visible}>
		<i class="icon">help</i> Deta<u>i</u>ls
	</button>

	{#if state.base.path !== "/"}
		<button on:click={() => edit_window.edit(state.base, true)} class="toolbar_button" class:button_highlight={edit_visible}>
			<i class="icon">edit</i> <u>E</u>dit
		</button>
	{/if}
</div>

<Sharebar visible={sharebar_visible} state={state} fs_navigator={fs_navigator} share_url={share_url}/>

<style>
.toolbar {
	position: absolute;
	width: 8em;
	overflow: hidden;
	float: left;
	left: -8em;
	bottom: 0;
	top: 0;
	padding: 0;
	text-align: left;
	transition: left 0.25s;
}
.toolbar_visible { left: 0; }

.toolbar > .separator {
	height: 2px;
	width: 100%;
	margin: 4px 0;
	background-color: var(--separator);
}
.toolbar_button {
	text-align: left;
	width: calc(100% - 6px);
}
.toolbar_label {
	text-align: left;
	padding-left: 10px;
	font-size: 0.8em;
	line-height: 0.7em;
	margin-top: 0.5em;
}
.toolbar_statistic {
	text-align: center;
}

.button_row {
	display: flex;
	flex-direction: row;
}
.button_row > * {
	flex: 1 1 auto;
}
</style>
