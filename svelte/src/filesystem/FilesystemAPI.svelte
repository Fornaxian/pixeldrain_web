<script context="module">

export const fs_create_directory = (bucket, path, dir_name) => {
	if (!path.startsWith("/")) {
		path = "/" + path
	}

	let form = new FormData()
	form.append("type", "dir")

	return fetch(
		window.api_endpoint + "/filesystem/" + bucket + encodeURIComponent(path + "/" + dir_name),
		{method: "POST", body: form},
	).then(resp => {
		if (resp.status >= 400) {
			throw new Error(resp.text())
		}
	})
}

export const fs_get_node = (bucket, path) => {
	if (!path.startsWith("/")) {
		path = "/" + path
	}

	return fetch(
		window.api_endpoint + "/filesystem/" + bucket + encodeURIComponent(path) + "?stat",
	).then(resp => {
		if (resp.status >= 400) {
			throw new Error(resp.text())
		}
		return resp.json()
	})
}

export const fs_get_file_url = (bucket, path) => {
	if (!path.startsWith("/")) {
		path = "/" + path
	}
	return window.api_endpoint + "/filesystem/" + bucket + encodeURIComponent(path)
}

export const fs_delete_node = (bucket, path) => {
	if (!path.startsWith("/")) {
		path = "/" + path
	}

	return fetch(
		window.api_endpoint + "/filesystem/" + bucket + encodeURIComponent(path),
		{method: "DELETE"},
	).then(resp => {
		if (resp.status >= 400) {
			throw new Error(resp.text())
		}
	})
}

</script>
