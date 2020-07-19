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

function printDate(date, hours, minutes, seconds) {
	let dateStr = date.getFullYear()
		+"-"+("00"+(date.getMonth()+1)).slice(-2)
		+"-"+("00"+date.getDate()).slice(-2)

	if (hours)   { dateStr += " "+("00"+date.getHours()).slice(-2) }
	if (minutes) { dateStr += ":"+("00"+date.getMinutes()).slice(-2) }
	if (seconds) { dateStr += ":"+("00"+date.getMinutes()).slice(-2) }
	return dateStr
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

function domainURL() {
	let url = window.location.protocol+"//"+window.location.hostname;
	if (window.location.port != "") {
		url = url+":"+window.location.port;
	}
	return url;
}

function formatNumber(amt, precision) {
	if (precision < 3) { precision = 3; }
	if (amt >= 1e6) {
		return (amt/1e6).toPrecision(precision) + "M";
	} else if (amt >= 1e3) {
		return (amt/1e3).toPrecision(precision) + "k";
	}
	return amt
}

function formatThousands(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatDataVolume(amt, precision) {
	if (precision < 3) { precision = 3; }
	if (amt >= 1e18) {
		return (amt/1e18).toPrecision(precision) + " EB";
	}else if (amt >= 1e15) {
		return (amt/1e15).toPrecision(precision) + " PB";
	}else if (amt >= 1e12) {
		return (amt/1e12).toPrecision(precision) + " TB";
	} else if (amt >= 1e9) {
		return (amt/1e9).toPrecision(precision) + " GB";
	} else if (amt >= 1e6) {
		return (amt/1e6).toPrecision(precision) + " MB";
	} else if (amt >= 1e3) {
		return (amt/1e3).toPrecision(precision) + " kB";
	}
	return amt + " B"
}

const second = 1000
const minute = second*60
const hour = minute*60
const day = hour*24

function formatDuration(ms) {
	let res = ""
	if (ms >= day)    { res += Math.floor(ms/day) + "d " }
	if (ms >= hour)   { res += Math.floor((ms%day)/hour) + "h " }
	if (ms >= minute) { res += Math.floor((ms%hour)/minute) + "m " }
	return res + ((ms%minute)/second).toFixed(3) + "s"
}
