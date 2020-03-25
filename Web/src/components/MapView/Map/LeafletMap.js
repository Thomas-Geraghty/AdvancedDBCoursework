import React from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker, LayerGroup, Polyline } from 'react-leaflet'
import { MainContext } from '../MainContext';
import { PublicTransportContext } from '../PublicTransportContext';
import { svgIconHandler } from '../../../client/Base64icons';
import './LeafletMap.scss'

export default function LeafletMap() {
    const { mState, mDispatch } = React.useContext(MainContext);
    const { ptState, ptDispatch } = React.useContext(PublicTransportContext);

    // Creates markers for nearby stops
    function createMarkers() {
        return ptState.nearby.map(stop => {
            return createMarker(stop)
        })
    }

    // Creates marker for stop
    function createMarker(stop, color, bgColor) {
        if (stop.atco === ptState.activeStopID) {
            color = 'orange';
            bgColor = 'black';
        }

        if (mState.viewport.zoom > 14) {
            return <Marker
                key={stop.atco}
                atco={stop.atco}
                position={[stop.lat, stop.lon]}
                icon={new L.divIcon({
                    html: `${svgIconHandler(stop.type, color, bgColor)}`,
                    className: stop.atco === ptState.activeStopID ? 'active' : null
                })}
                onClick={() => { onClick() }}
            />

            function onClick() {
                if (stop.atco !== ptState.activeStopID) {
                    ptDispatch({ type: 'SET_ACTIVE_STOP_ID', payload: stop.atco })
                } else {
                    ptDispatch({ type: 'RESET' })
                }
            }
        }
    }

    // Creates service line
    function createServiceLines() {
        return ptState.data.services.map(service => {
            if(!ptState.activeServiceID || service.id === ptState.activeServiceID) {
                service.routes.sort((a, b) => {
                    return b.stops.length - a.stops.length
                });
    
                return (
                    <LayerGroup>
                        {service.routes[0].stops.map(stop => { stop.type = service.type; return createMarker(stop, 'white', service.color) })}
                        {createPolyline(createDecodings(service.routes[0].polyline), service.color)};
                    </LayerGroup>
                )
            }
        })
    }

    // Creates 2-layer polyline
    function createPolyline(points, color) {
        return (
            <LayerGroup key="polylines">
                <Polyline positions={points} color={'white'} weight={5} />
                <Polyline positions={points} color={color} />
            </LayerGroup>
        )
    }

    // Render
    return (
        console.log('maprender'),
        <Map
            viewport={mState.viewport}
            onViewportChanged={(newviewport) => { mDispatch({ type: 'SET_VIEWPORT', payload: newviewport }) }}
            onClick={() => { ptDispatch({ type: 'RESET' }) }}
        >
            <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors" />
            {!ptState.data && createMarkers()}
            {ptState.data && createServiceLines()}
        </Map>
    )
}

function createDecodings(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, Number.isInteger(precision) ? precision : 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};