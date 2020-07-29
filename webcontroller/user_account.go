package webcontroller

import (
	"html/template"
	"net/http"
	"time"

	"fornaxian.tech/pixeldrain_server/api/restapi/apiclient"
	"github.com/Fornaxian/log"
	"github.com/julienschmidt/httprouter"
)

func (wc *WebController) serveLogout(
	w http.ResponseWriter,
	r *http.Request,
	p httprouter.Params,
) {
	if key, err := wc.getAPIKey(r); err == nil {
		var api = apiclient.New(wc.apiURLInternal)
		api.APIKey = key
		if err = api.UserSessionDestroy(key); err != nil {
			log.Warn("logout failed for session '%s': %s", key, err)
		}
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func (wc *WebController) registerForm(td *TemplateData, r *http.Request) (f Form) {
	var err error
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
	td.Title = "Register a new pixeldrain account"
	f = Form{
		Name:  "register",
		Title: td.Title,
		Fields: []Field{
			{
				Name:        "username",
				Label:       "Username",
				Description: "used for logging into your account",
				Separator:   true,
				Type:        FieldTypeUsername,
			}, {
				Name:  "email",
				Label: "E-mail address",
				Description: `not required. your e-mail address will only be
					used for password resets and important account
					notifications<br/><br/>
					Note: Gmail has been blocking mails from pixeldrain since
					the 13th of july. Please
					<a href="https://support.google.com/mail/thread/new" target="_blank">contact Google</a>
					if you didn't receive your confirmation mail`,
				Separator: true,
				Type:      FieldTypeEmail,
			}, {
				Name:  "password",
				Label: "Password",
				Type:  FieldTypeNewPassword,
			}, {
				Name:  "password2",
				Label: "Password verification",
				Description: "you need to enter your password twice so we " +
					"can verify that no typing errors were made, which would " +
					"prevent you from logging into your new account",
				Separator: true,
				Type:      FieldTypeNewPassword,
			}, {
				Name:  "recaptcha_response",
				Label: "reCaptcha",
				Description: "the reCaptcha turing test verifies that you " +
					"are not an evil robot that is trying to flood the " +
					"website with fake accounts. Please click the white box " +
					"to prove that you're not a robot",
				Separator:      true,
				Type:           FieldTypeCaptcha,
				CaptchaSiteKey: wc.captchaKey(),
			},
		},
		BackLink:     "/",
		SubmitLabel:  "Register",
		PostFormHTML: template.HTML("<p>Welcome to the club!</p>"),
	}

	if f.ReadInput(r) {
		if f.FieldVal("password") != f.FieldVal("password2") {
			f.SubmitMessages = []template.HTML{
				"Password verification failed. Please enter the same " +
					"password in both password fields"}
			return f
		}
		log.Debug("capt: %s", f.FieldVal("recaptcha_response"))

		if err = td.PixelAPI.UserRegister(
			f.FieldVal("username"),
			f.FieldVal("email"),
			f.FieldVal("password"),
			f.FieldVal("recaptcha_response"),
		); err != nil {
			formAPIError(err, &f)
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

func (wc *WebController) loginForm(td *TemplateData, r *http.Request) (f Form) {
	td.Title = "Login"
	f = Form{
		Name:  "login",
		Title: "Log in to your pixeldrain account",
		Fields: []Field{
			{
				Name:  "username",
				Label: "Username / e-mail",
				Type:  FieldTypeUsername,
			}, {
				Name:  "password",
				Label: "Password",
				Type:  FieldTypeCurrentPassword,
			},
		},
		BackLink:    "/",
		SubmitLabel: "Login",
		PostFormHTML: template.HTML(
			`<p>If you don't have a pixeldrain account yet, you can ` +
				`<a href="/register">register here</a>. No e-mail address is ` +
				`required.</p>` +
				`<p>Forgot your password? If your account has a valid e-mail ` +
				`address you can <a href="/password_reset">request a new ` +
				`password here</a>.</p>`,
		),
	}

	if f.ReadInput(r) {
		loginResp, err := td.PixelAPI.UserLogin(f.FieldVal("username"), f.FieldVal("password"), false)
		if err != nil {
			formAPIError(err, &f)
		} else {
			// Request was a success
			f.SubmitSuccess = true
			f.SubmitMessages = []template.HTML{"Success!"}

			// Set the autentication cookie
			f.Extra.SetCookie = &http.Cookie{
				Name:    "pd_auth_key",
				Value:   loginResp.APIKey,
				Path:    "/",
				Expires: time.Now().AddDate(50, 0, 0),
				Domain:  wc.sessionCookieDomain,

				// Strict means the Cookie will only be sent when the user
				// reaches a page by a link from the same domain. Lax means any
				// page on the domain gets the cookie and None means embedded
				// content also gets the cookie. We're not trying to track the
				// user around the web so we use lax
				SameSite: http.SameSiteLaxMode,
			}
			f.Extra.RedirectTo = "/user"
		}
	}
	return f
}

func (wc *WebController) passwordResetForm(td *TemplateData, r *http.Request) (f Form) {
	td.Title = "Recover lost password"
	f = Form{
		Name:  "password_reset",
		Title: td.Title,
		Fields: []Field{
			{
				Name:  "email",
				Label: "E-mail address",
				Description: `we will send a password reset link to this e-mail
					address<br/><br/>
					Note: Gmail has been blocking mails from pixeldrain since
					the 13th of july. Please
					<a href="https://support.google.com/mail/thread/new" target="_blank">contact Google</a>
					if you didn't receive your confirmation mail`,
				Separator: true,
				Type:      FieldTypeEmail,
			}, {
				Name:  "recaptcha_response",
				Label: "Turing test (click the white box)",
				Description: "the reCaptcha turing test verifies that you " +
					"are not an evil robot that is trying hijack accounts",
				Separator:      true,
				Type:           FieldTypeCaptcha,
				CaptchaSiteKey: wc.captchaKey(),
			},
		},
		BackLink:    "/login",
		SubmitLabel: "Submit",
	}

	if f.ReadInput(r) {
		if err := td.PixelAPI.UserPasswordReset(
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
	td.Title = "Reset lost password"
	f = Form{
		Name:  "password_reset_confirm",
		Title: td.Title,
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
				Separator: true,
				Type:      FieldTypeNewPassword,
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

		if err := td.PixelAPI.UserPasswordResetConfirm(resetKey, f.FieldVal("new_password")); err != nil {
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
