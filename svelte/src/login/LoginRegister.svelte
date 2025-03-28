<script lang="ts">
import Login from "./Login.svelte";
import Register from "./Register.svelte";

const finish_login = async () => {
	location.reload()
}

let page = "login"
</script>
<div class="tab_bar">
	<button on:click={() => page = "login"} class:button_highlight={page === "login"}>
		<i class="icon small">login</i>
		<span>Login</span>
	</button>

	<button on:click={() => page = "register"} class:button_highlight={page === "register"}>
		<i class="icon small">how_to_reg</i>
		<span>Register</span>
	</button>
</div>

<div class="page_content">
	{#if page === "login"}
		<Login on:login={finish_login}/>
	{:else if page === "register"}
		<Register on:login={finish_login}/>
	{/if}
</div>

<style>
.tab_bar > button {
	width: 40%;
	max-width: 10em;
	font-size: 1.3em;
	justify-content: center;
}
</style>
