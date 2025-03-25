package webcontroller

import (
	"fmt"
	"html/template"
	"net/http"

	"fornaxian.tech/log"
	"fornaxian.tech/pixeldrain_api_client/pixelapi"
	"github.com/julienschmidt/httprouter"
)

// formAPIError makes it easier to display errors returned by the pixeldrain
// API. TO make use of this function the form fields should be named exactly the
// same as the API parameters
func formAPIError(err error, f *Form) {
	fieldLabel := func(name string) string {
		for _, v := range f.Fields {
			if v.Name == name {
				return v.Label
			}
		}
		return name
	}

	if apierr, ok := err.(pixelapi.Error); ok {
		if apierr.StatusCode == "multiple_errors" {
			for _, err := range apierr.Errors {
				// Modify the message to make it more user-friendly
				if err.StatusCode == "string_out_of_range" {
					err.Message = fmt.Sprintf(
						"%s is too long or too short. Should be between %v and %v characters. Current length: %v",
						fieldLabel(err.Extra["field"].(string)),
						err.Extra["min_len"],
						err.Extra["max_len"],
						err.Extra["len"],
					)
				} else if err.StatusCode == "field_contains_illegal_character" {
					err.Message = fmt.Sprintf(
						"Character '%v' is not allowed in %s",
						err.Extra["char"],
						fieldLabel(err.Extra["field"].(string)),
					)
				}

				f.SubmitMessages = append(f.SubmitMessages, template.HTML(err.Message))
			}
		} else {
			f.SubmitMessages = append(f.SubmitMessages, template.HTML(apierr.Message))
		}
	} else {
		log.Error("Error submitting form: %s", err)
		f.SubmitMessages = []template.HTML{"Internal Server Error"}
	}
}

func (wc *WebController) serveLogout(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	if key, err := wc.getAPIKey(r); err == nil {
		var api = wc.api.Login(key)
		if err = api.DeleteUserSession(key); err != nil {
			log.Warn("logout failed for session '%s': %s", key, err)
		}
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func (wc *WebController) passwordResetForm(td *TemplateData, r *http.Request) (f Form) {
	f = Form{
		Name:  "password_reset",
		Title: "Recover lost password",
		Fields: []Field{
			{
				Name:  "email",
				Label: "E-mail address",
				Description: `we will send a password reset link to this e-mail
					address`,
				Type: FieldTypeEmail,
			}, {
				Name:  "recaptcha_response",
				Label: "Turing test (click the white box)",
				Description: "the reCaptcha turing test verifies that you " +
					"are not an evil robot that is trying hijack accounts",
				Type:           FieldTypeCaptcha,
				CaptchaSiteKey: wc.captchaKey(),
			},
		},
		SubmitLabel: "Submit",
	}

	if f.ReadInput(r) {
		if err := td.PixelAPI.PutUserPasswordReset(
			f.FieldVal("email"),
			f.FieldVal("recaptcha_response"),
		); err != nil {
			formAPIError(err, &f)
		} else {
			f.SubmitSuccess = true
			f.SubmitMessages = []template.HTML{
				"Success! Check your inbox for instructions to reset your password",
			}
		}
	}
	return f
}

func (wc *WebController) passwordResetConfirmForm(td *TemplateData, r *http.Request) (f Form) {
	f = Form{
		Name:  "password_reset_confirm",
		Title: "Reset lost password",
		Fields: []Field{
			{
				Name:  "new_password",
				Label: "Password",
				Type:  FieldTypeNewPassword,
			}, {
				Name:  "new_password2",
				Label: "Password again",
				Description: "you need to enter your password twice so we " +
					"can verify that no typing errors were made, which would " +
					"prevent you from logging into your new account",
				Type: FieldTypeNewPassword,
			},
		},
		SubmitLabel: "Submit",
	}

	var resetKey = r.FormValue("key")
	if resetKey == "" {
		f.SubmitSuccess = false
		f.SubmitMessages = []template.HTML{"Password reset key required"}
		return f
	}

	if f.ReadInput(r) {
		if f.FieldVal("new_password") != f.FieldVal("new_password2") {
			f.SubmitMessages = []template.HTML{
				"Password verification failed. Please enter the same " +
					"password in both password fields"}
			return f
		}

		if err := td.PixelAPI.PutUserPasswordResetConfirm(resetKey, f.FieldVal("new_password")); err != nil {
			formAPIError(err, &f)
		} else {
			f.SubmitSuccess = true
			f.SubmitMessages = []template.HTML{
				`Success! You can now <a href="/login">log in</a> with your new password`,
			}
		}
	}
	return f
}

func (wc *WebController) serveEmailConfirm(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	var err error
	var status string

	err = wc.api.PutUserEmailResetConfirm(r.FormValue("key"))
	if err != nil && err.Error() == "not_found" {
		status = "not_found"
	} else if err != nil {
		log.Debug("E-mail reset fail: %s", err)
		status = "internal_error"
	} else {
		status = "success"
	}

	td := wc.newTemplateData(w, r)
	td.Other = status

	wc.templates.Run(w, r, "email_confirm", td)
}
