<script>
import Euro from "../../util/Euro.svelte";
import { formatDataVolume, formatDate } from "../../util/Formatting.svelte";

export let row = {}
</script>

<table>
	<tr>
		<td>Username</td>
		<td>{row.user.username}</td>
	</tr>
	<tr>
		<td>ID</td>
		<td>{row.user_id}</td>
	</tr>
	<tr>
		<td>Email</td>
		<td>{row.user.email}</td>
	</tr>
	<tr>
		<td>Subscription</td>
		<td>{row.user.subscription.name}</td>
	</tr>
	<tr>
		<td>Credit balance</td>
		<td><Euro amount={row.user.balance_micro_eur}/></td>
	</tr>
	<tr>
		<td>Storage used</td>
		<td>{formatDataVolume(row.user.storage_space_used, 3)}</td>
	</tr>
	<tr>
		<td>FS Storage used</td>
		<td>{formatDataVolume(row.user.filesystem_storage_used, 3)}</td>
	</tr>
</table>
<br/>
<div class="table_scroll">
	<table>
		<tr>
			<td>Reason</td>
			<td>Reporter</td>
			<td>Ban time</td>
			<td>Expire time</td>
			<td>File</td>
		</tr>
		{#each row.offences as offence (offence.ban_time)}
			<tr>
				<td>{offence.reason}</td>
				<td>{offence.reporter}</td>
				<td>{formatDate(offence.ban_time, true, true, false)}</td>
				<td>{formatDate(offence.expire_time, true, true, false)}</td>
				<td>
					{#if offence.file_link}
						<a href={offence.file_link} target="_blank" rel="noreferrer">
							{offence.file_name}
						</a>
					{/if}
				</td>
			</tr>
		{/each}
	</table>
</div>
