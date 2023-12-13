export type Station = {
    num: number;
    nom: string;
    ligne: string;
    terminus: boolean;
    branchement: number;
    posX?: number;
    posY?: number;
    adjacentStations: AdjacentStation[];
};

export type AdjacentStation = {
    time: number;
    station: Station;
};