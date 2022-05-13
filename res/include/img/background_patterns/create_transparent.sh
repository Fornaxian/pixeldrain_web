#!/bin/bash

transparent () {
	convert $1.png -alpha set -channel a -evaluate set $2 $1_transparent.png
}

for i in {0..17}; do transparent "checker${i}" 5%; done
transparent "checker_wednesday" 8%
transparent "checker_dwarf" 5%
transparent "checker_developers" 5%
transparent "checker_halloween" 5%
transparent "checker_christmas" 5%
transparent "checker_ukraine" 8%

optipng *.png
