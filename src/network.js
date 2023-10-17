import React from 'react';
import links from './data/connections_ext.json'
import {ForceGraph3D} from 'react-force-graph';

function Network() {
    const nodesSet = new Set();
    const split_links = [];

    for (const line in links){
        for (const pair of links[line]) {
            nodesSet.add(pair[0]);
            nodesSet.add(pair[1]);
            split_links.push({
                source: pair[0],
                target: pair[1],
                distance: pair[2],
                group: `Line ${line}`,
                color: `#${pair[3]}`,
            });
        }
    }

    const nodes = [];

    for (const node of nodesSet){
        nodes.push({id: node, group: 1})
    }

    return (
    <ForceGraph3D
        graphData={{nodes: nodes, links: split_links}}
        nodeLabel="id"
        linkColor="color"
        linkOpacity={0.8}
        linkLabel="group"
        width={window.innerWidth}
        height={window.innerHeight * 0.6}
        backgroundColor='#060412'
    />);
}

export default Network;