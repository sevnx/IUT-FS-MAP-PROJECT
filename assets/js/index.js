const defaultParisCoordinates = [48.855, 2.32];
let map;
let firstSelect;
let secondSelect;
let isMapSatellite = false;

function getBlinkingIcon(isActive) {
    return {
        url: 'assets/line_icons/' + (isActive ? 'corresp' : 'selected') + '.png',
        scaledSize: new google.maps.Size(12, 12),
        anchor: new google.maps.Point(5, 6)
    }
}

function initStationSelection() {
    const defaultStationSelectionObject = () => ({ station: null, marker: { current: null, initialIcon: null } });
    firstSelect = defaultStationSelectionObject();
    secondSelect = defaultStationSelectionObject();
}

async function fetchJSON(url) {
    return await fetch(url).then(response => response.json());
}

document.addEventListener("DOMContentLoaded", async function () {
    initStationSelection()
    map = getGoogleMap();
    defineActionButtons();
    let stations = await fetchJSON('https://descartographie.ait37.fr/assets/json/stations.json');
    let interconnections = await fetchJSON('https://descartographie.ait37.fr/assets/json/interconnection.json');
    await loadMetro(map, stations, interconnections);

    let isActive = false;
    setInterval(() => {
        if (firstSelect.station) {
            firstSelect.marker.current.setIcon(getBlinkingIcon(isActive))
        }
        if (secondSelect.station) {
            secondSelect.marker.current.setIcon(getBlinkingIcon(isActive))
        }
        isActive = !isActive
    }, 500);
});

function defineActionButtons() {
    document.getElementById("zoomInBtn").addEventListener('click', () => {
        map.setZoom(map.getZoom() + 1)
    });
    document.getElementById("zoomOutBtn").addEventListener('click', () => {
        map.setZoom(map.getZoom() - 1)
    });
    document.getElementById("returnToCenter").addEventListener('click', () => {
        map.setCenter(new google.maps.LatLng(...defaultParisCoordinates))
        map.setZoom(13)
    });
    document.getElementById("layerBtn").addEventListener('click', () => {
        map.setMapTypeId(isMapSatellite ? "roadmap" : "satellite")
        isMapSatellite = !isMapSatellite
    });
    document.getElementById("reset").addEventListener('click', () => {
        clearInputValues();
        resetMarkersToInitial();
        initStationSelection();
        document.getElementById("path").innerHTML = "";
    });
    document.getElementById("search").addEventListener('click', () => {
        searchDijkstraPathForInputtedStations();
    });
    document.getElementById("departure").addEventListener('focusout', () => {
        let departure = document.getElementById("departure").value;
        if (getStationIdsFromName(departure).length === 0) {
            return;
        }
        firstSelect = setSelect(departure, stationMarkers.get(departure));
    });
    document.getElementById("arrival").addEventListener('focusout', () => {
        let arrival = document.getElementById("arrival").value;
        if (getStationIdsFromName(arrival).length === 0) {
            return;
        }
        secondSelect = setSelect(arrival, stationMarkers.get(arrival));
    });
}

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

function getPopupContentForStation(station, stations) {
    const lines = getLinesForStation(station.name, stations);
    let linesHTML = '';
    lines.forEach(line => {
        linesHTML += `<img src="assets/line_icons/${line}.png" alt="Line ${line} icon" width="20" height="20" style="margin-right: 5px">`;
    });
    return `
    <div style="display: flex;align-items: center">
    <div class="metro-station-lines">
    ${linesHTML}
    </div>
    <strong>${station.name}</strong>
    </div>
    `;
}

/** MARKERS **/

function getMarkerForOneLineStation(station) {
    let icon;
    if (station.is_end === "False") {
        icon = {
            url: 'assets/line_icons/empty' + station.line + '.png',
            scaledSize: new google.maps.Size(7, 7),
            anchor: new google.maps.Point(3, 4)
        }
    } else {
        icon = {
            url: 'assets/line_icons/' + station.line + '.png',
            scaledSize: new google.maps.Size(14, 14),
            anchor: new google.maps.Point(7, 7)
        }
    }
    return new google.maps.Marker({
        position: {lat: station.lat, lng: station.lon},
        map: map,
        // animation: google.maps.Animation.DROP,
        icon: icon
    });
}

function getMarkerForMultiLineStation(station) {
    return new google.maps.Marker({
        position: {lat: station.lat, lng: station.lon},
        map: map,
        // animation: google.maps.Animation.DROP,
        icon: {
            url: 'assets/line_icons/corresp.png',
            scaledSize: new google.maps.Size(9, 9),
            anchor: new google.maps.Point(4, 4)
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

/** UTILITY FOR STATION SELECTION **/

function clearInputValues() {
    document.getElementById("departure").value = "";
    document.getElementById("arrival").value = "";
}

function resetMarkersToInitial() {
    if (firstSelect.marker.current)
        firstSelect.marker.current.setIcon(firstSelect.marker.initialIcon)
    if (secondSelect.marker.current)
        secondSelect.marker.current.setIcon(secondSelect.marker.initialIcon)
}

function getSelectedIcon() {
    return {
        url: 'assets/line_icons/selected.png',
        scaledSize: new google.maps.Size(12, 12),
        anchor: new google.maps.Point(5, 6)
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

/** STATION INFO WINDOW **/

let stationInfoWindow = null;

function closeCurrentStationInfoWindow() {
    if (stationInfoWindow)
        stationInfoWindow.close();
}

function getInfoWindow(station, stations) {
    return new google.maps.InfoWindow({
        content: getPopupContentForStation(station, stations)
    });
}

/** STATION ADDING **/

let stationMap = new Map();
let stationMarkers = new Map();
let lines = new Map();

function getStationIdsFromName(stationName) {
    return [...stationMap.keys()].filter(id => stationMap.get(id).name === stationName)
}

function addStationToStations(station) {
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
            let connection = parseInt(station.connection) -1;
            lines.get(station.line).end[connection] = parseInt(station.id);
        }
    }
}

function addStationToMap(map, station, stations) {
    let marker = getStationMarker(station.name, station, stations);
    marker.addListener('click', function () {
        if (firstSelect.station && secondSelect.station) {
            resetMarkersToInitial()
            initStationSelection()
            clearInputValues()
        }
        if (firstSelect.station) {
            secondSelect = setSelect(station, marker)
            document.getElementById("arrival").value = secondSelect.station.name
        } else {
            firstSelect = setSelect(station, marker)
            document.getElementById("departure").value = firstSelect.station.name
        }
        marker.setIcon(getSelectedIcon())
        marker.setZIndex(900)
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
        addStationToStations(station);
    });
}

/** INTERCONNECTION ADDING **/

function getLineBetweenStations(station1, station2) {
    return new google.maps.Polyline({
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

function addInterconnectionToMap(map, interconnection) {
    const station1 = stationMap.get(parseInt(interconnection.station1));
    const station2 = stationMap.get(parseInt(interconnection.station2));
    getLineBetweenStations(station1, station2).setMap(map);
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

/** DIJKSTRA **/
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
    let shortestPath = { path: null, time: Infinity };

    for (let start of stationsStart) {
        for (let end of stationsEnd) {
            let result = dijkstra(stationMap, start, end);
            console.log(result);
            if (result.time < shortestPath.time) {
                shortestPath = { path: result.path, time: result.time };
            }
        }
    }

    return shortestPath;
}

function searchDijkstraPathForInputtedStations() {
    if (!firstSelect.station) {
        alert("Veuillez sélectionner une station de départ")
        return;
    }
    if (!secondSelect.station) {
        alert("Veuillez sélectionner une station d'arrivée")
        return;
    }
    let departureIds = getStationIdsFromName(document.getElementById("departure").value);
    let arrivalIds = getStationIdsFromName(document.getElementById("arrival").value);
    if (departureIds.length === 0) {
        alert("La station de départ n'existe pas")
        return;
    }
    if (arrivalIds.length === 0) {
        alert("La station d'arrivée n'existe pas")
        return;
    }
    document.getElementById("path").innerHTML = getPathDisplay(getShortestPath(departureIds, arrivalIds));
}

function getPathDisplay(dijkstraResult) {
    const { path, time } = dijkstraResult;
    console.log(path);
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    const pathHTML = path.map(line => {
        const direction = getDirection(line.start, line.end, line.line);
        const stations = line.stations.map(stationId => `<li>${stationMap.get(stationId).name}</li>`).join("");
        return `
            <div class="metro-station-lines">
                <div style="display: flex; align-items: center; justify-content: center;">
                    <img src="assets/line_icons/${line.line}.png" alt="Line ${line.line} icon" width="20" height="20" style="margin-right: 5px;">
                    <p style="margin: 0;">→ ${direction}</p>
                </div>
                <div style="text-align: left;">
                    <ul style="margin-top: 0;">${stations}</ul>
                </div>
            </div>`;
    }).join("");

    return `<strong>Temps de trajet : ${minutes} minutes et ${seconds} secondes</strong><br><br>${pathHTML}`;
}

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