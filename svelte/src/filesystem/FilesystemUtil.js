export const fs_split_path = path => {
	let patharr = path.split("/")
	return { base: patharr.pop(), parent: patharr.join("/") }
}

export const fs_encode_path = path => {
	// Encode all path elements separately to preserve forward slashes
	let split = path.split("/")
	for (let i = 0; i < split.length; i++) {
		split[i] = encodeURIComponent(split[i])
	}
	return split.join("/")
}

export const fs_path_url = path => {
	return window.api_endpoint + "/filesystem" + fs_encode_path(path)
}

export const fs_thumbnail_url = (path, width = 64, height = 64) => {
	return fs_path_url(path) + "?thumbnail&width=" + width + "&height=" + height
}

export const fs_node_type = node => {
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

export const fs_node_icon = (node, width = 64, height = 64) => {
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
