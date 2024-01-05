const defaultParisCoordinates = [48.855, 2.32];
let map;
let firstStationSelect;
let secondStationSelect;
let satelliteToggle = false;
let googleMapObject = google.maps;

function getBlinkingIcon(isActive) {
    return {
        url: 'assets/img/lines/' + (isActive ? 'connection' : 'selected') + '.png',
        scaledSize: new googleMapObject.Size(12, 12),
        anchor: new googleMapObject.Point(5, 6)
    }
}

function initStationSelection() {
    const defaultStationSelectionObject = () => ({station: null, marker: {current: null, initialIcon: null}});
    firstStationSelect = defaultStationSelectionObject();
    secondStationSelect = defaultStationSelectionObject();
}

async function fetchJSON(url) {
    return await fetch(url).then(response => response.json());
}

function resetDisplay() {
    resetMarkersToInitial();
    initStationSelection();
    clearInputValues();
    restoreDefaultOpacity();
    deletePathShow();
}

document.addEventListener("DOMContentLoaded", async function () {
    initStationSelection();
    map = getGoogleMap();
    defineActionButtons();
    let stations = await fetchJSON('https://descartographie.ait37.fr/assets/json/stations.json');
    let interconnections = await fetchJSON('https://descartographie.ait37.fr/assets/json/interconnection.json');
    await loadMetro(map, stations, interconnections);

    let blinkIsActive = false;
    setInterval(() => {
        if (firstStationSelect.station)
            firstStationSelect.marker.current.setIcon(getBlinkingIcon(blinkIsActive));
        if (secondStationSelect.station)
            secondStationSelect.marker.current.setIcon(getBlinkingIcon(blinkIsActive));
        blinkIsActive = !blinkIsActive
    }, 500);
});

/* Commands */

function defineActionButtons() {
    document.getElementById("zoomInBtn").addEventListener('click', () => {
        map.setZoom(map.getZoom() + 1)
    });

    document.getElementById("zoomOutBtn").addEventListener('click', () => {
        map.setZoom(map.getZoom() - 1)
    });

    document.getElementById("returnToCenter").addEventListener('click', () => {
        map.setCenter(new googleMapObject.LatLng(...defaultParisCoordinates))
        map.setZoom(13)
    });

    document.getElementById("layerBtn").addEventListener('click', () => {
        map.setMapTypeId(satelliteToggle ? "roadmap" : "satellite");
        satelliteToggle = !satelliteToggle;
    
        updateButtonStyles();
    });

    function handleHover(button, hoverColor, defaultColor) {
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = hoverColor;
        });

        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = defaultColor;
        });
    }

    function updateButtonStyles() {
        var buttons = document.querySelectorAll('#returnToCenter, #zoomInBtn, #zoomOutBtn, #layerBtn');

        buttons.forEach(function(button) {
            if (satelliteToggle) {
                button.style.backgroundColor = 'var(--black-color)';
                handleHover(button, 'var(--yellow-color)', 'var(--black-color)');
            } else {
                button.style.backgroundColor = 'var(--purple-color)';
                handleHover(button, 'var(--green-color)', 'var(--purple-color)');
            }
        });
    }

    document.getElementById("reset").addEventListener('click', () => {
        resetDisplay();
    });

    document.getElementById("search").addEventListener('click', () => {
        searchDijkstraPathForInputtedStations();
    });

    document.getElementById("departure").addEventListener('focusout', () => {
        deletePathShow();
        restoreDefaultOpacity();
        let departure = document.getElementById("departure").value;
        if (getStationIdsFromName(departure).length === 0) {
            return;
        }
        firstStationSelect = setSelect(stationMap.get(getStationIdsFromName(departure)[0]), stationMarkers.get(departure));
    });

    document.getElementById("arrival").addEventListener('focusout', () => {
        deletePathShow();
        restoreDefaultOpacity();
        let arrival = document.getElementById("arrival").value;
        if (getStationIdsFromName(arrival).length === 0) {
            return;
        }
        secondStationSelect = setSelect(stationMap.get(getStationIdsFromName(arrival)[0]), stationMarkers.get(arrival));
    });
}

/* Metro Colors */

function getMetroColor(line) {
    switch (line) {
        case "1":
            return "#fece00";
        case "2":
            return "#0065ae";
        case "3":
            return "#a19818";
        case "3bis":
            return "#99d4de";
        case "4":
            return "#be418d";
        case "5":
            return "#f18032";
        case "6":
            return "#84c28e";
        case "7":
            return "#f2a4b6";
        case "7bis":
            return "#84c28e";
        case "8":
            return "#cdaccf";
        case "9":
            return "#b8dd00";
        case "10":
            return "#e4b427";
        case "11":
            return "#8c5e24";
        case "12":
            return "#007e49";
        case "13":
            return "#99d4de";
        case "14":
            return "#622181";
        default:
            return "#000";
    }
}

function getLinesForStation(stationName, stations) {
    return stations
        .filter(station => station.name === stationName)
        .map(station => station.line);
}

/* Markers */

function getPopupContentForStation(station, stations) {
    const lines = getLinesForStation(station.name, stations);
    let imagesOfLinesForStation = '';
    lines.forEach(line => {
        imagesOfLinesForStation += `
            <img src="assets/img/lines/default/${line}.png" alt="Line ${line} icon" class="line-popup-icon">
        `;
    });
    return `
        <div style="display: flex;align-items: center">
            <div class="metro-station-lines">
                ${imagesOfLinesForStation}
            </div>
            <strong>${station.name}</strong>
        </div>
    `;
}

function getMarkerForOneLineStation(station) {
    let icon;
    if (station.is_end === "False") {
        icon = {
            url: 'assets/img/lines/empty/' + station.line + '.png',
            scaledSize: new googleMapObject.Size(7, 7),
            anchor: new googleMapObject.Point(3, 4)
        }
    } else {
        icon = {
            url: 'assets/img/lines/default/' + station.line + '.png',
            scaledSize: new googleMapObject.Size(14, 14),
            anchor: new googleMapObject.Point(7, 7)
        }
    }
    return new googleMapObject.Marker({
        optimized: station.is_end !== "True",
        position: {lat: station.lat, lng: station.lon},
        map: map,
        // animation: googleMapObject.Animation.DROP,
        icon: icon
    });
}

function getMarkerForMultiLineStation(station) {
    return new googleMapObject.Marker({
        optimized: false,
        position: {lat: station.lat, lng: station.lon},
        map: map,
        // animation: googleMapObject.Animation.DROP,
        icon: {
            url: 'assets/img/lines/connection.png',
            scaledSize: new googleMapObject.Size(9, 9),
            anchor: new googleMapObject.Point(4, 4)
        }
    });
}

function getStationMarker(stationName, station, stations) {
    const lines = getLinesForStation(stationName, stations);
    if (lines.length === 1) {
        return getMarkerForOneLineStation(station);
    } else {
        return getMarkerForMultiLineStation(station, stations);
    }
}

/* Utility For Station Selection */

window.onload = function () {
    clearInputValues();
};

function clearInputValues() {
    document.getElementById("departure").value = "";
    document.getElementById("arrival").value = "";
}

function resetMarkersToInitial() {
    if (firstStationSelect.marker.current)
        firstStationSelect.marker.current.setIcon(firstStationSelect.marker.initialIcon);
    if (secondStationSelect.marker.current)
        secondStationSelect.marker.current.setIcon(secondStationSelect.marker.initialIcon);
}

function getSelectedIcon() {
    return {
        url: 'assets/img/lines/selected.png',
        scaledSize: new googleMapObject.Size(12, 12),
        anchor: new googleMapObject.Point(5, 6)
    }
}

function setSelect(station, marker) {
    return {
        station: station,
        marker: {
            current: marker,
            initialIcon: marker.getIcon()
        }
    }
}

/* Station Info Window */

let stationInfoWindow = null;

function closeCurrentStationInfoWindow() {
    if (stationInfoWindow)
        stationInfoWindow.close();
}

function getInfoWindow(station, stations) {
    return new googleMapObject.InfoWindow({
        content: getPopupContentForStation(station, stations)
    });
}

/* Station Adding */

let stationMap = new Map();
let stationMarkers = new Map();
let lines = new Map();
let polyLinesBetweenStations = new Map();

function getStationIdsFromName(stationName) {
    return [...stationMap.keys()].filter(id => stationMap.get(id).name === stationName)
}

function addStationToStationMap(station) {
    stationMap.set(parseInt(station.id), {
        lat: station.lat,
        lon: station.lon,
        name: station.name,
        line: station.line,
        connection: station.connection,
        adjacentStations: []
    });
}

function addStationToLines(station) {
    if (!lines.has(station.line)) {
        lines.set(station.line, {
            start: [],
            end: []
        });
    }
    if (station.is_end !== "False") {
        if (station.connection === "0") {
            if (lines.get(station.line).start.length === 0) {
                lines.get(station.line).start.push(parseInt(station.id));
            } else {
                lines.get(station.line).end.push(parseInt(station.id));
            }
        } else {
            let connection = parseInt(station.connection) - 1;
            lines.get(station.line).end[connection] = parseInt(station.id);
        }
    }
}

function handleStationSelection(station) {
    let marker;
    if (firstStationSelect.station && secondStationSelect.station) {
        resetDisplay();
    }
    if (firstStationSelect.station) {
        secondStationSelect = setSelect(station, stationMarkers.get(station.name));
        marker = stationMarkers.get(secondStationSelect.station.name);
        document.getElementById("arrival").value = secondStationSelect.station.name;
        searchDijkstraPathForInputtedStations();
    } else {
        firstStationSelect = setSelect(station, stationMarkers.get(station.name));
        marker = stationMarkers.get(firstStationSelect.station.name);
        document.getElementById("departure").value = firstStationSelect.station.name;
    }
    marker.setIcon(getSelectedIcon());
    marker.setZIndex(900);
}

function addStationToMap(map, station, stations) {
    let marker = getStationMarker(station.name, station, stations);
    marker.addListener('click', function () {
        handleStationSelection(station);
    });
    marker.addListener('mouseover', function () {
        closeCurrentStationInfoWindow();
        stationInfoWindow = getInfoWindow(station, stations);
        stationInfoWindow.open(map, marker);
    });
    marker.addListener('mouseout', function () {
        closeCurrentStationInfoWindow();
    });
    marker.setMap(map);
    stationMarkers.set(station.name, marker);
}

function addStationToDataList(station) {
    const datalist = document.getElementById("stations");
    const option = document.createElement("option");
    option.value = station.name;
    datalist.appendChild(option);
}

function addStationsToApp(map, stations) {
    let stationNames = new Set();
    lines = new Map();
    stationMap = new Map();
    stations.forEach(station => {
        if (!stationNames.has(station.name)) {
            stationNames.add(station.name);
            addStationToMap(map, station, stations);
            addStationToDataList(station);
        }
        addStationToLines(station);
        addStationToStationMap(station);
    });
}

/* Interconnection Adding */

function getLineBetweenStations(station1, station2) {
    console.log(station1, station2);
    return new googleMapObject.Polyline({
        path: [
            {lat: station1.lat, lng: station1.lon},
            {lat: station2.lat, lng: station2.lon}
        ],
        geodesic: true,
        strokeColor: getMetroColor(station1.line),
        strokeOpacity: 1.0,
        strokeWeight: 3
    });
}

function addInterconnectionToStationMap(interconnection) {
    stationMap.get(parseInt(interconnection.station1)).adjacentStations.push({
        station: parseInt(interconnection.station2),
        time: parseInt(interconnection.time_between)
    });
    stationMap.get(parseInt(interconnection.station2)).adjacentStations.push({
        station: parseInt(interconnection.station1),
        time: parseInt(interconnection.time_between)
    });
}

function getPairInOrder(station1, station2) {
    station1 = parseInt(station1);
    station2 = parseInt(station2);
    return station1 < station2 ? [station1, station2] : [station2, station1];
}

function getPolylineKey(station1, station2) {
    return (station1 + "-" + station2);
}

function addInterconnectionToMap(map, interconnection) {
    const [station1, station2] = getPairInOrder(interconnection.station1, interconnection.station2);
    let lineBetweenStations = getLineBetweenStations(stationMap.get(station1), stationMap.get(station2));
    polyLinesBetweenStations.set(getPolylineKey(station1, station2), lineBetweenStations);
    lineBetweenStations.setMap(map);
}

function addInterconnectionsToApp(map, stations, interconnections) {
    interconnections.forEach(interconnection => {
        addInterconnectionToStationMap(interconnection);
        addInterconnectionToMap(map, interconnection);
    });
}

async function loadMetro(map, stations, liaisons) {
    addStationsToApp(map, stations);
    addInterconnectionsToApp(map, stations, liaisons);
}

/* Dijkstra */

function getClosestStationToStart(start, end, line) {
    let notValidConnection = end.connection === "1" ? "2" : "1";
    let startLine = stationMap.get(lines.get(line).start[0]);
    let previousStation = startLine;
    while (startLine !== start && startLine !== end) {
        for (let {station} of startLine.adjacentStations) {
            if (stationMap.get(station).line === line && stationMap.get(station) !== previousStation
                && notValidConnection !== stationMap.get(station).connection) {
                previousStation = startLine;
                startLine = stationMap.get(station);
                break;
            }
        }
    }
    return startLine;
}

function getDirection(start, end, line) {
    const startStation = stationMap.get(start);
    const endStation = stationMap.get(end);
    const lineData = lines.get(line);
    const connectionId = parseInt(endStation.connection) - 1;

    const getEndName = (index) => `${stationMap.get(lineData.end[index]).name}`;
    const getStartName = () => `${stationMap.get(lineData.start[0]).name}`;

    if (startStation.connection === endStation.connection) {
        let closestStation = getClosestStationToStart(startStation, endStation, line);
        if (closestStation !== startStation)
            return getStartName();
        if (lineData.end.length > 1 && endStation.connection === "0")
            return `${getEndName(1)} / ${getEndName(0)}`;
        return getEndName(lineData.end.length > 1 ? connectionId : 0);
    }
    return endStation.connection === "0" ? getStartName() : getEndName(connectionId);
}

function getShortestPath(stationsStart, stationsEnd) {
    let shortestPath = {path: null, time: Infinity};

    for (let start of stationsStart) {
        for (let end of stationsEnd) {
            let result = dijkstra(stationMap, start, end);
            if (result.time < shortestPath.time) {
                shortestPath = {path: result.path, time: result.time};
            }
        }
    }
    return shortestPath;
}

/* Alerts */

function showAlert(message) {
    const customAlert = document.getElementById('custom-alert');
    const overlay = document.getElementById('overlay');

    customAlert.style.display = 'block';
    overlay.style.display = 'block';

    const alertContent = document.getElementById('alert-content');
    alertContent.innerHTML = `
        <div class="alert-content-container">
            <img src="assets/img/lines/alert.png" class="alert-image" alt="Alert icon">
            <p>${message}</p>
        </div>
        <button id="close-alert">Fermer</button>
    `;

    document.getElementById('close-alert').addEventListener('click', function () {
        customAlert.style.display = 'none';
        overlay.style.display = 'none';
    });

    document.addEventListener('keydown', handleEscKey);

    function closeAlert() {
        customAlert.style.display = 'none';
        overlay.style.display = 'none';
        document.removeEventListener('keydown', handleEscKey);
        overlay.removeEventListener('click', closeAlert);
    }

    function handleEscKey(event) {
        if (event.key === 'Escape') {
            closeAlert();
        }
    }
}

function isFromAndToValid() {
    if (!firstStationSelect.station) {
        showAlert("Veuillez sélectionner une station de départ.");
        return false;
    }
    if (!secondStationSelect.station) {
        showAlert("Veuillez sélectionner une station d'arrivée.");
        return false;
    }
    if (firstStationSelect.station === secondStationSelect.station) {
        showAlert("Veuillez sélectionner deux stations différentes.");
        return false;
    }
    if (getStationIdsFromName(document.getElementById("departure").value).length === 0) {
        showAlert("La station de départ n'existe pas.");
        return false;
    }
    if (getStationIdsFromName(document.getElementById("arrival").value).length === 0) {
        showAlert("La station d'arrivée n'existe pas.");
        return false;
    }
    return true;
}

/* Animations */

function reduceOpacityOfAllStationMarkers() {
    stationMarkers.forEach(marker => {
        marker.setOpacity(0.2);
    });
}

function returnStationMarkerToInitialOpacity(station) {
    station = stationMap.get(station).name;
    stationMarkers.get(station).setOpacity(1.0);
}

function restoreDefaultOpacity() {
    restoreAllStationMarkersOpacity();
    restoreAllPolyLinesOpactiy();
}

function restoreAllStationMarkersOpacity() {
    stationMarkers.forEach(marker => {
        marker.setOpacity(1.0);
    });
}

function reduceAllPolyLinesOpacity() {
    polyLinesBetweenStations.forEach(polyLine => {
        polyLine.setOptions({strokeOpacity: 0.2});
    });
}

let pathPolyLines = [];

function deletePathShow() {
    for (let i = 0; i < pathPolyLines.length; i++) {
        pathPolyLines[i].setMap(null);
    }
    pathPolyLines = [];
    document.getElementById("path").innerHTML = "";
}

function restoreAllPolyLinesOpactiy() {
    polyLinesBetweenStations.forEach(polyLine => {
        polyLine.setOptions({strokeOpacity: 1.0});
    });
}

function searchDijkstraPathForInputtedStations() {
    if (!isFromAndToValid())
        return;
    deletePathShow();
    reduceAllPolyLinesOpacity();
    reduceOpacityOfAllStationMarkers();
    let departureIds = getStationIdsFromName(document.getElementById("departure").value);
    let arrivalIds = getStationIdsFromName(document.getElementById("arrival").value);
    document.getElementById("path").innerHTML = getPathDisplay(getShortestPath(departureIds, arrivalIds));
}

function animateDrawingPolyline(startCoord, endCoord, duration, delay, color) {
    startCoord = new googleMapObject.LatLng(startCoord.lat, startCoord.lon);
    endCoord = new googleMapObject.LatLng(endCoord.lat, endCoord.lon);
    const polyline = new googleMapObject.Polyline({
        path: [startCoord, startCoord],
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 3
    });
    polyline.setMap(map);
    pathPolyLines.push(polyline);

    setTimeout(() => {
        let startTime;

        function frame(currentTime) {
            if (!startTime) {
                startTime = currentTime;
            }

            const progress = Math.min((currentTime - startTime) / duration, 1);
            const lat = startCoord.lat() + (endCoord.lat() - startCoord.lat()) * progress;
            const lng = startCoord.lng() + (endCoord.lng() - startCoord.lng()) * progress;
            const currentPath = [startCoord, new googleMapObject.LatLng(lat, lng)];

            polyline.setPath(currentPath);

            if (progress < 1) {
                requestAnimationFrame(frame);
            }
        }
        requestAnimationFrame(frame);
    }, delay);
}

let currentDelay = 0;
const delayIncrement = 200;

function animatePathSegment(line) {
    let currentId = line.start;
    const stations = [...line.stations];
    const color = getMetroColor(line.line);
    stations.forEach(nextId => {
        const currentStation = stationMap.get(currentId);
        const nextStation = stationMap.get(nextId);
        animateDrawingPolyline(currentStation, nextStation, delayIncrement, currentDelay, color);
        returnStationMarkerToInitialOpacity(currentId);
        currentDelay += delayIncrement;
        currentId = nextId;
    });

    const currentStation = stationMap.get(currentId);
    const endStation = stationMap.get(line.end);
    animateDrawingPolyline(currentStation, endStation, delayIncrement, currentDelay, color);
    currentDelay += delayIncrement;

    returnStationMarkerToInitialOpacity(currentId);
    returnStationMarkerToInitialOpacity(line.end);
}

/* Path Display */

function getPathDisplay(dijkstraResult) {
    const {path, time} = dijkstraResult;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60 < 10 ? `0${time % 60}` : time % 60;
    currentDelay = 0;

    const pathHTML = path.map((line, index) => {
        animatePathSegment(line);
        const startStationName = stationMap.get(line.start).name;
        const endStationName = stationMap.get(line.end).name;
        const direction = getDirection(line.start, line.end, line.line);
        const metroColor = getMetroColor(line.line);
        const delay = index * 0.2;
        return `
            <div class="path-segment" style="border-left-color: ${metroColor}; --animation-delay: ${delay}s">
                <div class="line-header" onclick="toggleStations(${index})">
                    <img src="assets/img/lines/default/${line.line}.png" alt="Line ${line.line} icon" class="line-icon">
                    <div>
                        <div class="line-start-station">${startStationName}</div>
                        <div class="line-direction"> 
                            <img src="assets/img/lines/arrow/${line.line}.png" alt="Arrow icon" class="arrow-icon">
                            ${direction}
                        </div>
                    </div>
                    <img src="assets/img/lines/arrow.png" alt="Arrow icon" class="expand-arrow">
                </div>
                <ul class="stations-list hidden" id="stations-list-${index}">
                    <li class="station-item">${startStationName}</li>
                    ${line.stations.map(station => `<li class="station-item">${stationMap.get(station).name}</li>`).join("")}
                    <li class="station-item">${endStationName}</li>
                </ul>
            </div>
        `;
    }).join("");

    const savePath = `
            <div class="save-path">
                <button onclick="savePath()">Enregistrer le trajet</button>
            </div>
        `;
    
    return `
        <div class="path-display">
            <div class="estimated-time-block">
                <p class="estimated-time"><strong>Temps estimé :</strong> ${minutes}:${seconds}</p>
            </div>
            ${pathHTML}
            ${savePath}
        </div>
    `;
}

window.toggleStations = function (index) {
    const stationsList = document.getElementById(`stations-list-${index}`);
    stationsList.classList.toggle('hidden');
    const arrow = stationsList.previousElementSibling.querySelector('.expand-arrow');
    arrow.classList.toggle('rotate');
};






/** SIGN IN **/

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId());

    var name = profile.getName();
    var email = profile.getEmail();

    userDataToBack(profile.getId(), name, email);
}

function userDataToBack(id, name, email) {
    var xhr = new XMLHttpRequest();
    var url = 'https://descartographie.ait37.fr/login.php';
    var params = 'id=' + id + '&name=' + encodeURIComponent(name) + '&email=' + encodeURIComponent(email);

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText); // à tester
        }
    };

    xhr.send(params);
}