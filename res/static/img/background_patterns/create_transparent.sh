#!/bin/bash

transparent () {
	convert $1.png -alpha set -channel a -evaluate set $2 $1_transparent.png
}

for i in {0..20}; do transparent "checker${i}" 6%; done
transparent "checker_wednesday" 8%
transparent "checker_dwarf" 8%
transparent "checker_developers" 8%
transparent "checker_halloween" 8%
transparent "checker_christmas" 8%

optipng *.png
