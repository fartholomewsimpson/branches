import React, { RefObject } from 'react';

import { Coord, Segment } from "./interfaces/branch";
import { Map } from './map';
import { ruleset } from './interfaces/lex';

interface ContainerState {
    age: number,
    editable: boolean,
    lexGens: [string],
    start: Coord,
}

export class Main extends React.Component<{}, ContainerState> {
    private width = 1400;
    private height = 600;
    private segSize = 20;
    private rotationSize = .5;
    private canvasRef: RefObject<HTMLCanvasElement>;
    private rules: ruleset = {
        'L': 'L[-L][+L]',
        'X': 'L[+XL]',
        'Y': '[+L]',
        '+': '-',
        '-': '+',
    };
    // XXX: Remove need for segments in memory, just draw them as you go
    private baseSegment: Segment;
    // XXX: maybe a better way to rotate than the current '+/-' setup
    // and also find a way to incorporate the brackets into rules? idk

    constructor(props: {}) {
        super(props);
        this.canvasRef = React.createRef();
        const start = { x: this.width/2, y: this.height-10 };
        this.baseSegment = {
            start: start,
            rotation: 0,
            children: [],
        };
        this.baseSegment.end = this.calcEnd(this.baseSegment);
        this.state = {
            age: 0,
            editable: true,
            lexGens: ['L'],
            start,
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
                            <button onClick={this.toggleEditable}>Editable</button>
                        </div>
                        {!this.state.editable && (
                            <div style={{ display: 'inline-block', marginLeft: 20 }}>
                                Rules: {
                                    Object.keys(this.rules).map(r => (
                                        <p key={`${r}:${this.rules[r]}`}>
                                            {r}: {this.rules[r]}
                                        </p>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                    <div style={{display: 'inline-block', width: 'inherit'}}>
                        <Map
                            editMode={this.state.editable}
                            onEdit={this.handleEdit}
                            age={this.state.age}
                            map={this.state.lexGens}
                        />
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

    handleEdit = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({lexGens: [event.target.value]});
    }

    updateBranches = () => {
        const context = this.canvasRef.current.getContext('2d');
        if (!context) {
            return;
        }

        this.baseSegment.children = [];
        context.clearRect(0, 0, this.width, this.height);
        this.grow();
        this.draw(context);
    }

    toggleEditable = () => this.setState({editable: !this.state.editable, age:0});

    grow = () => {
        let { age, lexGens } = this.state;
        const lex = lexGens[lexGens.length-1];
        let curSeg: Segment = this.baseSegment;
        let nextRotation = curSeg.rotation;
        const branchStack: Segment[] = [];
        for (let i = 0; i < lex.length; i++) {
            switch (lex[i]) {
                case "L":
                    const newSeg: Segment = {
                        start: curSeg.end,
                        rotation: nextRotation,
                        parent: curSeg,
                        children: [],
                    };
                    newSeg.end = this.calcEnd(newSeg);
                    curSeg.children.push(newSeg);
                    curSeg = newSeg;
                    break;
                case "[":
                    branchStack.push(curSeg);
                    break;
                case "]":
                    curSeg = branchStack.pop();
                    nextRotation = curSeg.rotation
                    break;
                case "+":
                    nextRotation += this.rotationSize;
                    break;
                case "-":
                    nextRotation -= this.rotationSize;
                    break;
            }
        }
        if (!this.state.editable) {
            lexGens.push(this.ageLex(lexGens[lexGens.length - 1]));
            age++;
        }
        this.setState({ age, lexGens });
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

    draw = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.clearRect(0, 0, this.width, this.height);
        this.drawSeg(ctx, this.baseSegment);
    }

    drawSeg = (ctx: CanvasRenderingContext2D, seg: Segment) => {
        ctx.moveTo(seg.start.x, seg.start.y);
        ctx.lineTo(seg.end.x, seg.end.y);
        ctx.stroke();
        if (!!(seg.children)) {
            seg.children.forEach(c => this.drawSeg(ctx, c));
        }
    }

    // XXX: This should be a class method or something
    calcEnd = (seg: Segment) => {
        return ({
            x: seg.start.x + (Math.sin(seg.rotation) * this.segSize),
            y: seg.start.y + (-Math.cos(seg.rotation) * this.segSize),
        });
    }
}
