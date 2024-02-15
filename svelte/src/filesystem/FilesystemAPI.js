import { fs_path_url } from './FilesystemUtil.js'

export const fs_check_response = async resp => {
	let text = await resp.text()
	if (resp.status >= 400) {
		let error
		try {
			error = JSON.parse(text)
		} catch (err) {
			error = text
		}
		throw error
	}
	return JSON.parse(text)
}

export const fs_mkdir = async (path, opts = null) => {
	const form = new FormData()
	form.append("action", "mkdir")

	if (opts && opts.mode) {
		form.append("mode", opts.mode)
	}

	return await fs_check_response(
		await fetch(fs_path_url(path), { method: "POST", body: form })
	)
}

export const fs_mkdirall = async (path, opts = null) => {
	const form = new FormData()
	form.append("action", "mkdirall")

	if (opts && opts.mode) {
		form.append("mode", opts.mode)
	}

	return await fs_check_response(
		await fetch(fs_path_url(path), { method: "POST", body: form })
	)
}

export const fs_get_node = async path => {
	return await fs_check_response(
		await fetch(fs_path_url(path) + "?stat")
	)
}

// Updates a node's parameters. Available options are:
//  - created, Date object
//  - modified, Date object
//  - mode, file mode formatted as octal string
//  - shared, boolean. If true the node will receive a public ID
//
// Returns the modified filesystem node object
export const fs_update = async (path, opts) => {
	const form = new FormData()
	form.append("action", "update")

	for (let key of Object.keys(opts)) {
		if (key === "created" || key === "modified") {
			form.append(key, opts[key].toISOString())
		} else {
			form.append(key, opts[key])
		}
	}

	return await fs_check_response(
		await fetch(fs_path_url(path), { method: "POST", body: form })
	)
}

export const fs_rename = async (old_path, new_path) => {
	const form = new FormData()
	form.append("action", "rename")
	form.append("target", new_path)

	return await fs_check_response(
		await fetch(fs_path_url(old_path), { method: "POST", body: form })
	)
}

export const fs_delete = async path => {
	return await fs_check_response(
		await fetch(fs_path_url(path), { method: "DELETE" })
	)
}
export const fs_delete_all = async path => {
	return await fs_check_response(
		await fetch(fs_path_url(path) + "?recursive", { method: "DELETE" })
	)
}

export const fs_search = async (path, term, limit = 10) => {
	return await fs_check_response(
		await fetch(
			fs_path_url(path) +
			"?search=" + encodeURIComponent(term) +
			"&limit=" + limit
		)
	)
}

export const fs_timeseries = async (path, start, end, interval = 60) => {
	return await fs_check_response(
		await fetch(
			fs_path_url(path) +
			"?timeseries" +
			"&start=" + start.toISOString() +
			"&end=" + end.toISOString() +
			"&interval=" + interval
		)
	)
}

export const fs_import = async (parent_dir_path = "", filelist = []) => {
	const form = new FormData()
	form.append("action", "import")
	form.append("files", JSON.stringify(filelist))

	return await fs_check_response(
		await fetch(fs_path_url(parent_dir_path), { method: "POST", body: form })
	)
}
