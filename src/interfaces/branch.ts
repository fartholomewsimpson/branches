export interface Segment {
    age: number,
    start: Coord,
    end: Coord,
    rotation: number,
    parent?: Segment,
};

export interface Coord {
    x: number,
    y: number,
};
