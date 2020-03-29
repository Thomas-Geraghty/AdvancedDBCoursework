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
        console.log(cState.nearby);
        if(cState.nearby !== null) {
            var markers = cState.nearby.map(crime => {
                return createMarker(crime)
            })
            console.log(markers.length);
            return markers;
        } else {
            return null;
        }
    }

    // Creates marker for stop
    function createMarker(crime, color, bgColor) {
        if (crime.atco === cState.activeStopID) {
            color = 'orange';
            bgColor = 'black';
        }

        if (mState.viewport.zoom > 14) {
            return <Marker
                position={[crime._id.coordinates[1], crime._id.coordinates[0]]}
                icon={new L.divIcon({
                    html: `${svgIconHandler(crime.count)}`
                })}
                onClick={() => { onClick() }}
            />

            function onClick() {
                if (crime.atco !== cState.activeStopID) {
                    cDispatch({ type: 'SET_ACTIVE_STOP_ID', payload: crime.atco })
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