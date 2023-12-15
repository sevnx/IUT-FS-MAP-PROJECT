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

const LeafLet = window.L;
const LeafBaseIcon = LeafLet.Icon;

const LeafIcon = LeafBaseIcon.extend({
    options: {
        iconSize: [20, 20],
        iconAnchor: [25, 25],
        iconUrl: 'assets/line_icons/default.png' // Add this line
    }
});

const LeafSmallIcon = LeafBaseIcon.extend({
    options: {
        iconSize: [10, 10],
        iconUrl: 'assets/line_icons/default.png' // Add this line
    }
})

const metroIcons = {
    "default": "assets/line_icons/default.png",
    "1": "assets/line_icons/1.png",
    "2": "assets/line_icons/2.png",
    "3": "assets/line_icons/3.png",
    "3bis": "assets/line_icons/3bis.png",
    "4": "assets/line_icons/4.png",
    "5": "assets/line_icons/5.png",
    "6": "assets/line_icons/6.png",
    "7": "assets/line_icons/7.png",
    "7bis": "assets/line_icons/7bis.png",
    "8": "assets/line_icons/8.png",
    "9": "assets/line_icons/9.png",
    "10": "assets/line_icons/10.png",
    "11": "assets/line_icons/11.png",
    "12": "assets/line_icons/12.png",
    "13": "assets/line_icons/13.png",
    "14": "assets/line_icons/14.png"
};

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

function getMarkerForOneLineStation(station) {
    return new google.maps.Marker({
        position: { lat: station.lat, lng: station.lon },
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3,
            fillColor: getMetroColor(station.line_number),
            fillOpacity: 1,
            strokeWeight: 0
        }
    });
}

function getMarkerForMultiLineStation(station, stations) {
    return new google.maps.Marker({
        position: { lat: station.lat, lng: station.lon },
        map: map,
        icon: {
            url: 'assets/line_icons/default.png',
            scaledSize: new google.maps.Size(12, 12)
        }
    });
}

function getAmmountOfLinesForStation(stationName, stations) {
    return getLinesForStation(stationName, stations).length;
}

function getMarketBasedOnLines(stationName, station, stations) {
    const lines = getLinesForStation(stationName, stations);
    if (lines.length === 1) {
        return getMarkerForOneLineStation(station);
    } else {
        return getMarkerForMultiLineStation(station, stations);
    }
}

function getInfoWindow(station, stations) {
    return new google.maps.InfoWindow({
        content: getPopupContentForStation(station, stations)
    });
}

function addStationsToMap(map, stations) {
    let processedStations = [];
    stations.forEach(station => {
        if (processedStations.includes(station.nom_gares)) return;
        let marker = getMarketBasedOnLines(station.nom_gares, station, stations);
        let infoWindow = getInfoWindow(station, stations);

        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });
        marker.setMap(map);

        processedStations.push(stations.nom_gares);
    });
}

function getLineBetweenStations(station1, station2) {
    return new google.maps.Polyline({
        path: [
            { lat: station1.lat, lng: station1.lon },
            { lat: station2.lat, lng: station2.lon }
        ],
        geodesic: true,
        strokeColor: getMetroColor(station1.line_number),
        strokeOpacity: 1.0,
        strokeWeight: 3
    });
}

function addInterconnectionsToMap(map, stations, interconnections) {
    interconnections.forEach(liaison => {
        const station1 = stations.find(station => parseInt(station.station_id) === parseInt(liaison.station1));
        const station2 = stations.find(station => parseInt(station.station_id) === parseInt(liaison.station2));
        if (station1 && station2) {
            let line = getLineBetweenStations(station1, station2);
            line.setMap(map);
        }
    });
}

async function populateMapWithStationsAndConnections(map, stations, liaisons) {
    addStationsToMap(map, stations);
    addInterconnectionsToMap(map, stations, liaisons);
}

async function getStations() {
    return await fetch('https://descartographie.ait37.fr/assets/json/stations.json').then(response => response.json());
}

async function getLiaisons() {
    return await fetch('https://descartographie.ait37.fr/assets/json/interconnection.json').then(response => response.json());
}

function loadStationDatalist(stations) {
    const datalist = document.getElementById("stations");
    let stationsSet = new Set();
    stations.forEach(station => {
        const option = document.createElement("option");
        option.value = station.line_number + " - " + station.nom_gares;
        datalist.appendChild(option);
        stationsSet.add(station.nom_gares);
    });
}

document.addEventListener("DOMContentLoaded", async function() {
    const map = getGoogleMap();
    let stations = await getStations();
    let interconnections = await getLiaisons();
    await populateMapWithStationsAndConnections(map, stations, interconnections);
    loadStationDatalist(stations);
});