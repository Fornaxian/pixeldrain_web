// Uploads a file to the logged in user's pixeldrain account. If no user is
// logged in the file is uploaded anonymously.
//
// on_progress reports progress on the file upload, parameter 1 is the uploaded
// file size and parameter 2 is the total file size
//
// on_success is called when the upload is done, the only parameter is the file
// ID
//
// on_error is called when the upload has failed. The parameters are the error

import { fs_get_node, fs_mkdirall } from "../FilesystemAPI"
import { fs_path_url, fs_split_path } from "../FilesystemUtil"

// code and an error message
export const upload_file = async (file, bucket, path, on_progress, on_success, on_error) => {
	// Check the file size limit. For free accounts it's 20 GB
	if (window.user.subscription.file_size_limit === 0) {
		window.user.subscription.file_size_limit = 20e9
	}

	if (file.size > window.user.subscription.file_size_limit) {
		on_failure(
			"file_too_large",
			"This file is too large. Check out the Pro subscription to increase the file size limit"
		)
		return
	}

	// Check if the parent directory exists
	try {
		await ensure_parent_dir(bucket, path)
	} catch (err) {
		if (err.value && err.message) {
			on_error(err.value, err.message)
		} else {
			on_error(err, err)
		}
		return
	}

	console.log("Uploading file to ", fs_path_url(bucket, path))

	let xhr = new XMLHttpRequest();
	xhr.open("PUT", fs_path_url(bucket, path), true);
	xhr.timeout = 86400000; // 24 hours, to account for slow connections

	xhr.upload.addEventListener("progress", evt => {
		if (on_progress && evt.lengthComputable) {
			on_progress(evt.loaded, evt.total)
		}
	});

	xhr.onreadystatechange = () => {
		// readystate 4 means the upload is done
		if (xhr.readyState !== 4) {
			return
		}

		if (xhr.status >= 100 && xhr.status < 400) {
			// Request is a success
			on_success(JSON.parse(xhr.response).id)
		} else if (xhr.status >= 400) {
			// Request failed
			console.log("Upload error. status: " + xhr.status + " response: " + xhr.response);

			let resp;
			if (xhr.status === 429) {
				resp = {
					value: "too_many_requests",
					message: "Too many requests. Please wait a few seconds",
				}
			} else {
				resp = JSON.parse(xhr.response)
			}

			on_error(resp.value, resp.message)
		} else if (xhr.status === 0) {
			on_error("request_failed", "Your request did not arrive, check your network connection")
		} else {
			on_error(xhr.responseText, xhr.responseText)
		}
	};

	xhr.send(file);
}

const ensure_parent_dir = async (bucket, path) => {
	let parent = fs_split_path(path).parent

	console.debug("Checking if parent directory exists", parent)

	try {
		let node = await fs_get_node(bucket, parent)
		if (node.path[node.base_index].type !== "dir") {
			throw "Path " + path + " is not a directory"
		}
	} catch (err) {
		if (err.value && err.value === "path_not_found") {
			// Directory does not exist. Create it
			await fs_mkdirall(bucket, parent)

			console.debug("Created parent directory", parent)
		} else {
			throw err
		}
	}
}
