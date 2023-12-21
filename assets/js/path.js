/**
 * Checks if we are in the case where the path is always the same line but in different direction
 * Happens in lines 7 and 13
 */
function isSameLineButDifferentTrainNeeded(stationMap, start, end) {
    let startStation = stationMap.get(start);
    let endStation = stationMap.get(end);
    return startStation.line === endStation.line &&
        ((startStation.connection === "1" && endStation.connection === "2") ||
            (startStation.connection === "2" && endStation.connection === "1"));
}

function getPath(stationMap, distances, start, end) {
    let path = [];
    let currentStation = end;
    let doesNeedTrainOnSameLine = isSameLineButDifferentTrainNeeded(stationMap, start, end)
    let lineStations = createLineSegment(stationMap, currentStation);
    lineStations.stations.push(currentStation);

    while (currentStation !== start) {
        let previous = distances.get(currentStation).station;
        let previousLine = stationMap.get(previous).line;
        let isNextSegment = doesNeedTrainOnSameLine ?
            stationMap.get(previous).connection === "0" :
            lineStations.line !== previousLine;

        if (isNextSegment) {
            if (doesNeedTrainOnSameLine) {
                lineStations.stations.push(previous);
            }
            path.push(getLineSegment(lineStations, currentStation));
            lineStations = createLineSegment(stationMap, previous, previousLine);
        }

        currentStation = previous;
        lineStations.stations.push(currentStation);
    }
    path.push(getLineSegment(lineStations, currentStation));
    return path.reverse();
}

function createLineSegment(stationMap, station, line = stationMap.get(station).line) {
    return {end: station, stations: [], line: line};
}

function getLineSegment(lineStations, start) {
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