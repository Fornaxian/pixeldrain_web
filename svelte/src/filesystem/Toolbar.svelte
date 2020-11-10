<script>
import { createEventDispatcher } from 'svelte'
import { formatDataVolume, formatThousands } from '../util/Formatting.svelte'
let dispatch = createEventDispatcher()

let toolbar
export let file
export let sharebar
export let visible = false


export const setVisible = (v) => {
	visible = v
	if (!visible) {
		sharebar.setVisible(false)
	}
}
export const toggle = () => { setVisible(!visible) }
</script>

<div bind:this={toolbar} class="toolbar" class:visible><div><div>
	<div class="label">Views</div>
	<div class="statistic">{formatThousands(file.views)}</div>
	<div class="label">Downloads</div>
	<div class="statistic">{formatThousands(file.downloads)}</div>
	<div class="label">Size</div>
	<div class="statistic">{formatDataVolume(file.size)}</div>

	<button on:click={()=>{dispatch("download")}} class="toolbar_button button_full_width">
		<i class="icon">save</i>
		<span>Download</span>
	</button>
	<button id="btn_download_list" class="toolbar_button button_full_width" style="display: none;">
		<i class="icon">save</i>
		<span>DL all files</span>
	</button>
	<button id="btn_copy" class="toolbar_button button_full_width">
		<i class="icon">content_copy</i>
		<span><u>C</u>opy Link</span>
	</button>
	<button on:click={sharebar.toggle} class="toolbar_button button_full_width">
		<i class="icon">share</i>
		<span>Share</span>
	</button>
	<button id="btn_shuffle" class="toolbar_button button_full_width" style="display: none;">
		<i class="icon">shuffle</i>
		<span>Shuffle &#x2610;</span>
	</button>
	<button on:click={()=>{dispatch("details")}} class="toolbar_button button_full_width">
		<i class="icon">help</i>
		<span>Deta<u>i</u>ls</span>
	</button>
	<button id="btn_edit" class="toolbar_button button_full_width" style="display: none;">
		<i class="icon">edit</i>
		<span><u>E</u>dit</span>
	</button>
</div></div></div>

<style>
	.toolbar {
		position: absolute;
		width: 8em;
		z-index: 49;
		overflow: hidden;
		float: left;
		background-color: var(--layer_1_color);
		left: -9em;
		bottom: 0;
		top: 0;
		padding: 0;
		text-align: left;
		transition: left 0.5s;
	}
	.visible { left: 0; }

	/* Workaround to hide the scrollbar in non webkit browsers, it's really ugly' */
	.toolbar > div {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		right: -30px;
		overflow-y: scroll;
		overflow-x: hidden;
	}
	.toolbar > div > div {
		position: absolute;
		left: 0;
		top: 0;
		width: 8em;
		height: auto;
		text-align: center;
	}

	.toolbar_button{
		text-align: left;
	}
	.toolbar_button > span {
		vertical-align: middle;
	}

	.label {
		text-align: left;
		padding-left: 10px;
		font-size: 0.8em;
		line-height: 0.7em;
		margin-top: 0.5em;
	}
	.statistic {
		text-align: center;
	}
</style>
