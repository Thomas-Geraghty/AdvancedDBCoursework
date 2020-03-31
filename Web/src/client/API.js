var protocol = "https://";
var url = '127.0.0.1:8443';

export function getCrimeTypes() {
    var path = `/api/crimes/types`
    var requestURL = protocol + url + path;

    return new Promise((resolve) => {
        get(requestURL).then((response) => {
            resolve(response);
        })
    })
}

// Takes coordinates and distance (radius) around coord and gets all crimes
export function getNearbyCrimes(coords, radius) {
    var path = `/api/crimes/nearby?lat=${coords[0]}&lon=${coords[1]}&dist=${radius}`
    var requestURL = protocol+ url + path;

    return new Promise((resolve) => {
        get(requestURL).then((response) => {
            resolve(response);
        })
    })
}

// Takes bounding box and returns crimes within.
export function getCrimesWithinArea(boundingBox) {
    var path = `/api/crimes/within-area`
    var query = `?ne=${boundingBox._northEast.lat},${boundingBox._northEast.lng}&sw=${boundingBox._southWest.lat},${boundingBox._southWest.lng}`

    var requestURL = protocol+ url + path + query;

    return new Promise((resolve) => {
        get(requestURL).then((response) => {
            resolve(response);
        })
    })
}

// Gets stats
export function getCrimeStats(type) {
    var path = `/api/crimes/stats/${type}`
    var requestURL = protocol+ url + path;

    return new Promise((resolve) => {
        get(requestURL).then((response) => {
            resolve(response);
        })
    })
}

// Sends get request to API server and handles response.
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
