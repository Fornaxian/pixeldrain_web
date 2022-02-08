<script>
import TextBlock from "./TextBlock.svelte"

export const set_file = f => file = f
let file = {
	id: "",
	name: "",
	abuse_type: "",
	abuse_reporter_name: "",
}
</script>

<br/>
<TextBlock center={true}>
	<h1>Unavailable for legal reasons</h1>
	<p>
		This file has received an abuse report and was taken down.
	</p>
	<p>
		Type of abuse: {file.abuse_type}. Reporter: {file.abuse_reporter_name}.
	</p>
</TextBlock>
