package webcontroller

import (
	"html/template"
	"net/http"
	"time"

	"fornaxian.com/pixeldrain-web/pixelapi"
	"fornaxian.com/pixeldrain-web/webcontroller/forms"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) serveRegister(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	var tpld = wc.newTemplateData(w, r)
	tpld.Other = wc.captchaKey()

	err := wc.templates.Get().ExecuteTemplate(w, "register", tpld)
	if err != nil {
		log.Error("Error executing template '%s': %s", "register", err)
	}
}

func (wc *WebController) serveLogout(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	if key, err := wc.getAPIKey(r); err == nil {
		var api = pixelapi.New(wc.conf.APIURLInternal, key)
		_, err1 := api.UserSessionDestroy(key)
		if err1 != nil {
			log.Warn("logout failed for session '%s': %s", key, err1)
		}
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func (wc *WebController) registerForm(td *TemplateData, r *http.Request) (f forms.Form) {
	// This only runs on the first request
	if wc.captchaSiteKey == "" {
		capt, err := td.PixelAPI.GetRecaptcha()
		if err != nil {
			log.Error("Error getting recaptcha key: %s", err)
			f.SubmitMessages = []template.HTML{
				"An internal server error had occurred. Registration is " +
					"unavailable at the moment. Please return later",
			}
			return f
		}
		if capt.SiteKey == "" {
			wc.captchaSiteKey = "none"
		} else {
			wc.captchaSiteKey = capt.SiteKey
		}
	}

	// Construct the form
	td.Title = "Register a new Pixeldrain account"
	f = forms.Form{
		Name:  "register",
		Title: td.Title,
		Fields: []forms.Field{
			{
				Name:        "username",
				Label:       "Username",
				Description: "used for logging into your account",
				Separator:   true,
				Type:        forms.FieldTypeUsername,
			}, {
				Name:  "e-mail",
				Label: "E-mail address",
				Description: "not required. your e-mail address will only be " +
					"used for password resets and important account " +
					"notifications",
				Separator: true,
				Type:      forms.FieldTypeEmail,
			}, {
				Name:  "password1",
				Label: "Password",
				Type:  forms.FieldTypeNewPassword,
			}, {
				Name:  "password2",
				Label: "Password verification",
				Description: "you need to enter your password twice so we " +
					"can verify that no typing errors were made, which would " +
					"prevent you from logging into your new account",
				Separator: true,
				Type:      forms.FieldTypeNewPassword,
			}, {
				Name:  "recaptcha_response",
				Label: "Turing test (click the white box)",
				Description: "the reCaptcha turing test verifies that you " +
					"are not an evil robot that is trying to flood the " +
					"website with fake accounts",
				Separator:      true,
				Type:           forms.FieldTypeCaptcha,
				CaptchaSiteKey: wc.captchaKey(),
			},
		},
		BackLink:     "/",
		SubmitLabel:  "Register",
		PostFormHTML: template.HTML("<p>Welcome to the club!</p>"),
	}

	if f.ReadInput(r) {
		if f.FieldVal("password1") != f.FieldVal("password2") {
			f.SubmitMessages = []template.HTML{
				"Password verification failed. Please enter the same " +
					"password in both password fields"}
			return f
		}
		log.Debug("capt: %s", f.FieldVal("recaptcha_response"))
		resp, err := td.PixelAPI.UserRegister(
			f.FieldVal("username"),
			f.FieldVal("e-mail"),
			f.FieldVal("password1"),
			f.FieldVal("recaptcha_response"),
		)
		if err != nil {
			if apiErr, ok := err.(pixelapi.Error); ok {
				f.SubmitMessages = []template.HTML{template.HTML(apiErr.Message)}
			} else {
				log.Error("%s", err)
				f.SubmitMessages = []template.HTML{"Internal Server Error"}
			}
		} else if len(resp.Errors) != 0 {
			// Registration errors occurred
			for _, rerr := range resp.Errors {
				f.SubmitMessages = append(f.SubmitMessages, template.HTML(rerr.Message))
			}
		} else {
			// Request was a success
			f.SubmitSuccess = true
			f.SubmitMessages = []template.HTML{
				`Registration completed! You can now <a href="/login">log in ` +
					`to your account</a>.<br/>We're glad to have you on ` +
					`board, have fun sharing!`}
		}
	}
	return f
}

func (wc *WebController) loginForm(td *TemplateData, r *http.Request) (f forms.Form) {
	td.Title = "Login"
	f = forms.Form{
		Name:  "login",
		Title: "Log in to your pixeldrain account",
		Fields: []forms.Field{
			{
				Name:  "username",
				Label: "Username / e-mail",
				Type:  forms.FieldTypeUsername,
			}, {
				Name:  "password",
				Label: "Password",
				Type:  forms.FieldTypeCurrentPassword,
			},
		},
		BackLink:    "/",
		SubmitLabel: "Login",
		PostFormHTML: template.HTML(
			`<br/>If you don't have a pixeldrain account yet, you can ` +
				`<a href="/register">register here</a>. No e-mail address is ` +
				`required.<br/>`,
		),
	}

	if f.ReadInput(r) {
		loginResp, err := td.PixelAPI.UserLogin(f.FieldVal("username"), f.FieldVal("password"), false)
		if err != nil {
			if apiErr, ok := err.(pixelapi.Error); ok {
				f.SubmitMessages = []template.HTML{template.HTML(apiErr.Message)}
			} else {
				log.Error("%s", err)
				f.SubmitMessages = []template.HTML{"Internal Server Error"}
			}
		} else {
			log.Debug("key %s", loginResp.APIKey)
			// Request was a success
			f.SubmitSuccess = true
			f.SubmitMessages = []template.HTML{"Success!"}
			f.Extra.SetCookie = &http.Cookie{
				Name:    "pd_auth_key",
				Value:   loginResp.APIKey,
				Path:    "/",
				Expires: time.Now().AddDate(50, 0, 0),
			}
			f.Extra.RedirectTo = "/user"
		}
	}
	return f
}

func (wc *WebController) passwordForm(td *TemplateData, r *http.Request) (f forms.Form) {
	td.Title = "Change Password"
	f = forms.Form{
		Name:  "password_change",
		Title: td.Title,
		Fields: []forms.Field{
			{
				Name:  "old_password",
				Label: "Old Password",
				Type:  forms.FieldTypeCurrentPassword,
			}, {
				Name:  "new_password1",
				Label: "New Password",
				Type:  forms.FieldTypeNewPassword,
			}, {
				Name:  "new_password2",
				Label: "New Password verification",
				Type:  forms.FieldTypeCurrentPassword,
			},
		},
		BackLink:    "/user",
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
		_, err := td.PixelAPI.UserPasswordSet(
			f.FieldVal("old_password"),
			f.FieldVal("new_password1"),
		)
		if err != nil {
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
