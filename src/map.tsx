import React from 'react';

export interface MapProps {
    age: number,
    axiom: string,
    map: [string],
    onEdit: (event: React.ChangeEvent<HTMLInputElement>) => void,
}

export interface MapState {
    open: boolean,
    text: string,
}

export class Map extends React.Component<MapProps, MapState> {
    constructor(props: MapProps) {
        super(props);
        this.state = {
            open: false,
            text: undefined,
        };
    }

    render = () => {
        return (
            <div>
                Axiom: <input onChange={this.props.onEdit} value={this.props.axiom}/>
                <div onClick={this.openMap}>
                    <p style={{display: 'inline-block'}}>Age: {this.props.age}</p>
                    <div>
                        {!this.state.open
                        ? (
                            <p style={{whiteSpace: 'nowrap', overflow: 'hidden'}}>
                                { `${this.getLatest(this.props.map)}` }
                            </p>
                        ) : (
                            <div>
                                {this.props.map.map((value, index) => (
                                    <p key={`${index}:${value}`}>
                                        { `${index}: ${value}` }
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>);
    }

    getLatest = (map: [string]): string => map[map.length - 1];

    openMap = () => this.setState({ open: !this.state.open });
}
