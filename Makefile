run:
	${MAKE} -j2 backgroundrun backgroundsvelte
build:
	cd svelte && npm run build
	go build main.go -o web

backgroundrun:
	go run main.go
backgroundsvelte:
	cd svelte && npm install && npm run dev
