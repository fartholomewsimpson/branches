export interface Segment {
    start: Coord,
    end?: Coord,
    rotation: number,
    parent?: Segment,
    children: Segment[],
};

export interface Coord {
    x: number,
    y: number,
};
