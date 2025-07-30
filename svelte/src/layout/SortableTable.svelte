<script lang="ts" context="module">
export enum FieldType {
	Text,
	Bytes,
	Bits,
	Number,
	Euro,
	HTML,
	Func,
}
export type SortColumn = {
	field: string,
	label: string,
	type: FieldType,
	func?: (val: any) => string
};
</script>
<script lang="ts">
import SortButton from "layout/SortButton.svelte";
import Euro from "util/Euro.svelte";
import { formatDataVolume, formatDataVolumeBits, formatThousands } from "util/Formatting";

export let index_field = ""
export let rows = [];
export let columns: SortColumn[] = []
export let sort_field = index_field
export let totals = false

let asc = true
const sort = (field: string) => {
	if (field !== "" && field === sort_field) {
		asc = !asc
	}
	if (field === "") {
		field = sort_field
	}
	sort_field = field

	console.log("sorting by", field, "asc", asc)
	rows.sort((a, b) => {
		if (typeof (a[field]) === "number") {
			// Sort ints from high to low
			if (asc) {
				return a[field] - b[field]
			} else {
				return b[field] - a[field]
			}
		} else {
			// Sort strings alphabetically
			if (asc) {
				return a[field].localeCompare(b[field])
			} else {
				return b[field].localeCompare(a[field])
			}
		}
	})
	rows = rows
}
</script>

<div class="table_scroll">
	<table>
		<thead>
			<tr>
				{#each columns as col (col.field)}
					<td>
						<SortButton field={col.field} active_field={sort_field} asc={asc} sort_func={sort}>
							{col.label}
						</SortButton>
					</td>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row[index_field])}
				<tr>
					{#each columns as col (col.field)}
						{#if col.type === FieldType.Text}
							<td>{row[col.field]}</td>
						{:else if col.type === FieldType.Bytes}
							<td class="number_cell">{formatDataVolume(row[col.field], 3)}</td>
						{:else if col.type === FieldType.Bits}
							<td class="number_cell">{formatDataVolumeBits(row[col.field], 3)}</td>
						{:else if col.type === FieldType.Number}
							<td class="number_cell">{formatThousands(row[col.field])}</td>
						{:else if col.type === FieldType.Euro}
							<td class="number_cell"><Euro amount={row[col.field]}/></td>
						{:else if col.type === FieldType.Func}
							<td>{@html col.func(row[col.field])}</td>
						{:else if col.type === FieldType.HTML}
							<td>{@html row[col.field]}</td>
						{/if}
					{/each}
				</tr>
			{/each}
			{#if totals === true}
				<tr>
					{#each columns as col (col.field)}
						{#if col.field === index_field}
							<td>Total</td>
						{:else if col.type === FieldType.Bytes}
							<td class="number_cell">{formatDataVolume(rows.reduce((acc, val) => acc+val[col.field], 0), 3)}</td>
						{:else if col.type === FieldType.Bits}
							<td class="number_cell">{formatDataVolumeBits(rows.reduce((acc, val) => acc+val[col.field], 0), 3)}</td>
						{:else if col.type === FieldType.Number}
							<td class="number_cell">{formatThousands(rows.reduce((acc, val) => acc+val[col.field], 0))}</td>
						{:else if col.type === FieldType.Euro}
							<td class="number_cell"><Euro amount={rows.reduce((acc, val) => acc+val[col.field], 0)}/></td>
						{:else}
							<td></td>
						{/if}
					{/each}
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<style>
table {
	width: auto;
	min-width: auto;
}
.table_scroll {
	margin: auto;
	text-align: initial;
}
tr {
	text-align: initial;
}
.number_cell {
	text-align: right;
	font-family: monospace;
}
</style>
