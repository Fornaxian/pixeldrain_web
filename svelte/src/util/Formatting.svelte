<script context="module">
export const formatNumber = (amt, precision) => {
	if (precision < 3) { precision = 3; }
	if (amt >= 1e6) {
		return (amt/1e6).toPrecision(precision) + "M";
	} else if (amt >= 1e3) {
		return (amt/1e3).toPrecision(precision) + "k";
	}
	return amt
}

export const formatThousands = (x) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export const formatDataVolume = (amt, precision) => {
	if (precision < 3) { precision = 3; }
	if (amt >= 1e18-1e15) {
		return (amt/1e18).toPrecision(precision) + " EB";
	}else if (amt >= 1e15-1e12) {
		return (amt/1e15).toPrecision(precision) + " PB";
	}else if (amt >= 1e12-1e9) {
		return (amt/1e12).toPrecision(precision) + " TB";
	} else if (amt >= 1e9-1e6) {
		return (amt/1e9).toPrecision(precision) + " GB";
	} else if (amt >= 1e6-1e3) {
		return (amt/1e6).toPrecision(precision) + " MB";
	} else if (amt >= 1e3-1) {
		return (amt/1e3).toPrecision(precision) + " kB";
	}
	return amt + " B"
}
export const formatDataVolumeBits = (amt, precision) => {
	amt = amt*8
	if (precision < 3) { precision = 3; }
	if (amt >= 1e18-1e15) {
		return (amt/1e18).toPrecision(precision) + " Eb";
	}else if (amt >= 1e15-1e12) {
		return (amt/1e15).toPrecision(precision) + " Pb";
	}else if (amt >= 1e12-1e9) {
		return (amt/1e12).toPrecision(precision) + " Tb";
	} else if (amt >= 1e9-1e6) {
		return (amt/1e9).toPrecision(precision) + " Gb";
	} else if (amt >= 1e6-1e3) {
		return (amt/1e6).toPrecision(precision) + " Mb";
	} else if (amt >= 1e3-1) {
		return (amt/1e3).toPrecision(precision) + " kb";
	}
	return amt + " b"
}

const second = 1000
const minute = second*60
const hour = minute*60
const day = hour*24

export const formatDuration = (ms, decimals) => {
	let res = ""
	if (ms >= day)    { res += Math.floor(ms/day) + "d " }
	if (ms >= hour)   { res += Math.floor((ms%day)/hour) + "h " }
	if (ms >= minute) { res += Math.floor((ms%hour)/minute) + "m " }
	return res + ((ms%minute)/second).toFixed(decimals) + "s"
}

export const formatDate = (date, hours, minutes, seconds) => {
	if (!(date instanceof Date)) {
		date = new Date(date)
	}

	let dateStr = date.getFullYear()
		+"-"+("00"+(date.getMonth()+1)).slice(-2)
		+"-"+("00"+date.getDate()).slice(-2)

	if (hours)   { dateStr += " "+("00"+date.getHours()).slice(-2) }
	if (minutes) { dateStr += ":"+("00"+date.getMinutes()).slice(-2) }
	if (seconds) { dateStr += ":"+("00"+date.getMinutes()).slice(-2) }
	return dateStr
}

export const formatEuros = (amt, precision) => {
	return "€ "+ (amt / 1000000).toFixed(precision)
}
</script>
