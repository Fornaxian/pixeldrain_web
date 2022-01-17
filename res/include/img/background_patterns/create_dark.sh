#!/bin/bash

for i in {0..17}; do convert checker${i}.png -brightness-contrast 80x0 checker${i}_light.png; done
convert checker_wednesday.png -brightness-contrast 80x0 checker_wednesday_light.png
convert checker_wednesday.png -brightness-contrast 80x0 checker_wednesday_light.png
convert checker_dwarf.png -brightness-contrast 80x0 checker_dwarf_light.png
convert checker_developers.png -brightness-contrast 80x0 checker_developers_light.png
convert checker_halloween.png -brightness-contrast 80x0 checker_halloween_light.png
convert checker_christmas.png -brightness-contrast 80x0 checker_christmas_light.png

optipng *.png
