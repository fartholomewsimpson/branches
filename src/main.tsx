import React, { RefObject } from 'react';

import { Coord, Segment } from "./interfaces/branch";
import { Map } from './map';
import { ruleset } from './interfaces/lex';

interface ContainerState {
    age: number,
    lexGens: [string],
    start: Coord,
    segments: Segment[],
    lastSegment?: Segment,
}

export class Main extends React.Component<{}, ContainerState> {
    private width = 1400;
    private height = 600;
    private segSize = 20;
    private rotationSize = .5;
    private canvasRef: RefObject<HTMLCanvasElement>;
    private rules: ruleset = {
        'L': 'LL',
        'X': 'L[+LX]',
        '+': '-',
        '-': '+',
    };

    constructor(props: {}) {
        super(props);
        this.canvasRef = React.createRef();
        this.state = {
            age: 0,
            lexGens: ['X'],
            start: { x: this.width/2, y: this.height-10 },
            segments: [],
        };
    }

    render = () => {
        return (
            <div style={{ display: 'inline-block', height: this.height }}>
                <div style={{ display: 'inline-block', width: 400, verticalAlign: 'top' }}>
                    <h1>Plant Drawing</h1>
                    <div style={{ borderBottom: '1px solid black', marginBottom: 20 }}>
                        <div style={{ display: 'inline-block' }}>
                            <button onClick={this.updateBranches}>Grow</button>
                            <p id="age" style={{ display: 'inline', marginLeft: 10 }}>
                                Age: {this.state.age}
                            </p>
                        </div>
                        <div style={{ display: 'inline-block', marginLeft: 20 }}>
                            Rules: {
                                Object.keys(this.rules).map(r => (
                                    <p key={`${r}:${this.rules[r]}`}>
                                        {r}: {this.rules[r]}
                                    </p>
                                ))
                            }
                        </div>
                    </div>
                    <div style={{display: 'inline-block', width: 'inherit'}}>
                        <Map map={this.state.lexGens} />
                    </div>
                </div>
                <div style={{ display: 'inline-block' }}>
                    <div style={{height: 60}}></div>
                    <canvas
                        style={{ border: '1px solid black' }}
                        ref={this.canvasRef}
                        height={this.height}
                        width={this.width}
                    ></canvas>
                </div>
            </div>
        );
    }

    updateBranches = () => {
        this.grow();
        this.draw();
    }

    grow = () => {
        let { age, lexGens, start, segments } = this.state;
        let curPos = start;
        let curRot = 0;
        let curParent: Segment = undefined;

        // let lex = "";
        // lexGens.forEach(gen => { lex += gen });

        const lex = lexGens[lexGens.length-1];

        for (let i = 0; i < lex.length; i++) {
            switch (lex[i]) {
                case "L":
                    const seg: Segment = {
                        age: age,
                        rotation: curRot,
                        start: {
                            x: curPos.x,
                            y: curPos.y,
                        },
                        end: {
                            x: curPos.x + (Math.sin(curRot) * this.segSize),
                            y: curPos.y + (-Math.cos(curRot) * this.segSize),
                        },
                        parent: curParent,
                    };
                    segments.push(seg);
                    curPos = seg.end;
                    break;
                case "[":
                    curParent = segments[segments.length - 1];
                    break;
                case "]":
                    if (curParent == undefined) {
                    } else {
                        console.log(`end branch curRot: ${curRot}`);
                        curParent = seg.parent;
                        curPos = curParent.end;
                        curRot = curParent.rotation;
                        console.log(`end branch newRot: ${curRot}`);
                    }
                    break;
                case "+":
                    curRot += this.rotationSize;
                    break;
                case "-":
                    curRot -= this.rotationSize;
                    break;
            }
        }
        age++;
        lexGens.push(this.ageLex(lexGens[lexGens.length - 1]));
        this.setState({ age, lexGens, segments });
    }

    ageLex = (oldLex: string) => {
        let newLex = '';
        for (let i = 0; i < oldLex.length; i++) {
            const oldChar = oldLex[i];
            const newWord = this.rules[oldChar];
            if (!!newWord) {
                newLex += newWord;
            } else {
                newLex += oldChar;
            }
        }
        return newLex;
    }

    draw = () => {
        const ctx = this.canvasRef?.current?.getContext('2d');
        if (!ctx) {
            return;
        }

        let { segments } = this.state;
        segments.forEach(({ age, start, end }) => {
            // ctx.lineWidth = age;
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        })
    }
}
