<script context="module">

export const fs_create_directory = async (bucket, path, dir_name) => {
	if (!path.startsWith("/")) {
		path = "/" + path
	}

	const form = new FormData()
	form.append("type", "dir")

	const resp=await fetch(
		window.api_endpoint+"/filesystem/"+bucket+encodeURIComponent(path+"/"+dir_name),
		{ method: "POST", body: form }
	);
	if(resp.status >= 400) {
		throw new Error(resp.text());
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
		throw new Error(resp.text());
	}
	return resp.json();
}

export const fs_get_file_url = (bucket, path) => {
	if (!path.startsWith("/")) {
		path = "/" + path
	}
	return window.api_endpoint + "/filesystem/" + bucket + encodeURIComponent(path)
}

export const fs_delete_node = async (bucket, path) => {
	if (!path.startsWith("/")) {
		path = "/" + path
	}

	const resp = await fetch(
		window.api_endpoint+"/filesystem/"+bucket+encodeURIComponent(path),
		{ method: "DELETE" }
	);
	if(resp.status >= 400) {
		throw new Error(resp.text());
	}
}

</script>
