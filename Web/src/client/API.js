var protocol = "https://";
var url = 'localhost:8443';

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