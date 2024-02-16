<script>
import { createEventDispatcher } from "svelte";
import { generate_share_url } from "./Sharebar.svelte";
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
export const copy_link = () => {
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
		alert("Navigator does not support sharing, use copy link button to copy the link instead")
	}
}

let expanded = false
let expand = e => {
	e.preventDefault()
	e.stopPropagation()
	expanded = !expanded
}
</script>

<div class="toolbar" class:expanded>
	<div class="stats_container" on:click={expand} on:keypress={expand} role="button" tabindex="0">
		<button class="button_expand" on:click={expand}>
			{#if expanded}
				<i class="icon">expand_more</i>
			{:else}
				<i class="icon">expand_less</i>
			{/if}
		</button>
		<FileStats state={state}/>
	</div>

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
			<button on:click={() => dispatch("search")} class:button_highlight={view === "search"}>
				<i class="icon">search</i>
				<span>Search</span>
			</button>
		{/if}

		{#if state.base.type === "file"}
			<button on:click={() => dispatch("download")}>
				<i class="icon">save</i>
				<span>Download</span>
			</button>
		{/if}

		{#if share_url !== ""}
			<button on:click={copy_link} class:button_highlight={link_copied}>
				<i class="icon">content_copy</i>
				<span><u>C</u>opy Link</span>
			</button>
		{/if}

		<button on:click={share}>
			<i class="icon">share</i>
			<span>Share</span>
		</button>

		<button on:click={() => details_visible = !details_visible} class:button_highlight={details_visible}>
			<i class="icon">help</i>
			<span>Deta<u>i</u>ls</span>
		</button>

		{#if state.base.id !== "me" && state.permissions.update === true}
			<button on:click={() => edit_window.edit(state.base, true)} class:button_highlight={edit_visible}>
				<i class="icon">edit</i>
				<span><u>E</u>dit</span>
			</button>
		{/if}
	</div>
</div>

<style>
.toolbar {
	flex: 0 0 auto;
	overflow-x: hidden;
	overflow-y: scroll;
	transition: max-height 0.3s;
}
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(8em, 1fr));
}

.separator {
	height: 2px;
	width: 100%;
	background-color: var(--separator);
}

.button_row {
	display: flex;
	flex-direction: row;
}
.button_row > * {
	flex: 1 1 auto;
	justify-content: center;
}

.stats_container {
	display: flex;
	flex-direction: column;
}
.button_expand {
	display: none;
}
@media (max-width: 600px) {
	.toolbar {
		overflow-y: hidden;
		max-height: 2.5em;
	}
	.toolbar.expanded {
		overflow-y: scroll;
		max-height: 40vh;
	}
	.stats_container {
		flex-direction: row;
	}
	.button_expand {
		display: inline-block;
	}
}

</style>
