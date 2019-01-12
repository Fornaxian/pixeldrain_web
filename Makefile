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
	            --project res/static/res/typescript/textupload

docker:
	go build -o docker/pixeldrain-web docker/main.go
	chmod +x docker/pixeldrain-web
	docker build --tag pixeldrain-web -f docker/Dockerfile .
	rm docker/pixeldrain-web

.PHONY: docker
