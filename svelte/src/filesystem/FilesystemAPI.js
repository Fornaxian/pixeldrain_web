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

export const fs_mkdir = async (bucket, path, opts = null) => {
	const form = new FormData()
	form.append("action", "mkdir")

	if (opts && opts.mode) {
		form.append("mode", opts.mode)
	}

	return await fs_check_response(
		await fetch(fs_path_url(bucket, path), { method: "POST", body: form })
	)
}

export const fs_mkdirall = async (bucket, path, opts = null) => {
	const form = new FormData()
	form.append("action", "mkdirall")

	if (opts && opts.mode) {
		form.append("mode", opts.mode)
	}

	return await fs_check_response(
		await fetch(fs_path_url(bucket, path), { method: "POST", body: form })
	)
}

export const fs_get_node = async (bucket, path) => {
	return await fs_check_response(
		await fetch(fs_path_url(bucket, path) + "?stat")
	)
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

	if (opts.created !== undefined) {
		form.append("created", opts.created.toISOString())
	}
	if (opts.modified !== undefined) {
		form.append("modified", opts.modified.toISOString())
	}
	if (opts.mode !== undefined) {
		form.append("mode", opts.mode)
	}
	if (opts.shared !== undefined) {
		form.append("shared", opts.shared)
	}
	if (opts.read_password !== undefined) {
		form.append("read_password", opts.read_password)
	}
	if (opts.write_password !== undefined) {
		form.append("write_password", opts.write_password)
	}

	return await fs_check_response(
		await fetch(fs_path_url(bucket, path), { method: "POST", body: form })
	)
}

export const fs_rename = async (bucket, old_path, new_path) => {
	const form = new FormData()
	form.append("action", "rename")
	form.append("target", new_path)

	return await fs_check_response(
		await fetch(fs_path_url(bucket, old_path), { method: "POST", body: form })
	)
}

export const fs_delete = async (bucket, path) => {
	return await fs_check_response(
		await fetch(fs_path_url(bucket, path), { method: "DELETE" })
	)
}
export const fs_delete_all = async (bucket, path) => {
	return await fs_check_response(
		await fetch(fs_path_url(bucket, path) + "?recursive", { method: "DELETE" })
	)
}

export const fs_search = async (bucket, path, term, limit = 10) => {
	return await fs_check_response(
		await fetch(
			fs_path_url(bucket, path) +
			"?search=" + encodeURIComponent(term) +
			"&limit=" + limit
		)
	)
}

export const fs_timeseries = async (bucket, path, start, end, interval = 60) => {
	return await fs_check_response(
		await fetch(
			fs_path_url(bucket, path) +
			"?timeseries" +
			"&start=" + start.toISOString() +
			"&end=" + end.toISOString() +
			"&interval=" + interval
		)
	)
}
