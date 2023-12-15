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


const LeafIcon = L.Icon.extend({
    options: {
        iconSize: [20, 20],
        iconAnchor: [25, 25],
        iconUrl: 'assets/line_icons/default.png' // Add this line
    }
});

const LeafSmallIcon = L.Icon.extend({
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

async function populateMapWithStationsAndConnections(map, stations, liaisons) {
    let stationsSet = new Set();
    stations.forEach(station => {
        // Create a circle marker for the station
        let marker = L.circleMarker([station.lat, station.lon], {
            radius: 3,
            color: getMetroColor(station.line_number),
            fillOpacity: 1
        })
        const stationInfo = `
        <strong>Station ID:</strong> ${station.station_id}<br>
        <strong>Name:</strong> ${station.nom_gares}<br>
        <strong>Line Number:</strong> ${station.line_number}<br>
        <strong>Is End:</strong> ${station.is_end}<br>
        <strong>Connection:</strong> ${station.connection}
        `;
        marker.bindPopup(stationInfo);
        marker.addTo(map);



        if (stationsSet.has(station.nom_gares)) {
            let additionalMarker = L.marker([station.lat, station.lon], {
                icon: metroIcons["default"]
            })
            additionalMarker.addTo(map);
        } if (station.is_end === "True") {
            let additionalMarker = L.marker([station.lat, station.lon], {
                icon: metroIcons[station.line_number]
            })
            additionalMarker.addTo(map);
        }

        stationsSet.add(station.nom_gares);
    });

    // Iterate over each liaison
    liaisons.forEach(liaison => {
        // Find the stations in the stations array that correspond to station1 and station2
        const station1 = stations.find(station => parseInt(station.station_id) === parseInt(liaison.station1));
        const station2 = stations.find(station => parseInt(station.station_id) === parseInt(liaison.station2));
        console.log(station1);
        // Check if both stations were found
        if (station1 && station2) {
            // Create a polyline for the liaison
            var polyline = L.polyline([
                [station1.lat, station1.lon],
                [station2.lat, station2.lon]
            ], {
                color: getMetroColor(station1.line_number),
                weight: 3,
                opacity: 1,
                smoothFactor: 1
            });
            polyline.addTo(map);
        }
    });
}

function getLeafletMap(){
    const defaultParisCoordinates = [48.864716, 2.349014];
    const map = L.map('map').setView(defaultParisCoordinates, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 12,
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
        if (stationsSet.has(station.nom_gares)) {
            return;
        }
        const option = document.createElement("option");
        option.value = station.station_id;
        option.innerHTML = station.nom_gares;
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