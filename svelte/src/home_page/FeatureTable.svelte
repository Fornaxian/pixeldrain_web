<script>
import { onMount } from "svelte";
import Modal from "../util/Modal.svelte";

let file_expiry
let direct_linking

onMount(() => {
	if (window.location.hash === "#direct_linking" || window.location.hash === "#hotlinking") {
		direct_linking.toggle()
	}
})
</script>
<div class="feat_table">
	<div>
		<div></div>
		<div class="feat_normal round_tl">Free</div>
		<div class="feat_pro feat_highlight round_tr">Pro</div>
	</div>
	<div>
		<div class="feat_label">Size limit per file</div>
		<div class="feat_normal">10 GB per file (9.31 GiB)</div>
		<div class="feat_pro">
			<span class="text_highlight">20 GB</span> per file (18.63 GiB)
		</div>
	</div>
	<div>
		<div class="feat_label">
			File expiry
		</div>
		<div class="feat_normal">
			30 days after the last time it is viewed
		</div>
		<div class="feat_pro">
			<span class="text_highlight">90 days</span> after the last time it is viewed
			<br/>
			<button class="round" on:click={file_expiry.toggle}>
				<i class="icon">info</i>
				More information
			</button>
		</div>
	</div>
	<div>
		<div class="feat_label">
			Data transfer limit
		</div>
		<div class="feat_normal">
			5 GB data transfer per 24 hours. When this threshold is reached
			your download speed will be reduced to 512 kiB/s
		</div>
		<div class="feat_pro">
			Transfer limit of <span class="text_highlight">1 terabyte</span> per
			month. If the transfer limit is exceeded the restrictions of the
			free plan will apply
		</div>
	</div>
	<div>
		<div class="feat_label">
			Download speed
		</div>
		<div class="feat_normal">
			Up to 2 MiB/s, may be slower during busy periods
		</div>
		<div class="feat_pro">
			<span class="text_highlight">High priority</span>
			bandwidth for files you download and files on your
			account
		</div>
	</div>
	<div>
		<div class="feat_label">
			Hotlinking / embedding files
		</div>
		<div class="feat_normal">
			Hotlinking is not allowed, files which are being hotlinked will be
			blocked
		</div>
		<div class="feat_pro">
			<span class="text_highlight">Hotlinking is allowed</span> within
			your data cap
			<br/>
			<button class="round" on:click={direct_linking.toggle}>
				<i class="icon">info</i>
				More information
			</button>
		</div>
	</div>
	<div>
		<div class="feat_label">
			Adver&shy;tise&shy;ments
		</div>
		<div class="feat_normal">
			Banner advertisements on the file viewer page
		</div>
		<div class="feat_pro">
			<span class="text_highlight">No ads</span> on files
			you share. No ads when viewing files uploaded by
			other users
		</div>
	</div>
	<div>
		<div class="feat_label">Privacy</div>
		<div class="feat_normal">
			No trackers, but advertisers can see your IP address
			and browser fingerprint
		</div>
		<div class="feat_pro">
			<span class="text_highlight">Completely
			private</span>. No third party scripts and no
			logging
		</div>
	</div>
	<div>
		<div class="feat_label">
			Storage space
		</div>
		<div class="feat_normal">
			500 gigabytes
		</div>
		<div class="feat_pro">
			<span class="text_highlight">No storage limit</span>
		</div>
	</div>
	<div>
		<div class="feat_label">
			Online file previews
		</div>
		<div class="feat_normal">
			View image, audio, PDF and text files directly in your
			web browser
		</div>
		<div class="feat_pro">
			<span class="text_highlight">Video streaming</span> in
			your web browser. Free users will also be able to watch
			videos you uploaded
		</div>
	</div>
	<div>
		<div></div>
		<div class="feat_normal round_bl">Free</div>
		<div class="feat_pro feat_highlight round_br">
			{#if window.user.subscription.id === "patreon_1"}
				You have this plan<br/>
				Thank you for supporting pixeldrain!
			{:else}
				Only
				<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427" class="button button_highlight round">
					€ 2 per month
				</a>
				or
				<a href="https://www.patreon.com/join/pixeldrain/checkout?rid=5291427&cadence=12" class="button button_highlight round">
					€ 20 per year!
				</a>
				<br/>
				(Excluding tax)
				<br/>
				Subscription managed by Patreon
			{/if}
		</div>
	</div>
</div>

<Modal bind:this={file_expiry} title="File Expiry Postponing" padding>
	<p>
		Files on pixeldrain have to expire eventually. If we didn't do this the
		website would keep growing forever and we would run out of money pretty
		quickly.
	</p>
	<p>
		Unlike most other sharing sites pixeldrain uses a postponing system for
		expiring files. When a file is freshly uploaded it gets 30 days by
		default (90 days if you have the pro plan). After these 30 days we will
		check when the file was last viewed. Files which are regularly viewed
		could still bring new users to the platform, it would be rude to show
		these people a File Not Found page. So if the file was viewed in the
		last 30 days we will simply postpone the next check a month. If the file
		was not viewed however it will immediately be removed.
	</p>
	<p>
		Views are only counted when someone visits the download page in a web
		browser. This makes sure that users can see that the file comes from
		pixeldrain.
	</p>
	<p>
		This way we can minimize dead links, and you won't have to tell your
		friends to 'hurry and download this before it expires'.
	</p>
</Modal>

<Modal bind:this={direct_linking} title="Hotlinking Bandwidth" padding>
	<p>
		Paying for bandwidth is the most expensive part of running pixeldrain.
		Because of this we have to limit what can be downloaded and by who.
	</p>
	<p>
		Normally when you view a file it's on pixeldrain's file viewer. The file
		viewer is the page with the download button, the name of the file and a
		frame where you can view the file if it's an image, video, audio, PDF or
		text file.
	</p>
	<h3>Rate limiting</h3>
	<p>
		It's also possible to link directly to a file instead of the download
		page. This circumvents our advertisers and branding and thus we lose
		money when people do this. That's why I added 'hotlink protection mode'
		to files. This mode is enabled when a file has been downloaded five
		times more than it has been viewed through the file viewer. When hotlink
		protection mode is activated a file cannot be downloaded through the
		API, the request needs to come from the file viewer page. On the file
		viewer you will see a CAPTCHA to fill in when you click the download
		button.
	</p>
	<p>
		More information about <a
		href="https://en.wikipedia.org/wiki/Inline_linking"
		target="_blank">Hotlinking on Wikipedia</a>.
	</p>
	<h3>Hotlinking with a Pro subscription</h3>
	<p>
		When you have a Pro subscription you will get a monthly data transfer
		limit for all the files on your account combined. Files you download
		from pixeldrain are subtracted from the data cap. If you have <a
		href="/user/subscription">Bandwidth sharing</a>
		enabled your data cap is also used when other people download
		your files.
	</p>
	<p>
		In principle there is always someone who pays for the bandwidth usage
		when a file is being downloaded:
	</p>
	<ol>
		<li>
			If the person downloading the file has a Pro subscription their data
			cap is used.
		</li>
		<li>
			If the person who uploaded the file has a Pro subscription and
			Bandwidth sharing is enabled on their account, then the uploader's
			data cap is used.
		</li>
		<li>
			If neither the uploader nor the downloader has a Pro subscription
			the download will be supported by advertisements on the download
			page.
		</li>
	</ol>
	<p>
		The bandwidth cap on your account is a 30 day rolling window. This means
		that bandwidth usage will expire 30 days after it was used. Your counter
		will not reset at the start of the next month.
	</p>
	<p>
		When a list of files is downloaded with the 'DL all files' button each
		file in the resulting zip file will be counted separately.
	</p>
</Modal>

<style>
.feat_table {
	display: flex;
	flex-direction: column;
}
.feat_table > div {
	display: flex;
	flex-direction: row;
}
.feat_table > div > div:first-child {
	flex: 0 0 20%;
	max-width: 20%;
}
.feat_table > div > div {
	flex: 1 1 0;
	margin: 0.25em;
	padding: 0.5em;
	text-align: center;
	word-wrap: break-word;
	hyphens: auto;
}
.feat_table > div > .feat_label {
	border-top-left-radius: 0.5em;
	border-bottom-left-radius: 0.5em;
	background-color: var(--layer_1_color);
	color: var(--layer_1_text_color);
}
.feat_table > div > .feat_normal {
	background-color: var(--layer_3_color);
	box-shadow: 1px 1px 4px -2px var(--shadow_color);
}
.feat_table > div > .feat_pro {
	background-color: var(--layer_4_color);
	box-shadow: 1px 1px 4px -1px var(--shadow_color);
}
.feat_table > div > .feat_highlight {
	border: 1px solid var(--link_color)
}
.text_highlight {
	color: var(--link_color);
	font-size: 1.1em;
	font-weight: bold;
}

.feat_table > div > div.round_tl { border-top-left-radius:     0.5em; }
.feat_table > div > div.round_tr { border-top-right-radius:    0.5em; }
.feat_table > div > div.round_br { border-bottom-right-radius: 0.5em; }
.feat_table > div > div.round_bl { border-bottom-left-radius:  0.5em; }
</style>
