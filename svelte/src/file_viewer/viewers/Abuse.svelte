<script>
export const set_file = f => file = f
let file = {
	id: "",
	name: "",
	abuse_type: "",
	abuse_reporter_name: "",
}
</script>

<br/>
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
	display: inline-block;
	max-width: 100%;
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 16px;
	padding: 8px;
}
</style>
