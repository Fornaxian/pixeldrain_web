<script>
import { fs_get_node } from "./FilesystemAPI";
import { fs_split_path } from "./FilesystemUtil";

export let state = {
	// Parts of the raw API response
	path: [],
	base_index: 0,
	children: [],
	permissions: {},

	// The part of the path that base_index points to
	base: {},

	// First node in the path
	root: {},

	// Passwords for accessing this bucket. Passwords are not always required
	// but sometimes they are
	read_password: "",
	write_password: "",

	// These are used to navigate forward and backward within a directory (using
	// the previous and next buttons on the toolbar). The cached siblings will
	// be used so that we don't need to make an extra request to the parent
	// directory. The siblings_path variable is used to verify that the parent
	// directory is still the same. If it's sifferent the siblings array is not
	// used
	siblings_path: "",
	siblings: null,

	// Root path of the bucket. Used for navigation by prepending it to a file
	// path
	path_root: "",
	loading: false,
	viewer_type: "",
	shuffle: false,
}

export const navigate = async (path, push_history) => {
	state.loading = true
	console.debug("Navigating to path", path, push_history)

	try {
		let resp = await fs_get_node(state.root.id, path)
		open_node(resp, push_history)
	} catch (err) {
		let errj = JSON.parse(err)

		if (errj.value === "path_not_found") {
			if (path !== "/" && path !== "") {
				console.debug("Path", path, "was not found, trying to navigate to parent")
				navigate(fs_split_path(path).parent, push_history)
			}
		} else {
			console.error(err)
			alert("Error: "+err)
		}
	} finally {
		state.loading = false
	}
}

export const open_node = (node, push_history) => {
	// We need to properly URL encode the file paths so they don't cause
	// issues.. but we also want the slashes to stay clean. So here we encode
	// the whole path, then decode the slashes
	let cleanup_func = p => p.path_uri = encodeURIComponent(p.path).replaceAll("%2F", "/")
	node.path.forEach(cleanup_func)
	node.children.forEach(cleanup_func)

	// Update window title and navigation history
	window.document.title = node.path[node.base_index].name+" ~ pixeldrain"
	if (push_history) {
		window.history.pushState(
			{}, window.document.title,
			"/d/"+node.path[0].id+node.path[node.base_index].path,
		)
	}

	// If the new node is a child of the previous node we save the parent's
	// children array
	if (node.path.length > 0 && node.path[node.path.length-1].path === state.base.path) {
		console.debug("Current parent path and new node path match. Saving siblings")

		state.siblings_path = node.path[node.path.length-1].path
		state.siblings = state.children
	}

	// Sort directory children
	sort_children(node.children)

	// Update shared state
	state.path = node.path
	state.base = node.path[node.base_index]
	state.base_index = node.base_index
	state.root = node.path[0]
	state.children = node.children
	state.permissions = node.permissions

	// Update the viewer area with the right viewer type
	if (state.base.type === "bucket" || state.base.type === "dir") {
		state.viewer_type = "dir"
	} else if (state.base.file_type.startsWith("image")) {
		state.viewer_type = "image"
	} else if (
		state.base.file_type.startsWith("audio") ||
		state.base.file_type === "application/ogg" ||
		state.base.name.endsWith(".mp3")
	) {
		state.viewer_type = "audio"
	} else if (
		state.base.file_type.startsWith("video") ||
		state.base.file_type === "application/matroska" ||
		state.base.file_type === "application/x-matroska"
	) {
		state.viewer_type = "video"
	} else if (
		state.base.file_type === "application/pdf" ||
		state.base.file_type === "application/x-pdf"
	) {
		state.viewer_type = "pdf"
	} else {
		state.viewer_type = ""
	}

	console.debug("Opened node", node)

	// Remove spinner
	state.loading = false
}

// Opens a sibling of the currently open file. The offset is relative to the
// file which is currently open. Give a positive number to move forward and a
// negative number to move backward
export const open_sibling = async offset => {
	if (state.path.length <= 1) {
		return
	}

	state.loading = true

	// Check if we already have siblings cached
	if (state.siblings != null && state.siblings_path == state.path[state.path.length - 2].path) {
		console.debug("Using cached siblings")
	} else {
		console.debug("Cached siblings not available. Fetching new")
		try {
			let resp = await fs_get_node(state.root.id, state.path[state.path.length - 2].path)

			// Sort directory children to make sure the order is consistent
			sort_children(resp.children)

			// Save new siblings in global state
			state.siblings_path = state.path[state.path.length - 2].path
			state.siblings = resp.children
		} catch (err) {
			console.error(err)
			alert(err)
			state.loading = false
			return
		}
	}

	let next_sibling = null

	if (state.shuffle) {
		// Shuffle is on, pick a random sibling
		for (let i = 0; i < 10; i++) {
			next_sibling = state.siblings[Math.floor(Math.random()*state.siblings.length)]

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
		for (let i = 0; i < state.siblings.length; i++) {
			if (
				state.siblings[i].name === state.base.name &&
				i+offset >= 0 && // Prevent underflow
				i+offset < state.siblings.length // Prevent overflow
			) {
				next_sibling = state.siblings[i+offset]
				break
			}
		}
	}

	// If we found a sibling we open it
	if (next_sibling !== null) {
		console.debug("Opening sibling", next_sibling)
		navigate(next_sibling.path, true)
	} else {
		console.debug("No siblings found")
		state.loading = false
	}
}

const sort_children = children => {
	children.sort((a, b) => {
		// Sort directories before files
		if (a.type !== b.type) {
			return a.type === "dir" ? -1 : 1
		}
		return a.name.localeCompare(b.name)
	})
}

// Capture browser back and forward navigation buttons
window.onpopstate = (e) => {
	// Get the part of the URL after the bucket ID and navigate to it
	let path = document.location.pathname.replace("/d/"+state.root.id, "")
	navigate(decodeURIComponent(path), false)
};
</script>
