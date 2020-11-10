<script>
	import Modal from '../util/Modal.svelte';
	let modal1;
	let modal2;
	let modal3;
</script>

<button on:click={modal1.show}>
	show modal
</button>

<br/>

<Modal bind:this={modal3} title="Third modal" width="700px">
	<img src="https://pixeldrain.com/res/img/header_orbitron_wide.png" alt="logo" style="max-width: 100%;"/>
</Modal>
<Modal bind:this={modal2} title="Wat!" width="1000px">
	<ol class="definition-list">
		<li>of or relating to modality in logic</li>
		<li>containing provisions as to the mode of procedure or the manner of taking effect —used of a contract or legacy</li>
		<li>of or relating to a musical mode</li>
		<li>of or relating to structure as opposed to substance</li>
		<li><button on:click={modal3.show}>third modal</button></li>
		<li>of, relating to, or constituting a grammatical form or category characteristically indicating predication</li>
		<li>of or relating to a statistical mode</li>
	</ol>

	<a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
</Modal>

<Modal bind:this={modal1} title="Hello!">
	<ol class="definition-list">
		<li>of or relating to modality in logic</li>
		<li>containing provisions as to the mode of procedure or the manner of taking effect —used of a contract or legacy</li>
		<li>of or relating to a musical mode</li>
		<li>of or relating to structure as opposed to substance</li>
		<li>of, relating to, or constituting a grammatical form or category characteristically indicating predication</li>
		<li>of or relating to a statistical mode</li>
	</ol>

	<a href="https://www.merriam-webster.com/dictionary/modal">merriam-webster.com</a>
	<br/>

	<button on:click={modal2.show}>show modal</button>
</Modal>
