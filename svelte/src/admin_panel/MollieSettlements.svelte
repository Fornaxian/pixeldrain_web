<script>
import { onMount } from "svelte";
import { formatDate } from "util/Formatting.svelte";
import Expandable from "util/Expandable.svelte";
import LoadingIndicator from "util/LoadingIndicator.svelte";
import Euro from "util/Euro.svelte";
import MollieSettlement from "./MollieSettlement.svelte";
import { mollie_proxy_call } from "./MollieAPI.js";

let loading = true
let response = {}
let settlements = []

const get_settlements = async () => {
	loading = true;
	try {
		const req = await mollie_proxy_call("settlements?limit=250");
		if(req.status >= 400) {
			throw new Error(req.text());
		}
		response = await req.json()
		settlements = response._embedded.settlements
	} catch (err) {
		alert(err);
	} finally {
		loading = false;
	}
};

onMount(get_settlements);
</script>

<LoadingIndicator loading={loading}/>

<section>
	{#each settlements as row (row.id)}
		<Expandable click_expand>
			<div slot="header" class="header">
				<div class="title">{row.id}</div>
				<div class="stats">
					Date<br/>
					{formatDate(row.createdAt, false, false, false)}
				</div>
				<div class="stats">
					Amount<br/>
					<Euro amount={row.amount.value*1e6}/>
				</div>
				<div class="stats">
					Status<br/>
					{row.status}
				</div>
			</div>

			<MollieSettlement settlement={row}/>
		</Expandable>
	{/each}
</section>

<style>
.header {
	display: flex;
	flex-direction: row;
	line-height: 1.2em;
}
.title {
	flex: 1 1 auto;
	align-self: center;
	word-break: break-all;
	padding-left: 8px;
}
.stats {
	flex: 0 0 auto;
	padding: 0 4px;
	border-left: 1px solid var(--separator);
	text-align: center;
}
</style>
