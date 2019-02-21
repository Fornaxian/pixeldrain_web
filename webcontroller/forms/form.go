package forms

import (
	"html/template"
)

// Form is a form which can be rendered in HTML and submitted
type Form struct {
	Title       string        // Shown in a large font above the form
	PreFormHTML template.HTML // Content to be rendered above the form

	Fields []Field

	BackLink    string // Empty for no back link
	SubmitLabel string // Label for the submit button
	SubmitRed   bool   // If the submit button should be red or green

	PostFormHTML template.HTML // Content to be rendered below the form

	// Fields to render if the form has been submitted once
	Submit         bool     // If the form has been submitted
	SubmitSuccess  bool     // If the submission was a success
	SubmitMessages []string // Messages telling the user the results
}

// Field is a single input field in a form
type Field struct {
	// Used for reading the data. Entered data is POSTed back to the same URL with this name
	Name string
	// Is entered in the input field by default
	DefaultValue string
	// Text next to the input field
	Label string
	// Text below the input field
	Description string
	// Separates fields with a horizontal rule
	Separator bool

	Type FieldType

	// Only used when Type = `captcha`
	CaptchaSiteKey string
}

// FieldType defines the type a form field has and how it should be rendered
type FieldType string

// Fields which can be in a form
const (
	FieldTypeText        FieldType = "text"
	FieldTypeUsername    FieldType = "username"
	FieldTypeEmail       FieldType = "email"
	FieldTypeOldPassword FieldType = "current-password"
	FieldTypeNewPassword FieldType = "new-password"
	FieldTypeCaptcha     FieldType = "captcha"
)
