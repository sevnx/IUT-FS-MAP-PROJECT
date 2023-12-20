function isSameLineButDifferentDirection(stationMap, start, end) {
    return stationMap.get(start).line === stationMap.get(end).line &&
        (stationMap.get(start).connection === "1"
            && stationMap.get(end).connection === "2") ||
        (stationMap.get(start).connection === "2"
            && stationMap.get(end).connection === "1");
}

// TODO: refactor this function / make the code cleaner
function getPathSameLineButDifferentDirection(stationMap, distances, start, end) {
    let path = [];
    let current = end;
    let line = stationMap.get(current).line;
    let lineStations = createLineStations(stationMap, current, line);
    lineStations.stations.push(current);

    while (current !== start) {
        let prev = distances.get(current).station;

        if (stationMap.get(prev).connection === "0") {
            lineStations.stations.push(prev);
            path.push(createPathSegment(lineStations, current));
            lineStations = createLineStations(stationMap, prev, line);
        }
        current = prev;
        lineStations.stations.push(current);
    }
    path.push(createPathSegment(lineStations, current));
    return path.reverse();

}

function getPath(stationMap, distances, start, end) {
    let path = [];
    let current = end;
    let lineStations = createLineStations(stationMap, current);
    lineStations.stations.push(current);
    if (isSameLineButDifferentDirection(stationMap, start, end)) {
        return getPathSameLineButDifferentDirection(stationMap, distances, start, end);
    }

    while (current !== start) {
        let prev = distances.get(current).station;
        let prevLine = stationMap.get(prev).line;

        if (lineStations.line !== prevLine) {
            path.push(createPathSegment(lineStations, current));
            lineStations = createLineStations(stationMap, prev, prevLine);
        }

        current = prev;
        lineStations.stations.push(current);
    }

    path.push(createPathSegment(lineStations, current));
    return path.reverse();
}

function createLineStations(stationMap, station, line = stationMap.get(station).line) {
    return { end: station, stations: [], line: line };
}

function createPathSegment(lineStations, start) {
    return {
        end: lineStations.end,
        stations: lineStations.stations.reverse(),
        line: lineStations.line,
        start: start
    };
}

function dijkstra(stationMap, start, end) {
    let visited = [];
    let unvisited = [start];
    let distances = new Map();

    for (let station of stationMap.keys()) {
        distances.set(station, {station: null, time: Infinity});
    }
    distances.set(start, {station: start, time: 0});

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
        path: getPath(stationMap, distances, start, end),
        time: distances.get(end).time
    };
}