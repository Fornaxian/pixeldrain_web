<script context="module">
export const file_struct = {
	id: "",
	name: "",
	size: 0,
	bandwidth_used: 0,
	bandwidth_used_paid: 0,
	downloads: 0,
	views: 0,
	mime_type: "",
	availability: "",
	abuse_type: "",
	hash_sha256: "",
	show_ads: false,
	can_edit: false,
	can_download: false,
	get_href: "",
	info_href: "",
	download_href: "",
	icon_href: "",
}
export const list_struct = {
	id: "",
	title: "",
	files: [],
	download_href: "",
	info_href: "",
	can_edit: false,
}

export const file_set_href = file => {
	file.get_href = window.api_endpoint+"/file/"+file.id
	file.info_href = window.api_endpoint+"/file/"+file.id+"/info"
	file.download_href = window.api_endpoint+"/file/"+file.id+"?download"
	file.icon_href = window.api_endpoint+"/file/"+file.id+"/thumbnail"
	file.timeseries_href = window.api_endpoint+"/file/"+file.id+"/timeseries"
}
export const file_type = file => {
	if (file.mime_type === "application/bittorrent" || file.mime_type === "application/x-bittorrent") {
		return "torrent"
	} else if (file.mime_type === "application/zip" || file.mime_type === "application/x-7z-compressed") {
		return "zip"
	} else if (file.mime_type.startsWith("image")) {
		return "image"
	} else if (
		file.mime_type.startsWith("video") ||
		file.mime_type === "application/matroska" ||
		file.mime_type === "application/x-matroska"
	) {
		return "video"
	} else if (
		file.mime_type.startsWith("audio") ||
		file.mime_type === "application/ogg" ||
		file.name.endsWith(".mp3")
	) {
		return "audio"
	} else if (
		file.mime_type === "application/pdf" ||
		file.mime_type === "application/x-pdf"
	) {
		return "pdf"
	} else if (
		file.mime_type === "application/json" ||
		file.mime_type === "application/x-shellscript" ||
		file.mime_type.startsWith("text")
	) {
		return "text"
	} else {
		return "file"
	}
}
</script>
