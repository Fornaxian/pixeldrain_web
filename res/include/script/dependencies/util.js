function renderFileButton(apiURL, id, title, subtitle) {
	let btn                = document.createElement("a");
	btn.classList          = "file_button";
	btn.href               = "/u/"+id;
	btn.target             = "_blank";
	let thumbnail          = document.createElement("img");
	thumbnail.src          = apiURL+"/file/"+id+"/thumbnail?width=80&height=80";
	thumbnail.alt          = title;
	let titleSpan          = document.createElement("span");
	titleSpan.classList    = "file_button_title";
	titleSpan.innerText    = title;
	let br                 = document.createElement("br");
	let subtitleSpan       = document.createElement("span");
	subtitleSpan.classList = "file_button_subtitle";
	subtitleSpan.innerText = subtitle;

	btn.appendChild(thumbnail);
	btn.appendChild(titleSpan);
	btn.appendChild(br);
	btn.appendChild(subtitleSpan);
	return btn;
}
function renderListButton(apiURL, id, title, subtitle) {
	let btn                = document.createElement("a");
	btn.classList          = "file_button";
	btn.href               = "/l/"+id;
	btn.target             = "_blank";
	let thumbnail          = document.createElement("img");
	thumbnail.src          = apiURL+"/list/"+id+"/thumbnail?width=80&height=80";
	thumbnail.alt          = title;
	let titleSpan          = document.createElement("span");
	titleSpan.classList    = "file_button_title";
	titleSpan.innerText    = title;
	let br                 = document.createElement("br");
	let subtitleSpan       = document.createElement("span");
	subtitleSpan.classList = "file_button_subtitle";
	subtitleSpan.innerText = subtitle;

	btn.appendChild(thumbnail);
	btn.appendChild(titleSpan);
	btn.appendChild(br);
	btn.appendChild(subtitleSpan);
	return btn;
}

function addUploadHistory(fileID) {
	// Make sure the user is not logged in, for privacy. This keeps the
	// files uploaded while logged in and anonymously uploaded files
	// separated
	if (document.cookie.includes("pd_auth_key")) { return; }

	let uploads = localStorage.getItem("uploaded_files");
	if (uploads === null) { uploads = ""; }

	// Check if there are not too many values stored
	if (uploads.length > 3600) {
		// 3600 characters is enough to store 400 file IDs. If we exceed that
		// number we'll drop the last two items
		uploads = uploads.substring(
			uploads.indexOf(",") + 1
		).substring(
			uploads.indexOf(",") + 1
		);
	}

	// Save the new ID
	localStorage.setItem("uploaded_files", fileID + "," + uploads);
}
