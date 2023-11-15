<script>
import { createEventDispatcher } from "svelte";
import Sharebar, { generate_share_url } from "./Sharebar.svelte";
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
		edit_window.edit(state.base, true, "share")
		return
	}

	if (navigator.share) {
		await navigator.share({
			title: state.base.name,
			text: "I would like to share '" + state.base.name + "' with you",
			url: share_url
		})
	} else {
		alert("Navigator does not support sharing")
	}
}
</script>

<div class="toolbar">
	<FileStats state={state}/>

	<div class="separator"></div>
	<div class="grid">

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

		{#if state.path[0].id === "me"}
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
		{/if}

		{#if navigator.share}
			<button on:click={share} class="toolbar_button">
				<i class="icon">share</i> Share
			</button>
		{/if}

		<button on:click={() => details_visible = !details_visible} class="toolbar_button" class:button_highlight={details_visible}>
			<i class="icon">help</i> Deta<u>i</u>ls
		</button>

		{#if state.path.length > 1}
			<button on:click={() => edit_window.edit(state.base, true)} class="toolbar_button" class:button_highlight={edit_visible}>
				<i class="icon">edit</i> <u>E</u>dit
			</button>
		{/if}
	</div>
</div>

<style>
.toolbar {
	flex: 0 0 auto;
	overflow-x: hidden;
	overflow-y: scroll;
}
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(8em, 1fr));
}

.separator {
	height: 2px;
	width: 100%;
	margin: 4px 0;
	background-color: var(--separator);
}
.toolbar_button {
	text-align: left;
}

.button_row {
	display: flex;
	flex-direction: row;
}
.button_row > * {
	flex: 1 1 auto;
}
</style>
