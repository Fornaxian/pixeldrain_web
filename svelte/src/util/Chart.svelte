<script>
import { onMount } from "svelte";
import { formatDataVolume, formatNumber } from "./Formatting.svelte";
import { Chart, PointElement, LineElement, LinearScale, CategoryScale, LineController, Filler, Tooltip } from "chart.js"

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

Chart.register(PointElement, LineElement, LinearScale, CategoryScale, LineController, Filler, Tooltip)
Chart.defaults.color = "#"+window.style.textColor;
Chart.defaults.font.size = 15;
Chart.defaults.font.family = "system-ui, sans-serif";
Chart.defaults.maintainAspectRatio = false;
Chart.defaults.plugins.tooltip.mode = "index";
Chart.defaults.plugins.tooltip.axis = "x";
Chart.defaults.plugins.tooltip.intersect = false;
Chart.defaults.animation.duration = 500;
Chart.defaults.animation.easing = "linear";

onMount(() => {
	chart_object = new Chart(
		chart_element.getContext("2d"),
		{
			type: 'line',
			data: {
				datasets: [
					{
						label: label,
						borderWidth: 0,
						pointRadius: 0,
						fill: 'origin',
						backgroundColor: "#"+window.style.highlightColor,
					}
				]
			},
			options: {
				legend: { display: false },
				layout: {
					padding: {
						left: 4,
						right: 10,
					}
				},
				scales: {
					y: {
						type: "linear",
						display: true,
						position: "left",
						ticks: {
							callback: function (value, index, values) {
								if (dataType == "bytes") {
									return formatDataVolume(value, 3);
								}
								return formatNumber(value, 3);
							},
						},
						beginAtZero: true,
						grid: {
							display: true,
							drawBorder: false,
							color: "#"+window.style.layer3Color,
						},
					},
					x: {
						display: true,
						ticks: {
							sampleSize: 1,
							padding: 4,
							minRotation: 0,
							maxRotation: 0
						},
						grid: {
							display: false,
							drawBorder: false,
						}
					}
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
