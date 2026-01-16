<script>
import Expandable from "util/Expandable.svelte";
</script>

<section>
	<Expandable click_expand>
		<div slot="header" class="header">
			Pixeldrain's file expiry rules are changing! Click for more details
		</div>
		<p>
			Pixeldrain is getting pretty close to running out of storage space.
			If the rate of growth holds on, the site will be full in about two
			months. I can't order more storage capacity because I'm still
			financially recovering from the last storage expansion. And the cost
			of server hardware has absolutely exploded over the past few months.
		</p><p>
			For this reason I will be reducing the expiry time for files
			uploaded on free and Pro accounts. The file expiry for free users
			will be reduced from 120 days to 60 days. And, to keep the 2x ratio
			with the free plan, the expiry time for Pro accounts will be reduced
			from 240 days to 120 days. The new file expiry times will affect all
			files on Pixeldrain, even those uploaded before the new limits are
			imposed.
		</p><p>
			File expiry only happens for files uploaded on the home page or
			dashboard of the site, these are the files which show up on the My
			Files page. This mechanism does not apply for files uploaded to the
			premium Filesystem, files uploaded there do not expire at all.
		</p><p>
			The maximum size for files on free accounts will also be reduced
			from 20 GB to 10 GB. Files which are larger than the new limit of 10
			GB and were uploaded before the change are unaffected. The file size
			limit of 100 GB for all premium users will not change.
		</p><p>
			These changes will be applied on <b>26 january 2026</b>.
		</p>
	</Expandable>
</section>

<style>
.header {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	border-radius: 6px;
	background-color: rgba(255, 255, 0, 0.2);
}
</style>
