<script>
import { createEventDispatcher } from "svelte";
import { fs_search } from "./FilesystemAPI";
import { fs_thumbnail_url } from "./FilesystemUtil";

export let state
export let fs_navigator

let dispatch = createEventDispatcher()

let error = ""
let search_term = ""
let search_results = []
let searching = false
let last_searched_term = ""
let last_limit = 10

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
	dispatch("loading", true)

	try {
		search_results = await fs_search(state.base.path, search_term, limit)
	} catch (err) {
		try {
			error = JSON.parse(err).value
		} catch {
			alert(err)
			console.error(err)
		}
	}

	searching = false
	dispatch("loading", false)

	// It's possible that the user entered another letter while we were
	// performing the search reqeust. If this happens we run the search function
	// again
	if (last_searched_term !== search_term) {
		console.debug("Search term changed during search. Searching again")
		await search()
	}
}

const keyup = e => {
	if (e.key === "Escape") {
		dispatch("done")
	} else {
		search()
	}
}

// Submitting opens the first result
const submit_search = () => {
	if (search_results.length !== 0) {
		open_result(0)
	}
}

const open_result = index => {
	fs_navigator.navigate(search_results[index], true)
	dispatch("done")
}
</script>

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


<div class="search_bar highlight_shaded center">
	<form class="search_form" on:submit|preventDefault={submit_search}>
		<i class="icon">search</i>
		<!-- svelte-ignore a11y-autofocus -->
		<input
			class="term"
			type="text"
			placeholder="Type to search in {state.base.name}"
			style="width: 100%;"
			bind:value={search_term}
			on:keyup={keyup}
			autofocus
		/>
	</form>
</div>

<div class="directory center">
	<tr>
		<td></td>
		<td>Name</td>
	</tr>
	{#each search_results as result, index}
		<a
			href={state.path_root+result}
			on:click|preventDefault={() => open_result(index)}
			class="node"
		>
			<td>
				<img src={fs_thumbnail_url(result, 32, 32)} class="node_icon" alt="icon"/>
			</td>
			<td class="node_name">
				<!-- Remove the search directory from the result -->
				{result.slice(state.base.path.length+1)}
			</td>
		</a>
	{/each}

	{#if search_results.length === last_limit}
		<div class="node">
			<td></td>
			<td class="node_name">
				<button on:click={() => {search(last_limit + 100)}}>
					<i class="icon">expand_more</i>
					More results
				</button>
			</td>
		</div>
	{/if}
</div>

<style>
.center {
	margin: auto;
	width: 1000px;
	max-width: 100%;
}

.search_bar {
	display: flex;
	flex-direction: column;
	margin-top: 10px;
}
.search_form {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.term {
	flex: 1 1 auto;
}

.directory {
	display: table;
	position: relative;
	overflow: hidden;
	margin: 8px auto 16px auto;
	text-align: left;
	background: var(--body_color);
	border-collapse: collapse;
	border-radius: 8px;
}
.directory > * {
	display: table-row;
}
.directory > * > * {
	display: table-cell;
}
.node {
	display: table-row;
	text-decoration: none;
	color: var(--text-color);
	padding: 6px;
}
.node:not(:last-child) {
	border-bottom: 1px solid var(--separator);
}
.node:hover:not(.node_selected) {
	background: var(--input_background);
	color: var(--input_text);
	text-decoration: none;
}
td {
	padding: 4px;
	vertical-align: middle;
}
.node_icon {
	height: 32px;
	width: 32px;
	vertical-align: middle;
	border-radius: 4px;
}
.node_name {
	width: 100%;
	overflow: hidden;
	line-height: 1.2em;
	word-break: break-all;
}
</style>
