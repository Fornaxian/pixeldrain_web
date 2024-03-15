<script>
import { createEventDispatcher } from "svelte";
import { fs_get_node } from "./FilesystemAPI";
import { fs_encode_path, fs_split_path } from "./FilesystemUtil";

let dispatch = createEventDispatcher()

export let history_enabled = true

export let state = {
	// Parts of the raw API response
	path: [],
	base_index: 0,
	children: [],
	permissions: {},

	// The part of the path that base_index points to
	base: {},

	shuffle: false,
}

export const navigate = async (path, push_history) => {
	if (path[0] !== "/") {
		path = "/"+path
	}

	dispatch("loading", true)
	console.debug("Navigating to path", path, push_history)

	try {
		const resp = await fs_get_node(path)
		open_node(resp, push_history)
	} catch (err) {
		if (err.value && err.value === "path_not_found") {
			if (path !== state.path[0].path && path !== "/" && path !== "") {
				console.debug("Path", path, "was not found, trying to navigate to parent")
				navigate(fs_split_path(path).parent, push_history)
			}
		} else if (err.message) {
			console.error(err)
			alert("Error: "+err.message)
		} else {
			console.error(err)
			alert("Error: "+err)
		}
	} finally {
		dispatch("loading", false)
	}
}

export const reload = () => {
	navigate(state.base.path, false)
}

export const open_node = (node, push_history) => {
	// Update window title and navigation history. If push_history is false we
	// still replace the URL with replaceState. This way the user is not greeted
	// to a 404 page when refreshing after renaming a file
	if (history_enabled) {
		window.document.title = node.path[node.base_index].name+" ~ pixeldrain"
		const url = "/d"+ fs_encode_path(node.path[node.base_index].path)
		if (push_history) {
			window.history.pushState({}, window.document.title, url)
		} else {
			window.history.replaceState({}, window.document.title, url)
		}
	}

	// If the new node is a child of the previous node we save the parent's
	// children array
	if (node.path.length > 1 && node.path[node.path.length-2].path === state.base.path) {
		console.debug("Current parent path and new node path match. Saving siblings")

		cached_siblings_path = node.path[node.path.length-1].path
		cached_siblings = state.children
	}

	// Sort directory children
	sort_children(node.children)

	// Update shared state
	state.path = node.path
	state.base = node.path[node.base_index]
	state.base_index = node.base_index
	state.children = node.children
	state.permissions = node.permissions

	console.debug("Opened node", node)

	// Signal to parent that navigation is complete. Normally relying on
	// reactivity is enough, but sometimes that can trigger double updates. By
	// manually triggering an update we can be sure that updates happen exactly
	// when we mean to
	dispatch("navigation_complete")

	// Remove spinner
	dispatch("loading", false)
}

// These are used to navigate forward and backward within a directory (using
// the previous and next buttons on the toolbar). The cached siblings will
// be used so that we don't need to make an extra request to the parent
// directory. The siblings_path variable is used to verify that the parent
// directory is still the same. If it's sifferent the siblings array is not
// used
let cached_siblings_path = ""
let cached_siblings = null

export const get_siblings = async () => {
	// Check if we already have siblings cached
	if (cached_siblings === null || cached_siblings_path !== state.path[state.path.length - 2].path) {
		console.debug("Cached siblings not available. Fetching new")
		const resp = await fs_get_node(state.path[state.path.length - 2].path)

		// Sort directory children to make sure the order is consistent
		sort_children(resp.children)

		// Save new siblings in navigator state
		cached_siblings_path = state.path[state.path.length - 2].path
		cached_siblings = resp.children
	}

	return cached_siblings
}

// Opens a sibling of the currently open file. The offset is relative to the
// file which is currently open. Give a positive number to move forward and a
// negative number to move backward
export const open_sibling = async offset => {
	if (state.path.length <= 1) {
		return
	}

	dispatch("loading", true)

	let siblings
	try {
		siblings = await get_siblings()
	} catch (err) {
		console.error(err)
		alert(err)
		dispatch("loading", false)
		return
	}

	let next_sibling = null

	if (state.shuffle) {
		// Shuffle is on, pick a random sibling
		for (let i = 0; i < 10; i++) {
			next_sibling = siblings[Math.floor(Math.random()*siblings.length)]

			// If we selected the same sibling we already have open we try
			// again. Else we break the loop
			if (next_sibling.name !== state.base.name) {
				break
			}
		}
	} else {
		// Loop over the parent node's children to find the one which is
		// currently open. Then, if possible, we save the one which comes before
		// or after it
		for (let i = 0; i < siblings.length; i++) {
			if (
				siblings[i].name === state.base.name &&
				i+offset >= 0 && // Prevent underflow
				i+offset < siblings.length // Prevent overflow
			) {
				next_sibling = siblings[i+offset]
				break
			}
		}
	}

	// If we found a sibling we open it
	if (next_sibling !== null) {
		console.debug("Opening sibling", next_sibling.path)
		navigate(next_sibling.path, true)
	} else {
		console.debug("No siblings found")
		dispatch("loading", false)
	}
}

const sort_children = children => {
	children.sort((a, b) => {
		// Sort directories before files
		if (a.type !== b.type) {
			return a.type === "dir" ? -1 : 1
		}
		return a.name.localeCompare(b.name, undefined, {numeric: true})
	})
}

// Capture browser back and forward navigation buttons
window.onpopstate = (e) => {
	// Get the part of the URL after the fs root and navigate to it
	const path = document.location.pathname.replace("/d/", "")
	navigate(decodeURIComponent(path), false)
};
</script>
