let graphViews = drawGraph(document.getElementById("views_chart"), "Views", "number");
let graphBandwidth = drawGraph(document.getElementById("bandwidth_chart"), "Bandwidth", "bytes");
let graphTimeout = null;
function loadGraph(minutes, interval, live){
	if (graphTimeout !== null) { clearTimeout(graphTimeout) }
	if (live) {
		graphTimeout = setTimeout(() => {loadGraph(minutes, interval, true)}, 10000)
	}

	let today = new Date()
	let start = new Date()
	start.setMinutes(start.getMinutes()-minutes)

	fetch(
		apiEndpoint+"/admin/files/timeseries" +
		"?start="+start.toISOString() +
		"&end="+today.toISOString() +
		"&interval="+interval
	).then(resp => {
		if (!resp.ok) { return Promise.reject("Error: "+resp.status);}
		return resp.json();
	}).then(resp => {
		resp.views.timestamps.forEach((val, idx) => {
			let date = new Date(val);
			let dateStr = ("00"+(date.getMonth()+1)).slice(-2);
			dateStr += "-"+("00"+date.getDate()).slice(-2);
			dateStr += " "+("00"+date.getHours()).slice(-2);
			dateStr += ":"+("00"+date.getMinutes()).slice(-2);
			resp.views.timestamps[idx] = "   "+dateStr+"   "; // Poor man's padding
		});
		graphViews.data.labels = resp.views.timestamps;
		graphViews.data.datasets[0].data = resp.views.amounts;
		graphBandwidth.data.labels = resp.views.timestamps;
		graphBandwidth.data.datasets[0].data = resp.bandwidth.amounts;
		graphViews.update()
		graphBandwidth.update();

		document.getElementById("time_start").innerText = resp.views.timestamps[0];
		document.getElementById("time_end").innerText = resp.views.timestamps.slice(-1)[0];
		let total = 0
		resp.bandwidth.amounts.forEach(e => { total += e; });
		document.getElementById("total_bandwidth").innerText = formatDataVolume(total, 3);
		total = 0
		resp.views.amounts.forEach(e => { total += e; });
		document.getElementById("total_views").innerText = formatThousands(total);
	}).catch(e => {
		alert("Error requesting time series: "+e);
	})
}

loadGraph(10080, 60, false);

function loadGraphDate(start, end, interval){
	fetch(
		apiEndpoint+"/admin/files/timeseries" +
		"?start="+start.toISOString() +
		"&end="+end.toISOString() +
		"&interval="+interval
	).then(resp => {
		if (!resp.ok) { return Promise.reject("Error: "+resp.status);}
		return resp.json();
	}).then(resp => {
		resp.views.timestamps.forEach((val, idx) => {
			let date = new Date(val);
			let dateStr = date.getUTCFullYear() +
				"-"+("00"+(date.getUTCMonth()+1)).slice(-2) +
				"-"+("00"+date.getUTCDate()).slice(-2) +
				" "+("00"+date.getUTCHours()).slice(-2) +
				":"+("00"+date.getUTCMinutes()).slice(-2);
			resp.views.timestamps[idx] = "   "+dateStr+"   "; // Poor man's padding
		});
		graphViews.data.labels = resp.views.timestamps;
		graphViews.data.datasets[0].data = resp.views.amounts;
		graphBandwidth.data.labels = resp.views.timestamps;
		graphBandwidth.data.datasets[0].data = resp.bandwidth.amounts;
		graphViews.update()
		graphBandwidth.update();

		document.getElementById("time_start").innerText = resp.views.timestamps[0];
		document.getElementById("time_end").innerText = resp.views.timestamps.slice(-1)[0];
		let total = 0
		resp.bandwidth.amounts.forEach(e => { total += e; });
		document.getElementById("total_bandwidth").innerText = formatDataVolume(total, 3);
		total = 0
		resp.views.amounts.forEach(e => { total += e; });
		document.getElementById("total_views").innerText = formatThousands(total);
	}).catch(e => {
		alert("Error requesting time series: "+e);
	})
}

let tsSpan;
let tsStart;
function loadTimespan(span, base) {
	base.setUTCHours(0, 0, 0, 0);

	if (span === "day") {
		let start = new Date(base);
		let end = new Date(base);
		end.setUTCHours(23, 59, 59, 999);

		tsStart = start;
		loadGraphDate(start, end, 1);
	} else if (span === "week") {
		let monday = new Date(Date.UTC(
			base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() - base.getUTCDay() + 1
		));
		let sunday = new Date(Date.UTC(
			base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() - base.getUTCDay() + 7,
			23, 59, 59
		));

		tsStart = monday;
		loadGraphDate(monday, sunday, 60);
	} else if (span === "month") {
		let start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
		let end = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth()+1, 0, 23, 59, 59));

		tsStart = start;
		loadGraphDate(start, end, 60);
	} else if (span === "quarter") {
		let start = new Date(Date.UTC(base.getUTCFullYear(), 3.0 * Math.floor(base.getUTCMonth()/3.0), 1));
		let end = new Date(Date.UTC(base.getUTCFullYear(), 3.0 * Math.ceil(base.getUTCMonth()/3.0), 0, 23, 59, 59));

		tsStart = start;
		loadGraphDate(start, end, 1440);
	} else if (span === "year") {
		let start = new Date(Date.UTC(base.getUTCFullYear(), 0, 1));
		let end = new Date(Date.UTC(base.getUTCFullYear()+1, 0, 0, 23, 59, 59));

		tsStart = start;
		loadGraphDate(start, end, 1440);
	} else {
		console.error("Invalid timespan", ts);
	}

	tsSpan = span;
}
function navigateTimespan(forward) {
	let offYear = 0, offMonth = 0, offDay = 0;
	switch (tsSpan) {
	case "day":
		offDay = 1;
		break;
	case "week":
		offDay = 7;
		break;
	case "month":
		offMonth = 1;
		break;
	case "quarter":
		offMonth = 3;
		break;
	case "year":
		offYear = 1;
		break;
	}

	if (!forward) {
		offDay = -offDay;
		offMonth = -offMonth;
		offYear = -offYear;
	}

	loadTimespan(
		tsSpan,
		new Date(Date.UTC(
			tsStart.getUTCFullYear()+offYear,
			tsStart.getUTCMonth()+offMonth,
			tsStart.getUTCDay()+offDay,
		))
	)
}

// Load performance statistics

let lastOrder
function getStats(order) {
	lastOrder = order

	fetch(apiEndpoint+"/status").then(
		resp => resp.json()
	).then(resp => {
		document.getElementById("file_stats_watchers").innerText = resp.stats_watcher_threads;
		document.getElementById("file_stats_listeners").innerText = resp.stats_watcher_listeners;
		document.getElementById("file_stats_avg").innerText = (
			resp.stats_watcher_listeners / resp.stats_watcher_threads
		).toPrecision(3);

		let c = document.getElementById("tconnstat_body")
		c.innerHTML = ""
		resp.db_connection_stats.forEach(v => {
			let row = document.createElement("tr")
			row.innerHTML = `\
			<td>${v.name}</td>
			<td>${v.available}</td>
			<td>${v.max_connections}</td>
			<td>${v.open_connections}</td>
			<td>${v.connections_in_use}</td>
			<td>${v.connections_idle}</td>`
			c.appendChild(row)
		})

		let p = document.getElementById("tbody_peers")
		p.innerHTML = ""
		resp.peers.forEach(v => {
			let row = document.createElement("tr")
			row.innerHTML = `\
			<td>${v.address}</td>
			<td>${v.position}</td>
			<td>${v.reachable}</td>
			<td>${v.unreachable_count}</td>
			<td>${formatDuration(v.latency)}</td>
			<td>${formatDataVolume(v.free_space, 3)}</td>
			<td>${formatDataVolume(v.min_free_space, 3)}</td>`
			p.appendChild(row)
		})

		resp.query_statistics.sort((a, b) => {
			if (typeof(a[order]) === "number") {
				// Sort ints from high to low
				return b[order] - a[order]
			} else {
				// Sort strings alphabetically
				return a[order].localeCompare(b[order])
			}
		})

		let t = document.getElementById("tstat_body")
		t.innerHTML = ""
		resp.query_statistics.forEach((v) => {
			let callers = ""
			v.callers.sort((a, b) => b.count - a.count)
			v.callers.forEach((v1) => {
				callers += `${v1.count}x ${v1.name}<br/>`
			})

			let row = document.createElement("tr")
			row.innerHTML = `\
			<td>${v.query_name}</td>
			<td>${v.calls}</td>
			<td>${formatDuration(v.average_duration)}</td>
			<td>${formatDuration(v.total_duration)}</td>
			<td>${callers}</td>`
			t.appendChild(row)
		})
	})
}
getStats("calls")

setInterval(() => {	getStats(lastOrder) }, 5000)
