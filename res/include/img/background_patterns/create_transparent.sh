#!/bin/bash

transparent () {
	convert $1.png -alpha set -channel a -evaluate set $2 $1_transparent.png
}

for i in {0..17}; do transparent "checker${i}" 6%; done
transparent "checker_wednesday" 10%
transparent "checker_dwarf" 6%
transparent "checker_developers" 6%
transparent "checker_halloween" 6%
transparent "checker_christmas" 6%
transparent "checker_ukraine" 10%

optipng *.png
