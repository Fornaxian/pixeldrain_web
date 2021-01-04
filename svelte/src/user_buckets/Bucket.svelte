<script>

export let bucket
let details_hidden = true
const expand_bucket = () => {
	details_hidden = !details_hidden
}

</script>

<div class="bucket">
	<div class="bucket_header">
		<a href={'/d/' + bucket.id} class="bucket_title">
			<img class="bucket_icon" src="/res/img/mime/folder-remote.png" alt="Bucket icon"/>
			{bucket.name}
		</a>
		<button class="bucket_expand" on:click={expand_bucket}>
			{#if details_hidden}
			<i class="icon">expand_more</i>
			{:else}
			<i class="icon">expand_less</i>
			{/if}
		</button>
	</div>
	<div class="bucket_details" class:hidden={details_hidden}>
		<form>
			<table class="form">
				<tr class="form">
					<td>Name</td>
					<td><input type="text" value={bucket.name} /></td>
				</tr>
				<tr class="form">
					<td colspan="2">
						<button class="button_red">
							<i class="icon">delete</i> Delete
						</button>
						<button class="button_highlight" style="float: right;">
							<i class="icon">save</i> Save
						</button>
					</td>
				</tr>
			</table>
		</form>
	</div>
</div>

<style>
.bucket {
	text-decoration: none;
	background-color: var(--layer_3_color);
	transition: box-shadow 0.5s;
	box-shadow: 1px 1px var(--layer_3_shadow) 0 var(--shadow_color);
}
.bucket_header {
	display: flex;
	flex-direction: row;
	color: var(--text_color);
}
.bucket_header:hover {
	background-color: var(--input_color_dark)
}
.bucket_title {
	flex: 1 1 auto;
	align-self: center;
	display: block;
	text-decoration: none;
}
.bucket_icon {
	height: 32px;
	width: 32px;
	margin: 4px;
	vertical-align: middle;
}
.bucket_expand {
	flex: 0 0 auto;
}
.bucket_details {
	display: flex;
	padding: 0.4em;
	flex-direction: column;
	text-decoration: none;
	border-top: 1px solid var(--layer_3_color_border);
	color: var(--text_color);
}
.hidden {
	display: none;
}
</style>
