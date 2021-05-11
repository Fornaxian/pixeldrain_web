function AbuseReportWindow(viewer) {
	this.viewer = viewer
	this.visible = false
	this.modal = new Modal(
		document.getElementById("file_viewer"),
		() => { this.toggle() },
		"Report abuse", "600px", "auto",
	)

	this.btnReportAbuse = document.getElementById("btn_report_abuse")
	this.btnReportAbuse.addEventListener("click", () => { this.toggle() })

	let clone = document.getElementById("tpl_report_abuse_popup").content.cloneNode(true)
	this.form = clone.querySelector(".abuse_type_form")
	// this.emailField = clone.querySelector(".abuse_email_field")
	this.notification = clone.querySelector(".abuse_report_notification")
	this.modal.setBody(clone)

	this.form.addEventListener("submit", e => { this.submit(e) })
}

AbuseReportWindow.prototype.toggle = function () {
	if (this.visible) {
		this.modal.close()
		this.btnReportAbuse.classList.remove("button_highlight")
		this.visible = false
	} else {
		this.modal.open()
		this.btnReportAbuse.classList.add("button_highlight")
		this.visible = true
	}
}

AbuseReportWindow.prototype.notify = function (success, content) {
	this.notification.style.display = ""
	this.notification.classList = "abuse_report_notification " + (success ? "highlight_green" : "highlight_red")
	this.notification.innerHTML = content
}

AbuseReportWindow.prototype.submit = async function (e) {
	e.preventDefault()

	let abuseType = ""
	this.form.querySelectorAll('[name="abuse_type"]').forEach(elem => {
		if (elem.checked) {
			abuseType = elem.value
		}
	})

	if (abuseType === "") {
		this.notify(false, "Please select an abuse type")
		return
	}

	const form = new FormData()
	form.append("type", abuseType)
	// form.append("email", this.emailField.value)

	try {
		const resp = await fetch(
			this.viewer.file.get_href + "/report_abuse",
			{ method: "POST", body: form }
		);
		if (resp.status >= 400) {
			let json = await resp.json()
			if (json.value === "resource_already_exists") {
				throw "You have already reported this file"
			} else if (json.value === "file_already_blocked") {
				throw "This file has already been blocked"
			} else if (json.value === "multiple_errors") {
				throw json.errors[0].message
			}
			throw json.message
		}

		this.notify(true, "Report has been sent")
	} catch (err) {
		this.notify(false, "Failed to send report: " + err)
	}
}
