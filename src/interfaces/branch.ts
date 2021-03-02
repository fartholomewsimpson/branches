export interface Segment {
    start: Coord,
    end?: Coord,
    rotation: number,
};

export interface Coord {
    x: number,
    y: number,
};
