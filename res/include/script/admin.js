let graphViews = drawGraph(document.getElementById("views_chart"), "Views", "number");
let graphBandwidth = drawGraph(document.getElementById("bandwidth_chart"), "Bandwidth", "bytes");

function loadGraph(minutes, interval, live){
	if (graphTimeout !== null) { clearTimeout(graphTimeout) }
	if (live) {
		graphTimeout = setTimeout(() => {updateGraphs(minutes, interval, true)}, 10000)
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

let graphTimeout = null;
function updateGraphs(minutes, interval, live) {

	loadGraph(graphViews, "views", minutes, interval);
	loadGraph(graphBandwidth, "bandwidth", minutes, interval);
}

loadGraph(1440, 10, true);

// Load performance statistics

let lastOrder
function getStats(order) {
	lastOrder = order

	fetch(apiEndpoint+"/status").then(
		resp => resp.json()
	).then(resp => {
		let t = document.getElementById("tstat_body")
		t.innerHTML = ""
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

		resp.query_statistics.sort((a, b) => {
			if (typeof(a[order]) === "number") {
				// Sort ints from high to low
				return b[order] - a[order]
			} else {
				// Sort strings alphabetically
				return a[order].localeCompare(b[order])
			}
		})

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
