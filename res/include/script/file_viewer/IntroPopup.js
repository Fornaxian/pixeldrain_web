function IntroPopup() {
	if (localStorage.getItem("viewer_intro_popup_dismissed") === "🍆") {
		return
	}

	let btnHome = document.getElementById("button_home")

	this.popup = document.createElement("div")
	this.popup.classList = "intro_popup"
	this.moveToElement(btnHome)

	let clone = document.getElementById("intro_popup").content.cloneNode(true)
	clone.querySelector(".intro_popup_close").addEventListener("click", () => { this.close() })
	this.popup.append(clone)

	document.getElementById("file_viewer").append(this.popup)

	// Sometimes the layout is not correctly calculated yet when this script
	// runs. We adjust the values later
	setTimeout(() => { this.moveToElement(btnHome) }, 100)
}

IntroPopup.prototype.moveToElement = function (el) {
	let rect = el.getBoundingClientRect()
	this.popup.style.top = (rect.top + el.offsetHeight + 20) + "px"
	this.popup.style.left = (rect.left + (el.clientWidth / 2) - 30) + "px"
}

IntroPopup.prototype.close = function () {
	localStorage.setItem("viewer_intro_popup_dismissed", "🍆")
	this.popup.style.opacity = 0

	setTimeout(() => { this.popup.remove() }, 500)
}
