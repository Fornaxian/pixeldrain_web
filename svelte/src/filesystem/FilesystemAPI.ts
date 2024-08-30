import { fs_path_url } from './FilesystemUtil'

export type GenericResponse = {
	value: string,
	message: string,
}

export const fs_check_response = async (resp: Response) => {
	let text = await resp.text()
	if (resp.status >= 400) {
		let error: any
		try {
			error = JSON.parse(text) as GenericResponse
		} catch (err) {
			error = text
		}
		throw error
	}
	return JSON.parse(text)
}

export type NodeOptions = {
	mode: number | undefined,
	created: Date | undefined,
	modified: Date | undefined,
	shared: boolean | undefined,

	branding_enabled: boolean | undefined,
	brand_input_color: string | undefined,
	brand_highlight_color: string | undefined,
	brand_danger_color: string | undefined,
	brand_background_color: string | undefined,
	brand_body_color: string | undefined,
	brand_card_color: string | undefined,
	brand_header_image: string | undefined,
	brand_header_link: string | undefined,
	brand_background_image: string | undefined,
}

// mkdir only supports the "mode" option
export const fs_mkdir = async (path: string, opts: NodeOptions) => {
	const form = new FormData()
	form.append("action", "mkdir")

	if (opts && opts.mode) {
		form.append("mode", opts.mode.toFixed(0))
	}

	return await fs_check_response(
		await fetch(fs_path_url(path), { method: "POST", body: form })
	)
}

export const fs_mkdirall = async (path: string, opts: NodeOptions) => {
	const form = new FormData()
	form.append("action", "mkdirall")

	if (opts && opts.mode) {
		form.append("mode", opts.mode.toFixed(0))
	}

	return await fs_check_response(
		await fetch(fs_path_url(path), { method: "POST", body: form })
	)
}

export type FSPath = {
	path: Array<FSNode>,
	base_index: number,
	children: Array<FSNode>,
	permissions: FSPermissions,
}

export type FSNode = {
	type: string,
	path: string,
	name: string,
	created: Date,
	modified: Date,
	mode_string: string,
	mode_octal: string,

	abuse_type: string | undefined,
	abuse_report_time: Date | undefined,

	file_size: number,
	file_type: string,
	sha256_sum: string,

	id: string | undefined,
	read_password: string | undefined,
	write_password: string | undefined,
	properties: {} | undefined,
}

export type FSPermissions = {
	create: boolean,
	read: boolean,
	update: boolean,
	delete: boolean,
}

export const fs_get_node = async (path: string) => {
	return await fs_check_response(
		await fetch(fs_path_url(path) + "?stat")
	) as FSPath
}

// Updates a node's parameters. Available options are:
//  - created, Date object
//  - modified, Date object
//  - mode, file mode formatted as octal string
//  - shared, boolean. If true the node will receive a public ID
//
// Returns the modified filesystem node object
export const fs_update = async (path: string, opts: NodeOptions) => {
	const form = new FormData()
	form.append("action", "update")

	for (let key of Object.keys(opts)) {
		if ((key === "created" || key === "modified") && opts[key] !== undefined) {
			form.append(key, opts[key].toISOString())
		} else {
			form.append(key, opts[key])
		}
	}

	return await fs_check_response(
		await fetch(fs_path_url(path), { method: "POST", body: form })
	) as FSNode
}

export const fs_rename = async (old_path: string, new_path: string) => {
	const form = new FormData()
	form.append("action", "rename")
	form.append("target", new_path)

	return await fs_check_response(
		await fetch(fs_path_url(old_path), { method: "POST", body: form })
	) as FSNode
}

export const fs_delete = async (path: string) => {
	return await fs_check_response(
		await fetch(fs_path_url(path), { method: "DELETE" })
	) as GenericResponse
}
export const fs_delete_all = async (path: string) => {
	return await fs_check_response(
		await fetch(fs_path_url(path) + "?recursive", { method: "DELETE" })
	) as GenericResponse
}

export const fs_search = async (path: string, term: string, limit = 10) => {
	return await fs_check_response(
		await fetch(
			fs_path_url(path) +
			"?search=" + encodeURIComponent(term) +
			"&limit=" + limit
		)
	) as Array<string>
}

export const fs_timeseries = async (path: string, start: Date, end: Date, interval = 60) => {
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

export const fs_import = async (parent_dir_path = "", filelist: Array<string>) => {
	const form = new FormData()
	form.append("action", "import")
	form.append("files", JSON.stringify(filelist))

	return await fs_check_response(
		await fetch(fs_path_url(parent_dir_path), { method: "POST", body: form })
	) as GenericResponse
}
