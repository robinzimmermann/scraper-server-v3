Craigslist has multiple locations, usually centered around an area, which a unique sub domain:

- 'sf bayarea': https://sfbay.craigslist.org/
- 'sacramento': https://sacramento.craigslist.org/
- Western Slope (near Telluride): https://westslope.craigslist.org/search/sss?query=ttr-125
- etc

Base URL becomes https://sfbay.craigslist.org/search/sss?query=ktm#search=1~gallery~0~0, where the hash code indicates the page number. e.g., `gallery~1-0` for page 2.

Min price and max price are in the URL: https://sfbay.craigslist.org/search/sss?max_price=9999&min_price=7777&query=ktm#search=1~gallery~0~0

So is the sub category. That is the first three letters in the URL after "search":

- sss: all
- mca: motorcycles
- tla: tools
- etc

URL can also search on a specific lat/long and distance from it: https://reno.craigslist.org/search/coleville-ca/sss?lat=38.1584&lon=-119.6454&search_distance=60&query=ktm#search=1~gallery~0~0

Near SF Bay Area are many extras such as "stockton", "sacramento", etc

Near Los Angeles is "Inland Empire"

So URL will have:

- location
- subcategory
- min / max price
