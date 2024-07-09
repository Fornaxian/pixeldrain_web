<script>
import { onMount } from "svelte";
import { formatDataVolume, formatNumber } from "./Formatting.svelte";
import { color_by_name } from "./Util.svelte";
import {
	Chart,
	PointElement,
	LineElement,
	LinearScale,
	CategoryScale,
	LineController,
	Filler,
	Tooltip,
	Legend,
} from "chart.js"
Chart.register(
	PointElement,
	LineElement,
	LinearScale,
	CategoryScale,
	LineController,
	Filler,
	Tooltip,
	Legend,
)

let chart_element
let chart_object
export let data_type = ""
export let legend = true
export let tooltips = true
export let ticks = true
export let height = "300px"

export const chart = () => {
	return chart_object
}
export const data = () => {
	return chart_object.data
}
export const update = () => {
	return chart_object.update()
}

Chart.defaults.color = color_by_name("body_text_color");
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
				labels: [],
				datasets: [],
			},
			options: {
				responsive: true,
				// Only update the chart 100ms after the last time the container
				// is resized. This fixes the stuttering that happens when the
				// chart updates each frame
				resizeDelay: 100,
				plugins: {
					legend: {
						display: legend,
						labels: {
							boxWidth: 12,
							boxHeight: 12,
						}
					},
					tooltip: {
						enabled: tooltips,
					},
				},
				layout: {
					padding: {
						left: 4,
						right: 4,
					}
				},
				scales: {
					y: {
						type: "linear",
						display: true,
						position: "left",
						ticks: {
							callback: function (value, index, values) {
								if (data_type == "bytes") {
									return formatDataVolume(value, 3);
								}
								return formatNumber(value, 3);
							},
						},
						beginAtZero: true,
						grid: {
							display: true,
							drawBorder: false,
							color: color_by_name("separator"),
						},
					},
					x: {
						display: true,
						ticks: {
							display: ticks,
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
				},
			}
		}
	);
})
</script>

<div class="chart-container" style="height: {height};">
	<canvas bind:this={chart_element}></canvas>
</div>

<style>
.chart-container {
	position: relative;
	width: 100%;
}
</style>
