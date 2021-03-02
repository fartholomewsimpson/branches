import React, { RefObject } from 'react';

import { Coord, Segment } from "./interfaces/branch";
import { Map } from './map';
import { ruleset } from './interfaces/lex';

interface ContainerState {
    age: number,
    lexGens: [string],
    start: Coord,
    axiom: string,
    rules: ruleset,
}

export class Main extends React.Component<{}, ContainerState> {
    private width = 1400;
    private height = 600;
    private segSize = 20;
    private rotationSize = .5;
    private canvasRef: RefObject<HTMLCanvasElement>;
    private segTemplate: Segment;

    constructor(props: {}) {
        super(props);
        this.canvasRef = React.createRef();
        const start = { x: this.width/2, y: this.height-10 };
        this.state = {
            age: 0,
            lexGens: ['L'],
            start,
            axiom: 'L',
            rules: {
                'L': 'L[-L][+L]',
                'X': 'L[+XL]',
                'Y': '[+L]',
            },
        };
    }

    render = () => {
        return (
            <div style={{ display: 'inline-block', height: this.height }}>
                <div style={{ display: 'inline-block', width: 400, verticalAlign: 'top' }}>
                    <h1>Plant Drawing</h1>
                    <div style={{ borderBottom: '1px solid black', paddingBottom: 20, marginBottom: 20 }}>
                        <div style={{ display: 'inline-block' }}>
                            <button style={{display: 'block'}} onClick={this.updateBranches}>Grow</button>
                            <button style={{display: 'block'}} onClick={this.clear}>Clear</button>
                        </div>
                        <div style={{ display: 'inline-block', marginLeft: 20 }}>
                            Rules: {
                                Object.keys(this.state.rules).map(r => (
                                    <div key={`${r}:${this.state.rules[r]}`}>
                                        {r}: <input value={this.state.rules[r]} onChange={e => this.handleRuleChange(r, e)}></input>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div style={{display: 'inline-block', width: 'inherit'}}>
                        <Map
                            onEdit={this.handleEdit}
                            age={this.state.age}
                            axiom={this.state.axiom}
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

    handleRuleChange = (rule: string, event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({rules: { ...this.state.rules, [rule]: event.target.value }});
    }

    handleEdit = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({axiom: event.target.value, lexGens: [event.target.value], age: 0});
    }

    clear = () => {
        const context = this.canvasRef.current.getContext('2d');
        context.clearRect(0, 0, this.width, this.height);
        this.setState({axiom: '', lexGens: [''], age: 0});
    }

    updateBranches = () => {
        const context = this.canvasRef.current.getContext('2d');
        if (!context) {
            return;
        }

        this.segTemplate = {
            start: this.state.start,
            rotation: 0,
        };

        this.grow(context);
    }

    grow = (context: CanvasRenderingContext2D) => {
        let { age, lexGens } = this.state;
        const lex = lexGens[lexGens.length-1];
        const branchStack: Segment[] = [];

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.moveTo(this.segTemplate.start.x, this.segTemplate.start.y);
        for (let i = 0; i < lex.length; i++) {
            switch (lex[i]) {
                case "L":
                    const newSeg: Segment = {
                        start: this.segTemplate.end ?? this.segTemplate.start,
                        rotation: this.segTemplate.rotation,
                    };
                    newSeg.end = this.calcEnd(newSeg);
                    this.segTemplate = newSeg;
                    break;
                case "[":
                    branchStack.push({
                        start: this.segTemplate.start,
                        rotation: this.segTemplate.rotation,
                        end: this.segTemplate.end,
                    });
                    break;
                case "]":
                    this.segTemplate = branchStack.pop();
                    break;
                case "+":
                    this.segTemplate.rotation += this.rotationSize;
                    break;
                case "-":
                    this.segTemplate.rotation -= this.rotationSize;
                    break;
            }
            this.drawSeg(context, this.segTemplate);
        }
        context.stroke();
        lexGens.push(this.ageLex(lexGens[lexGens.length - 1]));
        age++;
        this.setState({ age, lexGens });
    }

    ageLex = (oldLex: string) => {
        let newLex = '';
        for (let i = 0; i < oldLex.length; i++) {
            const oldChar = oldLex[i];
            const newWord = this.state.rules[oldChar];
            if (!!newWord) {
                newLex += newWord;
            } else {
                newLex += oldChar;
            }
        }
        return newLex;
    }

    drawSeg = (ctx: CanvasRenderingContext2D, seg: Segment) => {
        ctx.lineTo(seg.end.x, seg.end.y);
    }

    calcEnd = (seg: Segment) => {
        return ({
            x: seg.start.x + (Math.sin(seg.rotation) * this.segSize),
            y: seg.start.y + (-Math.cos(seg.rotation) * this.segSize),
        });
    }
}
