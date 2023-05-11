const path_url = (bucket, path) => {
	return window.api_endpoint + "/filesystem/" + bucket + encodeURIComponent(path)
}

export const fs_get_file_url = (bucket, path) => {
	return path_url(bucket, path)
}

export const fs_mkdir = async (bucket, path, opts = null) => {
	const form = new FormData()
	form.append("action", "mkdir")

	if (opts && opts.mode) {
		form.append("mode", opts.mode)
	}

	const resp = await fetch(path_url(bucket, path), { method: "POST", body: form });
	if (resp.status >= 400) {
		throw new Error(await resp.text())
	}
}

export const fs_get_node = async (bucket, path) => {
	const resp = await fetch(path_url(bucket, path) + "?stat");
	if (resp.status >= 400) {
		throw new Error(await resp.text())
	}
	return resp.json()
}

// Updates a node's parameters. Available options are:
//  - created, Date object
//  - modified, Date object
//  - mode, file mode formatted as octal string
//  - shared, boolean. If true the node will receive a public ID
//
// Returns the modified filesystem node object
export const fs_update = async (bucket, path, opts) => {
	const form = new FormData()
	form.append("action", "update")

	if (opts.created) {
		form.append("created", opts.created.toISOString())
	}
	if (opts.modified) {
		form.append("modified", opts.modified.toISOString())
	}
	if (opts.mode) {
		form.append("mode", opts.mode)
	}
	if (opts.shared) {
		form.append("shared", opts.shared)
	}

	const resp = await fetch(path_url(bucket, path), { method: "POST", body: form })
	if (resp.status >= 400) {
		throw new Error(await resp.text())
	}
	return resp.json()
}

export const fs_rename = async (bucket, old_path, new_path) => {
	const form = new FormData()
	form.append("action", "rename")
	form.append("target", new_path)

	const resp = await fetch(path_url(bucket, old_path), { method: "POST", body: form })
	if (resp.status >= 400) {
		throw new Error(await resp.text())
	}
}

export const fs_delete = async (bucket, path) => {
	const resp = await fetch(path_url(bucket, path), { method: "DELETE" });
	if (resp.status >= 400) {
		throw new Error(await resp.text())
	}
}
export const fs_delete_all = async (bucket, path) => {
	const resp = await fetch(path_url(bucket, path) + "?recursive", { method: "DELETE" });
	if (resp.status >= 400) {
		throw new Error(await resp.text())
	}
}
