const defaultParisCoordinates = [48.855, 2.32];
var map;
let firstSelect;
let secondSelect;
let isMapSatellite = false;

function initSelect() {
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
document.addEventListener("DOMContentLoaded", async function() {
    initSelect()
    map = getGoogleMap();
    defineActionButtons();
    let stations = await getStations();
    let interconnections = await getLiaisons();
    await populateMapWithStationsAndConnections(map, stations, interconnections);
    loadStationDatalist(stations);

    var isActive = false
    setInterval(() => {
        if(firstSelect.station){
            firstSelect.marker.current.setIcon(
                {
                    url: 'assets/line_icons/' + (!isActive ? 'corresp' : 'selected') + '.png',
                    scaledSize: new google.maps.Size(12, 12),
                    anchor: new google.maps.Point(5, 6)
            })
        }
        if(secondSelect.station){
            secondSelect.marker.current.setIcon(
                {
                    url: 'assets/line_icons/' + (isActive ? 'corresp' : 'selected') + '.png',
                    scaledSize: new google.maps.Size(12, 12),
                    anchor: new google.maps.Point(5, 6)
            })
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

function getMarkerForOneLineStation(station) {
    icon = {
        url: 'assets/line_icons/empty'+station.line_number +'.png',
        scaledSize: new google.maps.Size(7, 7),
        anchor: new google.maps.Point(3, 4)
    }

    if(station.is_end == "True"){
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

function getMarkerForMultiLineStation(station, stations) {
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

function getAmmountOfLinesForStation(stationName, stations) {
    return getLinesForStation(stationName, stations).length;
}

function getMarkerBasedOnLines(stationName, station, stations) {
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

var infoWindow = null;

function addStationsToMap(map, stations) {
    let processedStations = [];
    stations.forEach(station => {
        if (processedStations.includes(station.nom_gares)) return;
        // setTimeout(() => {
            let marker = getMarkerBasedOnLines(station.nom_gares, station, stations)

            marker.addListener('click', function(e) {                        

                if(firstSelect.station && secondSelect.station){
                    firstSelect.marker.current.setIcon(firstSelect.marker.initialIcon)
                    secondSelect.marker.current.setIcon(secondSelect.marker.initialIcon)
                    initSelect()
                    document.getElementById("departure").value = ""
                    document.getElementById("arrival").value = ""
                }


                if(firstSelect.station && !secondSelect.station){
                    secondSelect = {
                        station:station,
                        marker: {
                            current:marker,
                            initialIcon:marker.getIcon()
                        }
                    };
                    document.getElementById("arrival").value = secondSelect.station.nom_gares
                }else{
                    firstSelect = {
                        station:station,
                        marker: {
                            current:marker,
                            initialIcon:marker.getIcon()
                        }
                    };
                    document.getElementById("departure").value = firstSelect.station.nom_gares
                }

                marker.setIcon({
                    url: 'assets/line_icons/selected.png',
                    scaledSize: new google.maps.Size(12, 12),
                    anchor: new google.maps.Point(5, 6)
                });
                marker.setZIndex(900) 
            });
  
            
            marker.addListener('mouseover', function() {
                if (infoWindow)
                    infoWindow.close();
                
                infoWindow = getInfoWindow(station, stations);
                infoWindow.open(map, marker);
            });

            marker.addListener('mouseout', function() {
                if (infoWindow)
                    infoWindow.close();
            });

            marker.setMap(map);
        // }, 10*processedStations.length);
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