package webcontroller

import (
	"html/template"
	"net/http"

	"fornaxian.com/pixeldrain-web/pixelapi"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) serveUserSettings(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	td := wc.newTemplateData(w, r)

	if !td.Authenticated {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	td.Title = "Account settings"
	td.Other = struct {
		PasswordForm Form
		EmailForm    Form
		UsernameForm Form
	}{
		PasswordForm: wc.passwordForm(td, r),
		EmailForm:    wc.emailForm(td, r),
		UsernameForm: wc.usernameForm(td, r),
	}
	wc.templates.Get().ExecuteTemplate(w, "user_settings", td)
}

func (wc *WebController) passwordForm(td *TemplateData, r *http.Request) (f Form) {
	f = Form{
		Name:  "password_change",
		Title: "Change password",
		Fields: []Field{
			{
				Name:  "old_password",
				Label: "Old Password",
				Type:  FieldTypeCurrentPassword,
			}, {
				Name:  "new_password1",
				Label: "New Password",
				Type:  FieldTypeNewPassword,
			}, {
				Name:  "new_password2",
				Label: "New Password again",
				Description: "we need you to repeat your password so you " +
					"won't be locked out of your account if you make a " +
					"typing error",
				Type: FieldTypeNewPassword,
			},
		},
		SubmitLabel: "Submit",
	}

	if f.ReadInput(r) {
		if f.FieldVal("new_password1") != f.FieldVal("new_password2") {
			f.SubmitMessages = []template.HTML{
				"Password verification failed. Please enter the same " +
					"password in both new password fields"}
			return f
		}

		// Passwords match, send the request and fill in the response in the
		// form
		if err := td.PixelAPI.UserPasswordSet(
			f.FieldVal("old_password"),
			f.FieldVal("new_password1"),
		); err != nil {
			if apiErr, ok := err.(pixelapi.Error); ok {
				f.SubmitMessages = []template.HTML{template.HTML(apiErr.Message)}
			} else {
				log.Error("%s", err)
				f.SubmitMessages = []template.HTML{"Internal Server Error"}
			}
		} else {
			// Request was a success
			f.SubmitSuccess = true
			f.SubmitMessages = []template.HTML{"Success! Your password has been updated"}
		}
	}
	return f
}

func (wc *WebController) emailForm(td *TemplateData, r *http.Request) (f Form) {
	f = Form{
		Name:  "email_change",
		Title: "Change e-mail address",
		Fields: []Field{
			{
				Name:  "new_email",
				Label: "New e-mail address",
				Description: "we will send an e-mail to the new address to " +
					"verify that it's real. The address will be saved once " +
					"the link in the message is clicked. If the e-mail " +
					"doesn't arrive right away please check your spam box too",
				Type: FieldTypeEmail,
			},
		},
		SubmitLabel: "Submit",
	}

	if f.ReadInput(r) {
		if err := td.PixelAPI.UserEmailReset(
			f.FieldVal("new_email"),
			false,
		); err != nil {
			if apiErr, ok := err.(pixelapi.Error); ok {
				f.SubmitMessages = []template.HTML{template.HTML(apiErr.Message)}
			} else {
				log.Error("%s", err)
				f.SubmitMessages = []template.HTML{"Internal Server Error"}
			}
		} else {
			// Request was a success
			f.SubmitSuccess = true
			f.SubmitMessages = []template.HTML{"Success! E-mail sent"}
		}
	}
	return f
}

func (wc *WebController) serveEmailConfirm(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	var status string
	if key, err := wc.getAPIKey(r); err == nil {
		api := pixelapi.New(wc.apiURLInternal)
		api.APIKey = key
		err = api.UserEmailResetConfirm(r.FormValue("key"))
		if err != nil && err.Error() == "not_found" {
			status = "not_found"
		} else if err != nil {
			status = "internal_error"
		} else {
			status = "success"
		}
	}

	td := wc.newTemplateData(w, r)
	td.Other = status

	wc.templates.Get().ExecuteTemplate(w, "email_confirm", td)
}

func (wc *WebController) usernameForm(td *TemplateData, r *http.Request) (f Form) {
	f = Form{
		Name:  "username_change",
		Title: "Change username",
		Fields: []Field{
			{
				Name:  "new_username",
				Label: "New username",
				Description: "changing your username also changes the name " +
					"used to log in. If you forget your username you can " +
					"still log in using your e-mail address if you have one " +
					"configured",
				Type: FieldTypeUsername,
			},
		},
		SubmitLabel: "Submit",
	}

	if f.ReadInput(r) {
		if err := td.PixelAPI.UserSetUsername(f.FieldVal("new_username")); err != nil {
			if apiErr, ok := err.(pixelapi.Error); ok {
				f.SubmitMessages = []template.HTML{template.HTML(apiErr.Message)}
			} else {
				log.Error("%s", err)
				f.SubmitMessages = []template.HTML{"Internal Server Error"}
			}
		} else {
			// Request was a success
			f.SubmitSuccess = true
			f.SubmitMessages = []template.HTML{template.HTML(
				"Success! You are now " + f.FieldVal("new_username"),
			)}
		}
	}
	return f
}
