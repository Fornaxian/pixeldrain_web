<script context="module">

export const fs_create_bucket = async (name = "", read_pw = "", write_pw = "") => {
	const form = new FormData()
	form.append("name", name)
	form.append("read_password", read_pw)
	form.append("write_password", write_pw)

	const resp = await fetch(
		window.api_endpoint+"/filesystem",
		{ method: "POST", body: form }
	);
	if(resp.status >= 400) {
		throw new Error(await resp.text());
	}
	return resp.json()
}

export const fs_get_buckets = async () => {
	const resp = await fetch(window.api_endpoint+"/filesystem");
	if(resp.status >= 400) {
		throw new Error(await resp.text());
	}
	return resp.json();
}

export const fs_delete_bucket = async (id, recursive) => {
	let uri = window.api_endpoint+"/filesystem/"+encodeURIComponent(id)
	if (recursive) {
		uri += "?recursive"
	}

	const resp = await fetch(uri, { method: "DELETE" });
	if(resp.status >= 400) {
		throw new Error(await resp.text());
	}
}

export const fs_create_directory = async (bucket, path, dir_name) => {
	if (!path.startsWith("/")) {
		path = "/" + path
	}

	const form = new FormData()
	form.append("type", "dir")

	const resp = await fetch(
		window.api_endpoint+"/filesystem/"+bucket+encodeURIComponent(path+"/"+dir_name),
		{ method: "POST", body: form }
	);
	if(resp.status >= 400) {
		throw new Error(await resp.text())
	}
}

export const fs_get_node = async (bucket, path) => {
	if (!path.startsWith("/")) {
		path = "/" + path
	}

	const resp = await fetch(
		window.api_endpoint+"/filesystem/"+bucket+encodeURIComponent(path)+"?stat"
	);
	if(resp.status >= 400) {
		throw new Error(await resp.text())
	}
	return resp.json()
}

export const fs_get_file_url = (bucket, path) => {
	if (!path.startsWith("/")) {
		path = "/" + path
	}
	return window.api_endpoint + "/filesystem/" + bucket + encodeURIComponent(path)
}

export const fs_rename_node = async (bucket, old_path, new_path) => {
	if (!old_path.startsWith("/")) { old_path = "/" + old_path }
	if (!new_path.startsWith("/")) { new_path = "/" + new_path }

	const form = new FormData()
	form.append("move_to", new_path)

	const resp = await fetch(
		window.api_endpoint+"/filesystem/"+bucket+encodeURIComponent(old_path),
		{ method: "PUT", body: form }
	)
	if (resp.status >= 400) {
		throw new Error(await resp.text())
	}
}

export const fs_delete_node = async (bucket, path) => {
	if (!path.startsWith("/")) {
		path = "/" + path
	}

	const resp = await fetch(
		window.api_endpoint+"/filesystem/"+bucket+encodeURIComponent(path)+"?recursive",
		{ method: "DELETE" }
	);
	if (resp.status >= 400) {
		throw new Error(await resp.text())
	}
}

</script>
