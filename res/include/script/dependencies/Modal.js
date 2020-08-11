
let modal_global_index = 100

// Modal creates a new modal window and shows it. The width and height are will
// be adjusted to the screen size. Content should be added to the `body`
// property
function Modal(parent, closeCallback, title, width, height) {
	this.parent        = parent
	this.closeCallback = closeCallback
	this.title         = title
	this.width         = width
	this.height        = height
	this.visible       = false

	this.background = document.createElement("div")
	this.background.classList = "modal_background"
	this.background.addEventListener("click", e => { this.close() })

	this.window = document.createElement("div")
	this.window.classList    = "modal_window"
	this.window.style.width  = this.width
	this.window.style.height = this.height
	this.window.addEventListener("click", e => { e.stopPropagation() })

	this.header = document.createElement("div")
	this.header.classList   = "modal_header highlight_1"

	this.titleDiv = document.createElement("div")
	this.titleDiv.classList = "modal_title"
	this.titleDiv.innerText = this.title

	this.btnClose = document.createElement("button")
	this.btnClose.classList = "modal_btn_close button_red"
	this.btnClose.innerHTML = '<i class="icon small">close</i>'
	this.btnClose.addEventListener("click", e => { this.close() })

	this.body = document.createElement("div")
	this.body.classList = "modal_body"

	// And add all the elements to eachother.
	this.header.append(this.titleDiv)
	this.header.append(this.btnClose)
	this.window.append(this.header)
	this.window.append(this.body)
	this.background.append(this.window)
}

Modal.prototype.setTitle = function(title) {
	this.title = title
	this.titleDiv.innerText = title
}

Modal.prototype.setBody = function(element) {
	this.body.innerHTML = ""
	this.body.append(element)
}

Modal.prototype.cloneTemplate = function(templateID) {
	this.setBody(document.getElementById(templateID).content.cloneNode(true))
}

Modal.prototype.open = function() {
	if (this.visible) { return }
	this.visible = true

	console.debug("Showing modal "+this.title)

	// Each time a modal is shown it gets a z-index which is one higher of the
	// previous one. This makes sure they are always shown and closed in order
	this.background.style.zIndex = modal_global_index
	modal_global_index++

	this.parent.prepend(this.background)

	// If an element is created and shown in the same frame it won't render the
	// transition. So here we wait for a few frames to make it visible
	this.background.style.display = ""
	setTimeout(() => { this.background.style.opacity = 1 }, 40)

	// This is a workaround for a chrome bug which makes it so hidden
	// windows can't be scrolled after they are shown
	this.body.focus()
}

Modal.prototype.close = function() {
	if (!this.visible) { return }
	this.visible = false

	if (this.closeCallback) {
		this.closeCallback()
	}

	// First we make it invisible with a transition. When we remove it so the
	// user can click through it
	this.background.style.opacity = 0

	// Wait for the animation to finish and remove the window
	setTimeout(() => {this.parent.removeChild(this.background)}, 400)
}
