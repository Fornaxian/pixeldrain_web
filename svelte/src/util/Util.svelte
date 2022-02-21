<script context="module">

export function print_date(date, hours, minutes, seconds) {
	let dateStr = date.getFullYear()
		+ "-" + ("00" + (date.getMonth() + 1)).slice(-2)
		+ "-" + ("00" + date.getDate()).slice(-2)

	if (hours) { dateStr += " " + ("00" + date.getHours()).slice(-2) }
	if (minutes) { dateStr += ":" + ("00" + date.getMinutes()).slice(-2) }
	if (seconds) { dateStr += ":" + ("00" + date.getMinutes()).slice(-2) }
	return dateStr
}

export function copy_text(text) {
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

export function domain_url() {
	let url = window.location.protocol + "//" + window.location.hostname;
	if (window.location.port != "") {
		url = url + ":" + window.location.port;
	}
	return url;
}


export const add_upload_history = id => {
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
	localStorage.setItem("uploaded_files", id + "," + uploads);
}
</script>
