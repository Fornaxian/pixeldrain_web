run: ts
	go run main.go
runboth: ts
	cd ../pixeldrain-server-launcher && go run main.go

build: ts
	go build main.go -o pixeldrain-web

deps:
	npm install -g typescript

ts:
	tsc --strict res/static/res/typescript/lib/*.ts  --outFile res/static/res/script/pixellib.js
	tsc --strict res/static/res/typescript/home/*.ts \
	             res/static/res/typescript/lib/*.ts  \
	             --outFile res/static/res/script/home.js