A base url looks like: https://www.facebook.com/marketplace/109449385747832/search/?query=ktm

The code in the URL, `109449385747832`, indicates the search centre, a city known to Facebook such as "Walnut Creek". The URL doesn't change for the distance from the center, that is done as a preference online by the user, therefore it's a browser setting.

If you know the map center, usually a city or a zipcode, the base URL becomes: https://www.facebook.com/marketplace/12345/search/?query=ktm, where `12345` is the map center.

But included in the URL is:

- minPrice
- maxPrice

So for preferences, you only need to know:

- the code, e.g. `12345`
- the search terms
- minPrice / maxPrice

The distance will be done by headless browser as a browser pref.
