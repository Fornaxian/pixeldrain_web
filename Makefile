run: ts
	go run main.go

build: ts
	go build main.go -o pixeldrain-web

ts:
	tsc --strict res/static/res/typescript/lib/*.ts  --outFile res/static/res/script/pixellib.js
	tsc --strict res/static/res/typescript/home/*.ts \
	             res/static/res/typescript/lib/*.ts  \
	             --outFile res/static/res/script/home.js