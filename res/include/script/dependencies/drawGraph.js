Chart.defaults.global.defaultFontColor = "#b3b3b3";
Chart.defaults.global.defaultFontSize = 15;
Chart.defaults.global.defaultFontFamily = "system-ui, sans-serif";
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.global.elements.point.radius = 0;
Chart.defaults.global.tooltips.mode = "index";
Chart.defaults.global.tooltips.axis = "x";
Chart.defaults.global.tooltips.intersect = false;
Chart.defaults.global.animation.duration = 500;
Chart.defaults.global.animation.easing = "linear";

function drawGraph(element, label, dataType) {
	return new Chart(
		element,
		{
			type: 'line',
			data: {
				datasets: [
					{
						label: label,
						backgroundColor: highlightColor,
						borderWidth: 0,
						lineTension: 0,
						fill: true,
						yAxisID: "ax_1"
					}
				]
			},
			options: {
				legend: { display: false },
				scales: {
					yAxes: [
						{
							type: "linear",
							display: true,
							position: "left",
							id: "ax_1",
							ticks: {
								callback: function (value, index, values) {
									if (dataType == "bytes") {
										return formatDataVolume(value, 3);
									}
									return formatNumber(value, 3);
								},
								beginAtZero: true
							},
							gridLines: { display: true },
						}
					],
					xAxes: [
						{
							ticks: {
								sampleSize: 1,
								padding: 4,
								minRotation: 0,
								maxRotation: 0
							},
							gridLines: { display: false }
						}
					]
				}
			}
		}
	);
}
