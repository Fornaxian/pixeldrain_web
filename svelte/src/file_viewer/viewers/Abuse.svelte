<script>
export let file = {
	id: "",
	name: "",
	abuse_type: "",
	abuse_reporter_name: "",
}
</script>

<div class="container">
	<h1>Unavailable for legal reasons</h1>
	<p>
		This file has received an abuse report and was taken down.
	</p>
	<p>
		Type of abuse: {file.abuse_type}. Reporter: {file.abuse_reporter_name}.
	</p>
</div>

<style>
.container {
	position: relative;
	display: block;
	height: 100%;
	width: 100%;
	text-align: center;
	overflow: hidden;
}
</style>
