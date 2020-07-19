// Draw usage graph

Chart.defaults.global.defaultFontColor = "#b3b3b3";
Chart.defaults.global.defaultFontSize = 15;
Chart.defaults.global.defaultFontFamily = "Ubuntu";
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.global.elements.point.radius = 0;
Chart.defaults.global.tooltips.mode = "index";
Chart.defaults.global.tooltips.axis = "x";
Chart.defaults.global.tooltips.intersect = false;
Chart.defaults.global.animation.duration = 1000;
Chart.defaults.global.animation.easing = "linear";

var graph = new Chart(
	document.getElementById('bandwidth_chart'),
	{
		type: 'line',
		data: {
			datasets: [
				{
					label: "Bandwidth",
					backgroundColor: "rgba(64, 255, 64, .01)",
					borderColor: "rgba(96, 255, 96, 1)",
					borderWidth: 1.5,
					lineTension: 0.2,
					fill: true,
					yAxisID: "y_bandwidth"
				}, {
					label: "Views",
					backgroundColor: "rgba(64, 64, 255, .01)",
					borderColor: "rgba(96, 96, 255, 1)",
					borderWidth: 1.5,
					lineTension: 0.2,
					fill: true,
					yAxisID: "y_views"
				}
			]
		},
		options: {
			scales: {
				yAxes: [
					{
						type: "linear",
						display: true,
						position: "left",
						id: "y_bandwidth",
						scaleLabel: {
							display: true,
							labelString: "Bandwidth"
						},
						ticks: {
							callback: function(value, index, values) {
								return formatDataVolume(value, 3);
							},
							beginAtZero: true
						},
						gridLines: {
							color: "rgba(100, 255, 100, .05)"
						}
					}, {
						type: "linear",
						display: true,
						position: "right",
						id: "y_views",
						scaleLabel: {
							display: true,
							labelString: "Views"
						},
						ticks: {
							callback: function(value, index, values) {
								return formatNumber(value, 3);
							},
							beginAtZero: true
						},
						gridLines: {
							color: "rgba(128, 128, 255, .05)"
						}
					}
				],
				xAxes: [
					{
						ticks: {
							maxRotation: 16
						},
						gridLines: {
							display: false
						}
					}
				]
			}
		}
	}
);

let graphTimeout = null;
function loadGraph(minutes, interval, live){
	if (graphTimeout !== null) { clearTimeout(graphTimeout) }
	if (live) {
		graphTimeout = setTimeout(() => {loadGraph(minutes, interval, true)}, 3000)
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
		if (resp.success) {
			window.graph.data.labels = resp.labels;
			window.graph.data.datasets[0].data = resp.downloads;
			window.graph.data.datasets[1].data = resp.views;
			window.graph.update();

			document.getElementById("time_start").innerText = resp.labels[0];
			document.getElementById("time_end").innerText = resp.labels.slice(-1)[0];
			let total = 0
			resp.downloads.forEach(e => { total += e; });
			document.getElementById("total_bandwidth").innerText = formatDataVolume(total, 3);
			total = 0
			resp.views.forEach(e => { total += e; });
			document.getElementById("total_views").innerText = formatThousands(total);
		}
	}).catch(e => {
		alert("Error requesting time series: "+e);
	})
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
