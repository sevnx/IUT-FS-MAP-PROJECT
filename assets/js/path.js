function getPath(stationMap, distances, start, end) {
    let path = [], current = end, line = stationMap.get(current).line,
        lineStations = {end: current, stations: [current], line: line};

    while (current !== start) {
        let prev = distances.get(current).station, prevLine = stationMap.get(prev).line;
        if (line !== prevLine) {
            path.push({end : lineStations.end, stations: lineStations.stations.reverse(), line: lineStations.line,
                start: current});
            lineStations = {end: current, stations: [prev], line: prevLine};
            line = prevLine;
        }
        current = prev;
        lineStations.stations.push(current);
    }
    path.push({end : lineStations.end, stations: lineStations.stations.reverse(), line: lineStations.line,
        start: current});
    return path.reverse();
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
        path: getPath(stationMap, distances, start, end),
        time: distances.get(end).time
    };
}