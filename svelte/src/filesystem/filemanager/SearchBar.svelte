<script>
import { onMount } from "svelte";
import { fs_search, fs_encode_path, fs_thumbnail_url } from "filesystem/FilesystemAPI.mjs";

export let nav

let search_bar
let error = ""
let search_term = ""
let search_results = []
let selected_result = 0
let searching = false
let last_searched_term = ""
let last_limit = 10

onMount(() => {
	// Clear results when the user moves to a new directory
	return nav.subscribe(nav => {
		if (nav.initialized) {
			clear_search(false)
		}
	})
})

const search = async (limit = 10) => {
	if (search_term.length < 2 || search_term.length > 100) {
		// These are the length limits defined by the API
		search_results = []
		return
	} else if (search_term === last_searched_term && limit === last_limit) {
		// If the term is the same we don't have to search
		return
	} else if (searching) {
		// If a search is already running we also don't search
		return
	}

	console.debug("Searching for", search_term)

	error = ""
	last_searched_term = search_term
	last_limit = limit

	searching = true
	nav.set_loading(true)

	try {
		search_results = await fs_search(nav.base.path, search_term, limit)
	} catch (err) {
		if (err.value) {
			error = err.value
		} else {
			alert(err)
			console.error(err)
		}
	}

	if (search_results.length > 0 && selected_result > search_results.length-1) {
		selected_result = search_results.length-1
	}

	searching = false
	nav.set_loading(false)

	// It's possible that the user entered another letter while we were
	// performing the search reqeust. If this happens we run the search function
	// again
	if (last_searched_term !== search_term) {
		console.debug("Search term changed during search. Searching again")
		await search()
	}
}

const clear_search = (blur) => {
	error = ""
	search_term = ""
	search_results = []
	selected_result = 0
	searching = false
	last_searched_term = ""
	last_limit = 10

	// If blur is true we unfocus the search field. This should only happen when
	// the user presses escape
	if (blur) {
		search_bar.blur()
	}
}

// Cursor navigation events can only be prevented with keydown. But we want to
// use keyup for searching, so we use two listeners here
const input_keydown = e => {
	if (e.key === "Escape" || e.key === "ArrowUp" || e.key === "ArrowDown") {
		e.preventDefault()
	}
}
const input_keyup = e => {
	if (e.key === "Escape") {
		clear_search(true)
	} else if (e.key === "ArrowUp") {
		if (selected_result > 0) {
			selected_result--
		}
	} else if (e.key === "ArrowDown") {
		if (selected_result+1 < search_results.length) {
			selected_result++
		}
	} else {
		search()
	}
}

// Submitting opens the selected result
const submit_search = () => {
	if (search_results.length !== 0) {
		open_result(selected_result)
	}
}

const open_result = index => {
	nav.navigate(search_results[index], true)
	clear_search(false)
}

const window_keydown = (e) => {
	if (e.ctrlKey || e.altKey || e.metaKey) {
		return // prevent custom shortcuts from interfering with system shortcuts
	} else if (document.activeElement.type && document.activeElement.type === "text") {
		return // Prevent shortcuts from interfering with input fields
	}

	if (e.key === "Escape" && search_term !== "") {
		clear_search(true)
		e.preventDefault()
	} else if (e.key === "/" || e.key === "f") {
		e.preventDefault()
		e.stopPropagation()
		search_bar.focus()
		return
	}
}
</script>

<svelte:window on:keydown={window_keydown} />

{#if error === "path_not_found" || error === "node_is_a_directory"}
	<div class="highlight_yellow center">
		Search index not found. The search index is a file called
		'.search_index.gz' in your home directory. If you delete this file then
		search will not work. The file is regenerated 10 minutes after modifying
		a file in your filesystem.
	</div>
{:else if error !== ""}
	<div class="highlight_red center">
		An error ocurred while executing the search request: {error}
	</div>
{/if}

<div class="center">
	<form class="search_form" on:submit|preventDefault={submit_search}>
		<i class="icon">search</i>
		<input
			bind:this={search_bar}
			class="term"
			type="text"
			placeholder="Press / to search in {$nav.base.name}"
			style="width: 100%;"
			bind:value={search_term}
			on:keydown={input_keydown}
			on:keyup={input_keyup}
		/>
		{#if search_term !== ""}
			<!-- Button needs to be of button type in order to not submit the form -->
			<button on:click={clear_search} type="button">
				<i class="icon">close</i>
			</button>
		{/if}
	</form>

	<div class="results">
		{#if search_term !== "" && search_results.length === 0}
			No results found
		{/if}

		{#each search_results as result, index}
			<a
				href={"/d"+fs_encode_path(result)}
				on:click|preventDefault={() => open_result(index)}
				class="node"
				class:node_selected={selected_result === index}
			>
				<img src={fs_thumbnail_url(result, 32, 32)} class="node_icon" alt="icon"/>
				<span class="node_name">
					<!-- Remove the search directory from the result -->
					{result.slice($nav.base.path.length+1)}
				</span>
			</a>
		{/each}

		{#if search_results.length === last_limit}
			<div class="node">
				<div class="node_name" style="text-align: center;">
					<button on:click={() => {search(last_limit + 100)}}>
						<i class="icon">expand_more</i>
						More results
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
.center {
	margin: auto;
	width: 1000px;
	max-width: 100%;
	padding-top: 2px;
	padding-bottom: 2px;
	border-bottom: 1px solid var(--separator);
}

.search_form {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.search_form > * {
	flex: 0 0 auto;
}
.search_form > .term {
	flex: 1 1 auto;
}

.results {
	display: flex;
	flex-direction: column;
	position: relative;
	overflow-x: hidden;
	overflow-y: auto;
	max-height: 80vh;
	text-align: left;
	background: var(--body_color);
	border-radius: 8px;
}
.results > * {
	display: flex;
	flex-direction: row;
}
.node {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 4px;
	text-decoration: none;
	color: var(--text-color);
	padding: 2px;
}
.node_selected {
	background: var(--highlight_background);
	color: var(--highlight_text_color);
}
.node:hover:not(.node_selected) {
	background: var(--input_background);
	color: var(--input_text);
	text-decoration: none;
}
.node_icon {
	flex: 0 0 auto;
	height: 32px;
	width: 32px;
	vertical-align: middle;
	border-radius: 4px;
}
.node_name {
	flex: 1 1 auto;
	width: 100%;
	line-height: 1.2em;
	word-break: break-all;
}
</style>
