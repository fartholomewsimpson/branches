import React from 'react';

export interface MapProps {
    map: [string],
}

export interface MapState {
    open: boolean,
}

export class Map extends React.Component<MapProps, MapState> {
    constructor(props: MapProps) {
        super(props);
        this.state = {
            open: false,
        };
    }

    render = () => {
        return (
            <div onClick={this.openMap}>
                {
                    !this.state.open
                    ? (
                        <p style={{overflow: 'hidden'}}>
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
                    )
                }
            </div>
        );
    }

    openMap = () => {
        this.setState({ open: !this.state.open });
    }

    getLatest = (map: [string]): string => map[map.length - 1];
}
