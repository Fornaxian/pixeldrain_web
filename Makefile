run: 
	${MAKE} -j2 backgroundrun backgroundts
build:
	tsc res/static/res/typescript/lib/*.ts --outFile res/static/res/script/pixellib.js \
	    res/static/res/typescript/home/*.ts \
	    res/static/res/typescript/lib/*.ts --outFile res/static/res/script/home.js
	go build main.go -o pixeldrain-web

deps:
	npm install -g typescript

backgroundrun:
	go run main.go
backgroundts:
	tsc --watch --project res/static/res/typescript/home
