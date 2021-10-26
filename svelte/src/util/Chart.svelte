<script>
import { onMount } from "svelte";
import { formatDataVolume, formatNumber } from "./Formatting.svelte";
import { Chart } from "chart.js"

let chart_element
let chart_object
export let label = "label"
export let dataType = ""

export const chart = () => {
	return chart_object
}
export const update = () => {
	return chart_object.update()
}

Chart.defaults.global.defaultFontColor = "#cccccc";
Chart.defaults.global.defaultFontSize = 15;
Chart.defaults.global.defaultFontFamily = "system-ui, sans-serif";
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.global.elements.point.radius = 0;
Chart.defaults.global.tooltips.mode = "index";
Chart.defaults.global.tooltips.axis = "x";
Chart.defaults.global.tooltips.intersect = false;
Chart.defaults.global.animation.duration = 500;
Chart.defaults.global.animation.easing = "linear";

onMount(() => {
	chart_object = new Chart(
		chart_element.getContext("2d"),
		{
			type: 'line',
			data: {
				datasets: [
					{
						label: label,
						backgroundColor: "#"+window.style.highlightColor,
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
})

</script>

<div class="chart-container">
	<canvas bind:this={chart_element}></canvas>
</div>

<style>
.chart-container {
	position: relative;
	width: 100%;
	height: 200px;
}
</style>
