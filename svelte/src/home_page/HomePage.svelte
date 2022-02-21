<script>
import FeatureTable from "./FeatureTable.svelte";
import OtherPlans from "./OtherPlans.svelte";
import UploadWidget from "./UploadWidget.svelte";

</script>
<header style="padding-bottom: 80px; padding-top: 80px;">
<picture>
	<source media="(max-width: 700px)" srcset="/res/img/header_orbitron.png">
	<img class="header_image" src="/res/img/header_orbitron_wide.png" alt="Header">
</picture>
</header>

<UploadWidget></UploadWidget>

<header>
	<h1>What is pixeldrain?</h1>
</header>

<section>
	<p>
		Pixeldrain is a file sharing website built for speed and ease of
		use. You can upload files you want to share online to our
		servers and we will hold on to them for at least a month. During
		this time anyone with the link will be able to download your
		files. Pixeldrain is built to be as fast as possible, so you
		don't have to do any unnecessary waiting when downloading files.
	</p>
	<p>
		Files can be uploaded by clicking the big green upload
		button, or by dragging them onto this page from your file
		manager.
	</p>
	<p>
		If you uploaded multiple files at once you can also create a
		list, which is a collection of files with one single link. Like
		a photo album, a music record or a video compilation. Click the
		'Create list with uploaded files' button after your uploads are
		complete. The files will be saved in the order you uploaded
		them.
	</p>
</section>
<header>
	<h1 id="pro">Getting more out of pixeldrain</h1>
</header>
<section>
	<p>
		By purchasing a subscription you support pixeldrain on its
		mission to make content sharing easier, safer and faster for
		everyone. The standard subscription plans use Patreon for
		payment processing. Check out our <a href="#prepaid">prepaid
		plans</a> if you would like to pay using cryptocurrencies.
	</p>
	<p>
		Pixeldrain uses
		<a href="https://en.wikipedia.org/wiki/Byte#Multiple-byte_units"
		target="_blank">SI standard units</a> for measuring file sizes.
		If you are using Microsoft Windows your files may appear smaller
		than they actually are.
	</p>
	<br/>
	<FeatureTable></FeatureTable>
	<br/>
	<div style="text-align: center;">
		Do you need even more time and space? Check out our other plans
	</div>
	<br/>
	<OtherPlans></OtherPlans>

	<h2 id="prepaid">Prepaid plans</h2>
	<p>
		You you need more bandwidth or storage space there's also
		prepaid plans. For prepaid we charge a base rate of €1 per
		month, the rest of the charges are usage based. We charge €4 per
		TB per month for storage space and €2 per TB for bandwidth
		usage. We accept Bitcoin, Lightning Network and Dogecoin
		payments.
	</p>
	<p>
		If €4 per TB of storage is too much we also have plans with
		cheaper storage and file expiry enabled. Your files will not
		expire as long as they generate traffic, so this can be a viable
		option if your files are accessed often.
	</p>
	<div style="text-align: center;">
		<img src="/res/img/coins.png" alt="supported coins" style="width: 250px;"/>
	</div>
	<p>
		To use prepaid you need to register a pixeldrain account. After
		logging in head to the <a href="/user/transactions">transactions
		page</a> to deposit your coins.
	</p>
</section>

<style>
.header_image{
	width: 100%;
	max-width: 800px;
	margin: auto;
}
</style>
