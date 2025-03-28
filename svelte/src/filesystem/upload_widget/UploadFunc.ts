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

import { fs_path_url, type GenericResponse } from "filesystem/FilesystemAPI"

// code and an error message
export const upload_file = (
	file: Blob,
	path: string,
	on_progress: (loaded: number, total: number) => void,
	on_success: (id: string) => void,
	on_error: (code: string, message: string) => void,
) => {
	// Check the file size limit. For free accounts it's 20 GB
	if (window["user"].subscription.file_size_limit === 0) {
		window["user"].subscription.file_size_limit = 20e9
	}

	if (file.size > window["user"].subscription.file_size_limit) {
		on_error(
			"file_too_large",
			"This file is too large. Check out the Pro subscription to increase the file size limit"
		)
		return
	}

	console.log("Uploading file to ", fs_path_url(path))

	let xhr = new XMLHttpRequest();
	xhr.open("PUT", fs_path_url(path) + "?make_parents=true", true);
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

			let resp: GenericResponse
			if (xhr.status === 429) {
				resp = {
					value: "too_many_requests",
					message: "Too many requests. Please wait a few seconds",
				}
			} else {
				resp = JSON.parse(xhr.response) as GenericResponse
			}

			on_error(resp.value, resp.message)
		} else if (xhr.status === 0) {
			on_error("request_failed", "Your request did not arrive, check your network connection")
		} else {
			on_error(xhr.responseText, xhr.responseText)
		}
	};

	xhr.send(file);

	return xhr
}
