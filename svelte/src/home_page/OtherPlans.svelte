<div class="feat_table">
	<div>
		<div class="cell_background" style="background-image: url('/res/img/benefit_5.webp');">
			Resolve<br/>
			{#if window.user.subscription.id === "patreon_5"}
			You have this plan<br/>
			Thank you for supporting pixeldrain!
			{:else}
			<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5736701" class="button button_highlight round">
				€ 4
			</a>
			/ month
			{/if}
		</div>
		<div class="feat_pro features_cell round_tr">
			<div><span class="text_highlight">20 GB</span> max file size</div>
			<div><span class="text_highlight">240 days</span> file expiry</div>
			<div><span class="text_highlight">2 TB</span> transfer limit</div>
			<div><span class="text_highlight">No storage limit</span></div>
		</div>
	</div>
	<div>
		<div class="cell_background" style="background-image: url('/res/img/benefit_2.webp');">
			Persistence<br/>
			{#if window.user.subscription.id === "patreon_2"}
			You have this plan<br/>
			Thank you for supporting pixeldrain!
			{:else}
			<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291482" class="button button_highlight round">
				€ 8
			</a>
			/ month
			{/if}
		</div>
		<div class="feat_pro features_cell">
			<div><span class="text_highlight">20 GB</span> max file size</div>
			<div><span class="text_highlight">Files never expire</span></div>
			<div><span class="text_highlight">4 TB</span> transfer limit</div>
			<div><span class="text_highlight">4 TB</span> storage space</div>
			<div>
				<span class="text_highlight">File viewer
				branding</span>: Set a custom theme and header,
				footer and background images on the download pages
				for your files
			</div>
		</div>
	</div>
	<div>
		<div class="cell_background" style="background-image: url('/res/img/benefit_3.webp');">
			Tenacity<br/>
			{#if window.user.subscription.id === "patreon_3"}
			You have this plan<br/>
			Thank you for supporting pixeldrain!
			{:else}
			<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291516" class="button button_highlight round">
				€ 16
			</a>
			/ month
			{/if}
		</div>
		<div class="feat_pro features_cell">
			<div><span class="text_highlight">20 GB</span> max file size</div>
			<div><span class="text_highlight">Files never expire</span></div>
			<div><span class="text_highlight">8 TB</span> transfer limit</div>
			<div><span class="text_highlight">8 TB</span> storage space</div>
			<div><span class="text_highlight">File viewer branding</span></div>
		</div>
	</div>
	<div>
		<div class="cell_background" style="background-image: url('/res/img/benefit_4.webp');">
			Eternity<br/>
			{#if window.user.subscription.id === "patreon_4"}
			You have this plan<br/>
			Thank you for supporting pixeldrain!
			{:else}
			<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291528" class="button button_highlight round">
				€ 32
			</a>
			/ month
			{/if}
		</div>
		<div class="feat_pro features_cell">
			<div><span class="text_highlight">20 GB</span> max file size</div>
			<div><span class="text_highlight">Files never expire</span></div>
			<div><span class="text_highlight">16 TB</span> transfer limit</div>
			<div><span class="text_highlight">16 TB</span> storage space</div>
			<div><span class="text_highlight">File viewer branding</span></div>
		</div>
	</div>
	<div>
		<div class="cell_background" style="background-image: url('/res/img/benefit_6.webp');">
			Infinity<br/>
			{#if window.user.subscription.id === "patreon_6"}
			You have this plan<br/>
			Thank you for supporting pixeldrain!
			{:else}
			<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=6573749" class="button button_highlight round">
				€ 64
			</a>
			/ month
			{/if}
		</div>
		<div class="feat_pro features_cell round_br">
			<div><span class="text_highlight">20 GB</span> max file size</div>
			<div><span class="text_highlight">Files never expire</span></div>
			<div><span class="text_highlight">32 TB</span> transfer limit</div>
			<div><span class="text_highlight">32 TB</span> storage space</div>
			<div><span class="text_highlight">File viewer branding</span></div>
		</div>
	</div>
</div>

<style>
.feat_table {
	display: flex;
	flex-direction: column;
}
.feat_table > div {
	display: flex;
	flex-direction: row;
	min-height: 8em;
}
.feat_table > div > div:first-child {
	flex: 0 0 20%;
	max-width: 20%;
}
.feat_table > div > div {
	flex: 1 1 0;
	margin: 0.2em;
	padding: 0.5em;
	text-align: center;
	word-wrap: break-word;
	hyphens: auto;
}
.feat_table > div > .feat_pro {
	background-color: var(--card_color);
	border: 1px solid var(--highlight_color);
}
.text_highlight {
	font-weight: bold;
}
.feat_table > div > .cell_background {
	flex: 0 0 33%;
	min-width: 33%;
	border-top-left-radius: 0.5em;
	border-bottom-left-radius: 0.5em;
	background-position: center;
	background-size: cover;
	text-align: left;
	font-size: 1.2em;
	color: #ffffff;
	text-shadow: 1px 1px 2px #000000;
}

.feat_table > div > div.round_tr { border-top-right-radius:    0.5em; }
.feat_table > div > div.round_br { border-bottom-right-radius: 0.5em; }

.features_cell {
	display: flex;
	flex-wrap: wrap;
}
.features_cell > div {
	flex: 1 1 50%;
	min-width: 220px;
}
</style>
