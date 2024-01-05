/*
 * Checks if we are in the case where the path is always the same line but in different direction (Happens in lines 7 and 13)
 * @param stationMap: Map of all the stations
 * @param start: Starting station
 * @param end: Ending station
 * @return: True if we are in the case, false otherwise
*/
function isSameLineButDifferentTrainNeeded(stationMap, start, end) {
    let startStation = stationMap.get(start);
    let endStation = stationMap.get(end);
    return startStation.line === endStation.line &&
        ((startStation.connection === "1" && endStation.connection === "2") ||
            (startStation.connection === "2" && endStation.connection === "1"));
}

/* 
 * Returns the path from start to end
 * @param stationMap: Map of all the stations
 * @param distances: Map of all the distances
 * @param start: Starting station
 * @param end: Ending station
 * @return: The path
*/
function getPath(stationMap, distances, start, end) {
    let path = [];
    let currentStation = end;
    let doesNeedTrainOnSameLine = isSameLineButDifferentTrainNeeded(stationMap, start, end)
    let lineStations = createLineSegment(stationMap, currentStation);

    while (currentStation !== start) {
        let previous = distances.get(currentStation).station;
        let previousLine = stationMap.get(previous).line;
        let isNextSegmentForSameLine = doesNeedTrainOnSameLine && stationMap.get(previous).connection === "0";

        if (isNextSegmentForSameLine || previousLine !== lineStations.line) {
            doesNeedTrainOnSameLine = lineStations.line === previousLine;
            path.push(getLineSegment(lineStations, doesNeedTrainOnSameLine ? previous : currentStation));
            lineStations = createLineSegment(stationMap, previous, previousLine);
        } else {
            lineStations.stations.push(previous);
        }
        currentStation = previous;
    }
    path.push(getLineSegment(lineStations, currentStation));
    return path.reverse();
}

/*
 * Creates a line segment
 * @param stationMap: Map of all the stations
 * @param station: Station to add to the line segment
 * @param line: Line of the line segment
 * @return: The line segment
*/
function createLineSegment(stationMap, station, line = stationMap.get(station).line) {
    return {end: station, stations: [], line: line};
}

/*
 * Returns the line segment
 * @param lineStations: Line segment
 * @param start: Starting station
 * @return: The line segment
*/
function getLineSegment(lineStations, start) {
    return {
        end: lineStations.end,
        stations: lineStations.stations.slice(0, lineStations.stations.length - 1).reverse(),
        line: lineStations.line,
        start: start
    };
}

/*
 * Returns the path and the time from start to end with Dijkstra algorithm
 * @param stationMap: Map of all the stations
 * @param start: Starting station
 * @param end: Ending station
*/
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