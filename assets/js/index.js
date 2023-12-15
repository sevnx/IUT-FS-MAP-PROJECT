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
    "default": new LeafSmallIcon(),
    "1": new LeafIcon({iconUrl: 'assets/line_icons/1.png'}), // Change 'iconurl' to 'iconUrl'
    "2": new LeafIcon({iconUrl: 'assets/line_icons/2.png'}),
    "3": new LeafIcon({iconUrl: 'assets/line_icons/3.png'}),
    "3bis": new LeafIcon({iconUrl: 'assets/line_icons/3bis.png'}),
    "4": new LeafIcon({iconUrl: 'assets/line_icons/4.png'}),
    "5": new LeafIcon({iconUrl: 'assets/line_icons/5.png'}),
    "6": new LeafIcon({iconUrl: 'assets/line_icons/6.png'}),
    "7": new LeafIcon({iconUrl: 'assets/line_icons/7.png'}),
    "7bis": new LeafIcon({iconUrl: 'assets/line_icons/7bis.png'}),
    "8": new LeafIcon({iconUrl: 'assets/line_icons/8.png'}),
    "9": new LeafIcon({iconUrl: 'assets/line_icons/9.png'}),
    "10": new LeafIcon({iconUrl: 'assets/line_icons/10.png'}),
    "11": new LeafIcon({iconUrl: 'assets/line_icons/11.png'}),
    "12": new LeafIcon({iconUrl: 'assets/line_icons/12.png'}),
    "13": new LeafIcon({iconUrl: 'assets/line_icons/13.png'}),
    "14": new LeafIcon({iconUrl: 'assets/line_icons/14.png'}),
};

function getAdditionalMarkerIfStationIsEnd(station, stations) {
    if (station.is_end === "True") {
        return LeafLet.marker([station.lat, station.lon], {
            icon: metroIcons[station.line_number]
        }).bindPopup(getPopupContentForStation(station, stations));
    }
    return null;
}

function getAdditionalMarkerIfStationIsDuplicate(station, stationsSet, stations) {
    if (stationsSet.has(station.nom_gares)) {
        return LeafLet.marker([station.lat, station.lon], {
            icon: metroIcons["default"]
        }).bindPopup(getPopupContentForStation(station, stations));
    }
    return null;
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

function getNormalMarkerForStation(station, stations) {
    return LeafLet.circleMarker([station.lat, station.lon], {
        color: getMetroColor(station.line_number),
        radius: 3,
        fillOpacity: 1
    }).bindPopup(getPopupContentForStation(station, stations));
}

function addStationsToMap(map, stations) {
    let stationsSet = new Set();
    stations.forEach(station => {
        let marker = getNormalMarkerForStation(station, stations);
        marker.addTo(map);
        let markerIfStationIsEnd = getAdditionalMarkerIfStationIsEnd(station, stations);
        if (markerIfStationIsEnd)
            markerIfStationIsEnd.addTo(map);
        let markerIfStationIsDuplicate = getAdditionalMarkerIfStationIsDuplicate(station, stationsSet, stations);
        if (markerIfStationIsDuplicate)
            markerIfStationIsDuplicate.addTo(map);
        stationsSet.add(station.nom_gares);
    });
}

function getLineBetweenStations(station1, station2) {
    return LeafLet.polyline([
        [station1.lat, station1.lon],
        [station2.lat, station2.lon]
    ], {
        color: getMetroColor(station1.line_number),
        weight: 3,
        opacity: 1,
        smoothFactor: 1
    });
}

function addInterconnectionsToMap(map, stations, interconnections) {
    interconnections.forEach(liaison => {
        const station1 = stations.find(station => parseInt(station.station_id) === parseInt(liaison.station1));
        const station2 = stations.find(station => parseInt(station.station_id) === parseInt(liaison.station2));
        if (station1 && station2) {
            getLineBetweenStations(station1, station2).addTo(map);
        }
    });
}

async function populateMapWithStationsAndConnections(map, stations, liaisons) {
    addStationsToMap(map, stations);
    addInterconnectionsToMap(map, stations, liaisons);
}

function getLeafletMap(){
    const defaultParisCoordinates = [48.864716, 2.349014];
    const map = LeafLet.map('map').setView(defaultParisCoordinates, 13);
    LeafLet.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 17,
        minZoom: 11,
        layers: "H"
    }).addTo(map);
    return map;
}

async function getStations() {
    return await fetch('https://victor.ait37.fr/descartographie/json/stations.json').then(response => response.json());
}

async function getLiaisons() {
    return await fetch('https://victor.ait37.fr/descartographie/json/interconnection.json').then(response => response.json());
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
    const map = getLeafletMap();
    let stations = await getStations();
    let interconnections = await getLiaisons();
    await populateMapWithStationsAndConnections(map, stations, interconnections);
    loadStationDatalist(stations);
});