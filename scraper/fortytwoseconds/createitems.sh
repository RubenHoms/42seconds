#!/bin/sh
spiders="actors apparatuur attractieparken heelal landen movies steden sterrenbeelden televisie"
rm -f items.json
for spider in $spiders ; do
    scrapy crawl $spider -o items.json -t json
done
