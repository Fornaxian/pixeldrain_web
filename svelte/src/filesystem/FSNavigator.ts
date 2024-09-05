import { fs_get_node, fs_encode_path, fs_split_path, type FSNode, type FSPath, type FSPermissions } from "./FilesystemAPI";
import { type Writable } from "svelte/store"

export class FSNavigator {
	// Parts of the raw API response
	path: Array<FSNode> = []
	base_index: number = 0
	children: Array<FSNode> = []
	permissions: FSPermissions = <FSPermissions>{}

	// base equals path[base_index]. It's updated every time the path updates
	base: FSNode = <FSNode>{}

	// Initialized will be set to true when the first file or directory is loaded
	initialized = false
	shuffle = false

	// Whether navigation events should update the browser history
	history_enabled = true

	constructor(history_enabled = true) {
		this.history_enabled = history_enabled

		// If history logging is enabled we capture the popstate event, which
		// fires when the user uses the back and forward buttons in the browser.
		// Instead of reloading the page we use the navigator to navigate to the
		// new page
		if (history_enabled) {
			window.onpopstate = () => {
				// Get the part of the URL after the fs root and navigate to it
				const path = document.location.pathname.replace("/d/", "")
				this.navigate(decodeURIComponent(path), false)
			}
		}
	}

	// If you set the loading property to a boolean writable store the navigator
	// will use it to publish its loading states
	loading: Writable<boolean> | null = null
	set_loading(b: boolean) {
		if (this.loading !== null) {
			this.loading.set(b)
		}
	}

	// The FSNavigator acts as a svelte store. This allows for DOM reactivity.
	// This works by implementing the store contract:
	// https://svelte.dev/docs/svelte-components#script-4-prefix-stores-with-$-to-access-their-values
	subscribers: Array<(nav: FSNavigator) => void> = []
	subscribe(sub_func: (nav: FSNavigator) => void) {
		// Immediately return the current value
		sub_func(this)

		this.subscribers.push(sub_func)

		// Return the unsubscribe function
		return () => this.subscribers.splice(this.subscribers.indexOf(sub_func), 1)
	}

	async navigate(path: string, push_history: boolean) {
		if (path[0] !== "/") {
			path = "/" + path
		}

		console.debug("Navigating to path", path, push_history)

		try {
			this.set_loading(true)
			const resp = await fs_get_node(path)
			this.open_node(resp, push_history)
		} catch (err) {
			if (err.value && err.value === "path_not_found") {
				if (path !== this.path[0].path && path !== "/" && path !== "") {
					console.debug("Path", path, "was not found, trying to navigate to parent")
					this.navigate(fs_split_path(path).parent, push_history)
				}
			} else if (err.message) {
				console.error(err)
				alert("Error: " + err.message)
			} else {
				console.error(err)
				alert("Error: " + err)
			}
		} finally {
			this.set_loading(false)
		}
	}

	async navigate_up() {
		if (this.path.length > 1) {
			await this.navigate(this.path[this.path.length - 2].path, false)
		}
	}

	async reload() {
		await this.navigate(this.base.path, false)
	}

	open_node(node: FSPath, push_history: boolean) {
		// Update window title and navigation history. If push_history is false
		// we still replace the URL with replaceState. This way the user is not
		// greeted to a 404 page when refreshing after renaming a file
		if (this.history_enabled) {
			window.document.title = node.path[node.base_index].name + " ~ pixeldrain"
			const url = "/d" + fs_encode_path(node.path[node.base_index].path)
			if (push_history) {
				window.history.pushState({}, window.document.title, url)
			} else {
				window.history.replaceState({}, window.document.title, url)
			}
		}

		// If the new node is a child of the previous node we save the parent's
		// children array
		if (node.path.length > 1 && node.path[node.path.length - 2].path === this.base.path) {
			console.debug("Current parent path and new node path match. Saving siblings")

			this.cached_siblings_path = node.path[node.path.length - 1].path
			this.cached_siblings = this.children
		}

		// Sort directory children
		sort_children(node.children)

		// Update shared state
		this.path = node.path
		this.base_index = node.base_index
		this.base = node.path[node.base_index]
		this.children = node.children
		this.permissions = node.permissions
		this.initialized = true

		console.debug("Opened node", node)

		// Signal to our subscribers that the new node is loaded. This triggers
		// the reactivity
		for (let i = 0; i < this.subscribers.length; i++) {
			this.subscribers[i](this)
		}
	}

	// These are used to navigate forward and backward within a directory (using
	// the previous and next buttons on the toolbar). The cached siblings will
	// be used so that we don't need to make an extra request to the parent
	// directory. The siblings_path variable is used to verify that the parent
	// directory is still the same. If it's different the siblings array is not
	// used
	cached_siblings_path = ""
	cached_siblings: Array<FSNode> | null = null

	async get_siblings() {
		// If this node is a filesystem root then there are no siblings
		if (this.path.length < 2) {
			return []
		}

		// Check if we already have siblings cached
		if (
			this.cached_siblings === null ||
			this.cached_siblings_path !== this.path[this.path.length - 2].path
		) {
			console.debug("Cached siblings not available. Fetching new")
			const resp = await fs_get_node(this.path[this.path.length - 2].path)

			// Sort directory children to make sure the order is consistent
			sort_children(resp.children)

			// Save new siblings in navigator state
			this.cached_siblings_path = this.path[this.path.length - 2].path
			this.cached_siblings = resp.children
		}

		return this.cached_siblings
	}

	// Opens a sibling of the currently open file. The offset is relative to the
	// file which is currently open. Give a positive number to move forward and
	// a negative number to move backward
	async open_sibling(offset: number) {
		if (this.path.length <= 1) {
			return
		}

		let siblings: Array<FSNode>
		try {
			this.set_loading(true)
			siblings = await this.get_siblings()
		} catch (err) {
			console.error(err)
			alert(err)
			return
		} finally {
			this.set_loading(false)
		}

		let next_sibling: FSNode | null = null

		if (this.shuffle) {
			// Shuffle is on, pick a random sibling
			for (let i = 0; i < 10; i++) {
				next_sibling = siblings[Math.floor(Math.random() * siblings.length)]

				// If we selected the same sibling we already have open we try
				// again. Else we break the loop
				if (next_sibling.name !== this.base.name) {
					break
				}
			}
		} else {
			// Loop over the parent node's children to find the one which is
			// currently open. Then, if possible, we save the one which comes before
			// or after it
			for (let i = 0; i < siblings.length; i++) {
				if (
					siblings[i].name === this.base.name &&
					i + offset >= 0 && // Prevent underflow
					i + offset < siblings.length // Prevent overflow
				) {
					next_sibling = siblings[i + offset]
					break
				}
			}
		}

		// If we found a sibling we open it
		if (next_sibling !== null) {
			console.debug("Opening sibling", next_sibling.path)
			await this.navigate(next_sibling.path, true)
		} else {
			console.debug("No siblings found")
		}
	}
}

const sort_children = (children: Array<FSNode>) => {
	children.sort((a, b) => {
		// Sort directories before files
		if (a.type !== b.type) {
			return a.type === "dir" ? -1 : 1
		}
		return a.name.localeCompare(b.name, undefined, { numeric: true })
	})
}
