import React from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet'
import { MainContext } from '../MainContext';
import { CrimeDataContext } from '../CrimeDataContext';
import { svgIconHandler } from '../../../client/Base64icons';
import './LeafletMap.scss'

export default function LeafletMap() {
    const { mState, mDispatch } = React.useContext(MainContext);
    const { cState, cDispatch } = React.useContext(CrimeDataContext);

    // Creates markers for nearby stops
    function createMarkers() {
        if(cState.nearby !== null) {
            return cState.nearby.map(stop => {
                return createMarker(stop)
            })
        } else {
            return null;
        }
    }

    // Creates marker for stop
    function createMarker(stop, color, bgColor) {
        if (stop.atco === cState.activeStopID) {
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
                    className: stop.atco === cState.activeStopID ? 'active' : null
                })}
                onClick={() => { onClick() }}
            />

            function onClick() {
                if (stop.atco !== cState.activeStopID) {
                    cDispatch({ type: 'SET_ACTIVE_STOP_ID', payload: stop.atco })
                } else {
                    cDispatch({ type: 'RESET' })
                }
            }
        }
    }

    // Render
    return (
        <Map
            viewport={mState.viewport}
            onViewportChanged={(newviewport) => { mDispatch({ type: 'SET_VIEWPORT', payload: newviewport }) }}
            onClick={() => { cDispatch({ type: 'RESET' }) }}
        >
            <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors" />
            {createMarkers()}
        </Map>
    )
}