function loadGraph(graph, stat, minutes, interval){
	let today = new Date()
	let start = new Date()
	start.setMinutes(start.getMinutes()-minutes)

	fetch(
		apiEndpoint+"/user/time_series/" + stat +
		"?start="+start.toISOString() +
		"&end="+today.toISOString() +
		"&interval="+interval
	).then(resp => {
		if (!resp.ok) { return Promise.reject("Error: "+resp.status);}
		return resp.json();
	}).then(resp => {
		resp.timestamps.forEach((val, idx) => {
			let date = new Date(val);
			let dateStr = ("00"+(date.getMonth()+1)).slice(-2);
			dateStr += "-"+("00"+date.getDate()).slice(-2);
			dateStr += " "+("00"+date.getHours()).slice(-2);
			dateStr += ":"+("00"+date.getMinutes()).slice(-2);
			resp.timestamps[idx] = "   "+dateStr+"   "; // Poor man's padding
		});
		graph.data.labels = resp.timestamps;
		graph.data.datasets[0].data = resp.amounts;
		graph.update();

		document.getElementById("time_start").innerText = resp.timestamps[0];
		document.getElementById("time_end").innerText = resp.timestamps.slice(-1)[0];
		let total = 0
		resp.amounts.forEach(e => { total += e; });

		if (stat == "views") {
			document.getElementById("total_views").innerText = formatThousands(total);
		} else if (stat == "downloads") {
			document.getElementById("total_downloads").innerText = formatThousands(total);
		} else if (stat == "bandwidth") {
			document.getElementById("total_bandwidth").innerText = formatDataVolume(total, 3);
		}
	}).catch(e => {
		console.error("Error requesting time series: "+e);
	})
}

let graphViews = drawGraph(document.getElementById("views_chart"), "Views", "number");
let graphDownloads = drawGraph(document.getElementById("downloads_chart"), "Downloads", "number");
let graphBandwidth = drawGraph(document.getElementById("bandwidth_chart"), "Bandwidth", "bytes");
let graphTimeout = null;

function updateGraphs(minutes, interval, live) {
	if (graphTimeout !== null) { clearTimeout(graphTimeout) }
	if (live) {
		graphTimeout = setTimeout(() => {updateGraphs(minutes, interval, true)}, 10000)
	}

	loadGraph(graphViews, "views", minutes, interval);
	loadGraph(graphDownloads, "downloads", minutes, interval);
	loadGraph(graphBandwidth, "bandwidth", minutes, interval);
}

// Default
updateGraphs(10080, 60, false);
