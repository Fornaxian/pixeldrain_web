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

function copyText(text) {
	// Create a textarea to copy the text from
	let ta = document.createElement("textarea");
	ta.setAttribute("readonly", "readonly")
	ta.style.position = "absolute";
	ta.style.left = "-9999px";
	ta.value = text; // Put the text in the textarea

	// Add the textarea to the DOM so it can be seleted by the user
	document.body.appendChild(ta);
	ta.select() // Select the contents of the textarea
	let success = document.execCommand("copy"); // Copy the selected text
	document.body.removeChild(ta); // Remove the textarea
	return success;
}
