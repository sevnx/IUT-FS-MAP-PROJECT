function getPath(distances, start, end) {
    let path = [];
    for (let station = end; station !== start; station = distances.get(station).station) {
        path.unshift(station);
    }
    path.unshift(start);
    return path;
}

function dijkstra(stationMap, start, end) {
    let visited = [];
    let unvisited = [start];
    let distances = new Map();

    for (let station of stationMap.keys()) {
        distances.set(station, { station: null, time: Infinity });
    }
    distances.set(start, { station: start, time: 0 });

    while (unvisited.length > 0) {
        unvisited.sort((a, b) => distances.get(a).time - distances.get(b).time);
        let currentStation = unvisited.shift();

        for (let {station, time} of stationMap.get(currentStation).adjacentStations) {
            if (visited.includes(station)) continue;
            let candidateTime = distances.get(currentStation).time + time;
            if (candidateTime < distances.get(station).time) {
                distances.set(station, {station: currentStation, time: candidateTime});
                unvisited.push(station);
            }
        }
        visited.push(currentStation);
    }

    return {
        path: getPath(distances, start, end),
        time: distances.get(end).time
    };
}