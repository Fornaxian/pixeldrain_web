<script>
let sequence = [
	"ArrowUp",
	"ArrowUp",
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"b",
	"a",
]
let index = 0

const keypress = e => {
	if (e.key === sequence[index]) {
		index++
	} else {
		index = 0
	}

	if (index === sequence.length) {
		index = 0
		let audio = new Audio("/res/misc/amogus.opus")
		audio.play()
	}
}
</script>

<svelte:window on:keydown={keypress} />
