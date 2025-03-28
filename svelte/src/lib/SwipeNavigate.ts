// Dead zone before the swipe action gets detected
const swipe_inital_offset = 25
// Amount of pixels after which the navigation triggers
const swipe_trigger_offset = 75

export const swipe_nav = (
	node: HTMLElement,
	props: {
		enabled: boolean,
		prev: boolean,
		next: boolean,
		on_prev: () => void,
		on_next: () => void,
	},
) => {
	let start_x = 0
	let start_y = 0
	let render_offset = 0
	let enabled = props.enabled === undefined ? true : props.enabled
	let prev = props.prev === undefined ? true : props.prev
	let next = props.next === undefined ? true : props.next

	const touchstart = (e: TouchEvent) => {
		start_x = e.touches[0].clientX
		start_y = e.touches[0].clientY
		render_offset = 0
	}

	const touchmove = (e: TouchEvent) => {
		const offset_x = e.touches[0].clientX - start_x
		if (!enabled || (offset_x < 0 && !next) || (offset_x > 0 && !prev)) {
			return
		}

		const abs_x = Math.abs(offset_x)
		const abs_y = Math.abs(e.touches[0].clientY - start_y)
		const neg = offset_x < 0 ? -1 : 1

		// The cursor must have moved at least 50 pixels and three times as much
		// on the x axis than the y axis for it to count as a swipe
		if (abs_x > swipe_inital_offset && abs_y < abs_x / 3) {
			set_offset((abs_x - swipe_inital_offset) * neg, false)
		} else {
			set_offset(0, true)
		}
	}

	const touchend = (e: TouchEvent) => {
		if (!enabled) {
			return
		}

		if (render_offset > swipe_trigger_offset) {
			set_offset(1000, true)
			props.on_prev()
		} else if (render_offset < -swipe_trigger_offset) {
			set_offset(-1000, true)
			props.on_next()
		} else {
			set_offset(0, true)
		}
	}

	const set_offset = (off: number, animate: boolean) => {
		render_offset = off

		if (off === 0) {
			// Clear the transformation if the offset is zero
			node.style.transform = ""
			node.style.transition = ""
		} else {
			node.style.transform = "translateX(" + off + "px)"
			if (animate) {
				node.style.transition = "transform 400ms"
			}
		}
	}

	node.addEventListener("touchstart", touchstart)
	node.addEventListener("touchmove", touchmove)
	node.addEventListener("touchend", touchend)

	// Get the child image so we can listen for the loaded event. When the
	// loaded event fires we clear the transformations so that the image appears
	// in the original position again
	for (let i = 0; i < node.childNodes.length; i++) {
		const child = node.childNodes.item(i)
		if (child instanceof HTMLImageElement) {
			child.addEventListener("load", () => set_offset(0, false))
		}
	}

	return {
		update(props: { enabled: boolean, prev: boolean, next: boolean }) {
			enabled = props.enabled === undefined ? true : props.enabled
			prev = props.prev === undefined ? true : props.prev
			next = props.next === undefined ? true : props.next
			set_offset(0, false)
		},
		destroy() {
			node.removeEventListener("touchstart", touchstart)
			node.removeEventListener("touchmove", touchmove)
			node.removeEventListener("touchend", touchend)
		}
	}
}
