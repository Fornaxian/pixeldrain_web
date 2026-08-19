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
	try {
		navigator.clipboard.writeText(text)
	} catch (err) {
		return false
	}
	return true;
}

export function domain_url() {
	let url = window.location.protocol + "//" + window.location.hostname;
	if (window.location.port != "") {
		url = url + ":" + window.location.port;
	}
	return url;
}

export const color_by_name = name => {
	return getComputedStyle(document.documentElement).getPropertyValue("--"+name);
}
export const color_by_name_no_prefix = name => {
	return color_by_name(name).replace(/^#/, "");
}
</script>
