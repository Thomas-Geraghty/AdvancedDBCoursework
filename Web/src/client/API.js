var protocol = "http://";
var url = 'localhost:8080';

export function getNearbyStops(coords, radius) {
    var path = `/API/Stops/?lat=${coords[0]}&lon=${coords[1]}&dist=${radius}`
    var requestURL = protocol+ url + path;

    return new Promise((resolve) => {
        get(requestURL).then((response) => {
            resolve(response);
        })
    })
}

export function getStopSimple(atco) {
    var path = `/API/Stops/${atco}`;
    var requestURL = protocol+ url + path;

    return new Promise((resolve) => {
        get(requestURL).then((response) => {
            resolve(response);
        })
    })
}

export function getStopAdvanced(atco) {
    var path = `/API/Stops/${atco}?adv=true`;
    var requestURL = protocol+ url + path;

    return new Promise((resolve) => {
        get(requestURL).then((response) => {
            console.log(response)
            resolve(response);
        })
    })
}

export function getStopServices(atco) {
    var path = `/API/Services/StopPoint/${atco}/Routes`;
    var requestURL = protocol + url + path

    return new Promise((resolve) => {
        get(requestURL).then((response) => {
            resolve(response);
        })
    })
}

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