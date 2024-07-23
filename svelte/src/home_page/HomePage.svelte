<script>
import Menu from "../filesystem/Menu.svelte";
import Footer from "../layout/Footer.svelte";
import AddressReputation from "./AddressReputation.svelte";
import FeatureTable from "./FeatureTable.svelte";
import ForCreators from "./ForCreators.svelte";
import UploadLoginWall from "./UploadLoginWall.svelte";
</script>

<div class="page_content">
	<header class="header" style="text-align: initial">
		<div class="menu_button_container">
			<Menu no_login_label="Not logged in" hide_name={false} hide_logo style="color: #eeeeee;"/>
		</div>
		<div class="header_image_container"></div>
	</header>

	<AddressReputation/>

	<UploadLoginWall/>
</div>

<div class="page_content">
	<header>
		<h1>What is pixeldrain?</h1>
	</header>

	<section>
		<p>
			Pixeldrain is a file hosting website built for speed and ease of
			use. You can upload files you want to share online to our servers
			and we will hold on to them for at least four months. During this
			time anyone with the link will be able to download your files.
			Pixeldrain is built to be as fast as possible, so you don't have to
			do any unnecessary waiting when downloading files.
		</p>
		<h2>Privacy</h2>
		<p>
			Privacy is an important value for pixeldrain. There is too much
			tracking on the web nowadays. Pixeldrain goes in the other
			direction, this site does not contain any advertisements or third
			party tracking scripts. We don't even require you to enter an e-mail
			address to register an account.
		</p>
		<p>
			Not running ads does mean that we miss out on a lot of revenue of
			course. Running a site like this is a very expensive endeavour.
			Please consider supporting the project with one of the premium plans
			below.
		</p>
	</section>
</div>

<div class="page_content">
	<FeatureTable/>
</div>

<div class="page_content">
	<ForCreators/>
</div>

<Footer/>

<style>
.page_content {
	margin-top: 16px;
	margin-bottom: 16px;
}
@media (max-width: 1100px) {
	.page_content {
		margin-top: 0;
	}
}

header {
	background-image: url("/res/img/inflating_star.webp");
	background-repeat: no-repeat;
	background-attachment: fixed;
	background-position: center;
	background-size: cover;
	background-blend-mode: normal;
}
header > h1 {
	margin-top: 60px;
	margin-bottom: 60px;
	color: #ffffff;
	text-shadow: 0 0 3px #000000;
}

.header_image_container {
	text-align: initial;
	margin: auto;
	height: 150px;
	width: 500px;
	max-width: 100%;
	background-image: url("/res/img/header_orbitron.webp");
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
}
.menu_button_container {
	display: flex;
	justify-content: end;
	padding-right: 0.5em;
}
</style>
