/**
 * API connection info.
 */
const protocol = "https://";
const hostname = process.env.REACT_APP_API_HOST || window.location.hostname || '127.0.0.1';
const port = '8443'
const host = hostname + ':' + port

/**
 * Gets crime types from the API.
 */
export function getCrimeTypes() {
    var path = `/api/crimes/types`
    var requestURL = protocol + host + path;

    return get(requestURL);
}

/**
 * Takes map info (bounding box, map settings etc) and returns crimes within
 * map viewport that match the settings provided.
*/
export function getCrimesWithinArea(boundingBox, startDate, endDate, crimeType) {
    var path = `/api/crimes/within-area`
    var boundingBoxQuery = `?ne=${boundingBox._northEast.lat},${boundingBox._northEast.lng}&sw=${boundingBox._southWest.lat},${boundingBox._southWest.lng}`
    var optionsQuery = `&startDate=${startDate}&endDate=${endDate}&crimeType=${crimeType}`

    var requestURL = protocol+ host + path + boundingBoxQuery + optionsQuery;

    return get(requestURL);
}

/**
 * Get stats for ChartsView page.
 * Contains all stats used.
 */
export function getCrimeStats(type) {
    var path = `/api/crimes/stats/${type}`
    var requestURL = protocol+ host + path;

    return get(requestURL);
}

/**
 * Geocoder request sent to Nominatim (OSM Geocoder API)
 * Auto appends 'United Kingdom' to search string to ensure it will be a U.K address.
 */
export function geocoderRequest(value) {
    const protocol = "https://";
    const host = 'nominatim.openstreetmap.org';
    const path = '/search?q=';
    const format = '&format=json&addressdetails=1';
    const locality = "United Kingdom";

    var query = `${value} ${locality}`.replace(/[^\w\s]/gi, '').replace(/ /g, '+');
    var requestURL = protocol + host + path + query + format;

    return get(requestURL);
}

/**
 * Sends get request to API server (or any URL passed) and handles response.
 */
function get(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();

    return new Promise((resolve) => {
        xhr.onreadystatechange = processRequest;

        function processRequest(e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                resolve(response);
            }
        }
    })
}
