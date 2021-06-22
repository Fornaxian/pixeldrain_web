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

</script>
