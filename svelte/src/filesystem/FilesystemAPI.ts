// Response types
// ==============

export type GenericResponse = {
	value: string,
	message: string,
}

export type FSPath = {
	path: Array<FSNode>,
	base_index: number,
	children: Array<FSNode>,
	permissions: FSPermissions,
	context: FSContext,
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

export type FSContext = {
	premium_transfer: boolean,
}

// API parameters
// ==============

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

// API methods
// ===========

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

// Utility functions
// =================

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

export const fs_path_url = (path: string) => {
	if (!path || path.length === 0) {
		return ""
	}
	if (path[0] !== "/") {
		path = "/" + path
	}

	if (window["api_endpoint"] !== undefined) {
		return window["api_endpoint"] + "/filesystem" + fs_encode_path(path)
	} else {
		throw Error("api_endpoint is undefined")
	}
}

export const fs_encode_path = (path: string) => {
	// Encode all path elements separately to preserve forward slashes
	let split = path.split("/")
	for (let i = 0; i < split.length; i++) {
		split[i] = encodeURIComponent(split[i])
	}
	return split.join("/")
}

export const fs_split_path = (path: string) => {
	let patharr = path.split("/")
	return { base: patharr.pop(), parent: patharr.join("/") }
}

export const fs_thumbnail_url = (path: string, width = 64, height = 64) => {
	return fs_path_url(path) + "?thumbnail&width=" + width + "&height=" + height
}

export const fs_node_type = (node: FSNode) => {
	if (node.type === "dir") {
		return "dir"
	} else if (node.file_type === "application/bittorrent" || node.file_type === "application/x-bittorrent") {
		return "torrent"
	} else if (node.file_type === "application/zip") {
		return "zip"
	} else if (node.file_type.startsWith("image")) {
		return "image"
	} else if (
		node.file_type.startsWith("video") ||
		node.file_type === "application/matroska" ||
		node.file_type === "application/x-matroska"
	) {
		return "video"
	} else if (
		node.file_type.startsWith("audio") ||
		node.file_type === "application/ogg" ||
		node.name.endsWith(".mp3")
	) {
		return "audio"
	} else if (
		node.file_type === "application/pdf" ||
		node.file_type === "application/x-pdf"
	) {
		return "pdf"
	} else if (
		node.file_type === "application/json" ||
		node.file_type.startsWith("text")
	) {
		return "text"
	} else {
		return "file"
	}
}

export const fs_node_icon = (node: FSNode, width = 64, height = 64) => {
	if (node.type === "dir") {
		// Folders with an ID are publically shared, use the shared folder icon
		if (node.id) {
			return "/res/img/mime/folder-remote.png"
		} else {
			return "/res/img/mime/folder.png"
		}
	}

	return fs_thumbnail_url(node.path, width, height)
}
