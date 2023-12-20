const defaultParisCoordinates = [48.855, 2.32];
let map;
let firstSelect;
let secondSelect;
let isMapSatellite = false;

function getBlinkingIcon(isActive){
    return {
        url: 'assets/line_icons/' + (isActive ? 'corresp' : 'selected') + '.png',
        scaledSize: new google.maps.Size(12, 12),
        anchor: new google.maps.Point(5, 6)
    }
}

function getStationIdsFromName(stationName){
    return [...stationMap.keys()].filter(id => stationMap.get(id).name === stationName)
}

function getDirectionOfLinePath(start, end, line) {
    start = stationMap.get(start);
    end = stationMap.get(end);
    let startLine = stationMap.get(lines.get(line).start[0]);
    while (startLine !== start && startLine !== end) {
        let prev = startLine;
        for (let {station} of startLine.adjacentStations) {
            if (stationMap.get(station).line === line && station !== prev) {
                startLine = stationMap.get(station);
                break;
            }
        }
    }
    if (startLine === start){
        return stationMap.get(lines.get(line).end[0]).name;
    } else {
        return stationMap.get(lines.get(line).start[0]).name;
    }
}

function searchDijkstraPathForInputtedStations() {
    if (!firstSelect.station){
        alert("Veuillez sélectionner une station de départ")
        return;
    }
    if (!secondSelect.station){
        alert("Veuillez sélectionner une station d'arrivée")
        return;
    }
    let departure = document.getElementById("departure").value;
    let arrival = document.getElementById("arrival").value;
    let departureIds = getStationIdsFromName(departure);
    let arrivalIds = getStationIdsFromName(arrival);
    if (departureIds.length === 0){
        alert("La station de départ n'existe pas")
        return;
    }
    if (arrivalIds.length === 0){
        alert("La station d'arrivée n'existe pas")
        return;
    }
    let minTime = Infinity;
    let pathToMinTime = null;
    let departureIdMin, arrivalIdMin;
    for (let departureId of departureIds){
        for (let arrivalId of arrivalIds){
            let dijkstraResult = dijkstra(stationMap, departureId, arrivalId);
            console.log(dijkstraResult);
            if (dijkstraResult.time < minTime){
                minTime = dijkstraResult.time;
                pathToMinTime = dijkstraResult.path;
                departureIdMin = departureId;
                arrivalIdMin = arrivalId;
            }
        }
    }
    console.log(pathToMinTime);
    let pathHTML = '';
    pathToMinTime.forEach(line => {
        let direction = "Feur";
        pathHTML += `<div class="metro-station-lines">
        <div style="display: flex; align-items: center; justify-content: center;">
            <img src="assets/line_icons/${line.line}.png" alt="Line ${line.line} icon" width="20" height="20" style="margin-right: 5px;">
            <p style="margin: 0;">Métro ${line.line} - Direction ${direction}</p>
        </div>
        <div style="text-align: left;">
            <ul style="margin-top: 0;">
            ${line.stations.map(stationId => `<li>${stationMap.get(stationId).name}</li>`).join("")}
            </ul>
        </div>
    </div>`
    })
    document.getElementById("path").innerHTML = pathHTML;
}

function initStationSelection() {
    firstSelect = {
        station:null,
        marker: {
            current:null,
            initialIcon:null
        }
    };
    secondSelect = {
        station:null,
        marker: {
            current:null,
            initialIcon:null
        }
    };
}

async function getStations() {
    return await fetch('https://descartographie.ait37.fr/assets/json/stations.json').then(response => response.json());
}

async function getInterconnections() {
    return await fetch('https://descartographie.ait37.fr/assets/json/interconnection.json').then(response => response.json());
}

document.addEventListener("DOMContentLoaded", async function() {
    initStationSelection()
    map = getGoogleMap();
    defineActionButtons();
    let stations = await getStations();
    let interconnections = await getInterconnections();
    await loadMetro(map, stations, interconnections);

    let isActive = false;
    setInterval(() => {
        if(firstSelect.station) {
            firstSelect.marker.current.setIcon(getBlinkingIcon(isActive))
        }
        if(secondSelect.station) {
            secondSelect.marker.current.setIcon(getBlinkingIcon(isActive))
        }
        isActive = !isActive
    }, 500);
});

function defineActionButtons() {
    document.getElementById("zoomInBtn").addEventListener('click', () => {
        map.setZoom(map.getZoom() + 1)
    })
    document.getElementById("zoomOutBtn").addEventListener('click', () => {
        map.setZoom(map.getZoom() - 1)
    })
    document.getElementById("returnToCenter").addEventListener('click', () => {
        map.setCenter(new google.maps.LatLng(...defaultParisCoordinates))
        map.setZoom(13)
    })
    document.getElementById("layerBtn").addEventListener('click', () => {
        map.setMapTypeId(isMapSatellite ? "roadmap" : "satellite")
        isMapSatellite = !isMapSatellite
    })
    document.getElementById("reset").addEventListener('click', () => {
        clearInputValues()
    })
    document.getElementById("search").addEventListener('click', () => {
        searchDijkstraPathForInputtedStations()
    })
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
        .filter(station => station.nom_gares === stationName)
        .map(station => station.line_number);
}

function getPopupContentForStation(station, stations) {
    const lines = getLinesForStation(station.nom_gares, stations);
    let linesHTML = '';
    lines.forEach(line => {
        linesHTML += `<img src="assets/line_icons/${line}.png" alt="Line ${line} icon" width="20" height="20" style="margin-right: 5px">`;
    });
    return `
    <div style="display: flex;align-items: center">
    <div class="metro-station-lines">
    ${linesHTML}
    </div>
    <strong>${station.nom_gares}</strong>
    </div>
    `;
}

/** MARKERS **/

function getMarkerForOneLineStation(station) {
    if (station.is_end === "False") {
        icon = {
            url: 'assets/line_icons/empty' + station.line_number + '.png',
            scaledSize: new google.maps.Size(7, 7),
            anchor: new google.maps.Point(3, 4)
        }
    } else {
        icon = {
            url: 'assets/line_icons/' +station.line_number +'.png',
            scaledSize: new google.maps.Size(14, 14),
            anchor: new google.maps.Point(7, 7)
        }
    }
    return new google.maps.Marker({
        position: { lat: station.lat, lng: station.lon },
        map: map,
        // animation: google.maps.Animation.DROP,
        icon: icon
    });
}

function getMarkerForMultiLineStation(station) {
    return new google.maps.Marker({
        position: { lat: station.lat, lng: station.lon },
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
    firstSelect.marker.current.setIcon(firstSelect.marker.initialIcon)
    secondSelect.marker.current.setIcon(secondSelect.marker.initialIcon)
}

function getSelectedIcon(){
    return {
        url: 'assets/line_icons/selected.png',
        scaledSize: new google.maps.Size(12, 12),
        anchor: new google.maps.Point(5, 6)
    }
}

function setSelect(station, marker) {
    return {
        station:station,
        marker: {
            current:marker,
            initialIcon:marker.getIcon()
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
let lines = new Map();

function addStationToStations(station) {
    stationMap.set(parseInt(station.station_id), {
        lat: station.lat,
        lon: station.lon,
        name: station.nom_gares,
        line: station.line_number,
        connection: station.connection,
        adjacentStations: []
    });
}

function addStationToLines(station) {
    if (!lines.has(station.line_number)) {
        lines.set(station.line_number, {
            start: [],
            end: []
        });
    }
    if (station.is_end !== "False") {
        if (station.connection === "0") {
            if (lines.get(station.line_number).start.length === 0) {
                lines.get(station.line_number).start.push(parseInt(station.station_id));
            } else {
                lines.get(station.line_number).end.push(parseInt(station.station_id));
            }
        } else {
            lines.get(station.line_number).end.push(parseInt(station.station_id));
        }
    }
}

function addStationToMap(map, station, stations) {
    let marker = getStationMarker(station.nom_gares, station, stations);
    marker.addListener('click', function() {
        if(firstSelect.station && secondSelect.station){
            resetMarkersToInitial()
            initStationSelection()
            clearInputValues()
        }
        if (firstSelect.station) {
            secondSelect = setSelect(station, marker)
            document.getElementById("arrival").value = secondSelect.station.nom_gares
        } else {
            firstSelect = setSelect(station, marker)
            document.getElementById("departure").value = firstSelect.station.nom_gares
        }
        marker.setIcon(getSelectedIcon())
        marker.setZIndex(900)
    });
    marker.addListener('mouseover', function() {
        closeCurrentStationInfoWindow();
        stationInfoWindow = getInfoWindow(station, stations);
        stationInfoWindow.open(map, marker);
    });
    marker.addListener('mouseout', function() {
        closeCurrentStationInfoWindow();
    });
    marker.setMap(map);
}

function addStationToDataList(station) {
    const datalist = document.getElementById("stations");
    const option = document.createElement("option");
    option.value = station.line_number + " - " + station.nom_gares;
    datalist.appendChild(option);
}

function addStationsToApp(map, stations) {
    let stationNames = new Set();
    lines = new Map();
    stationMap = new Map();
    stations.forEach(station => {
        if (!stationNames.has(station.nom_gares)) {
            stationNames.add(station.nom_gares);
            addStationToMap(map, station, stations);
        }
        addStationToLines(station);
        addStationToStations(station);
        addStationToDataList(station);
    });
}

/** INTERCONNECTION ADDING **/

function getLineBetweenStations(station1, station2) {
    return new google.maps.Polyline({
        path: [
            { lat: station1.lat, lng: station1.lon },
            { lat: station2.lat, lng: station2.lon }
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