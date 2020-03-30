import React from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import { MapContext } from '../MapContext';
import { CrimeDataContext } from '../CrimeDataContext';
import { svgIconHandler } from '../../../client/Base64icons';
import './LeafletMap.scss'


export default function LeafletMap() {
    const { mState, mDispatch } = React.useContext(MapContext);
    const { cState, cDispatch } = React.useContext(CrimeDataContext);
    const map = React.useRef();

    // Creates markers for nearby stops
    function createMarkers() {
        if(cState.nearby !== null) {
            var markers = cState.nearby.map(crime => {
                return createMarker(crime)
            })
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

        if (mState.viewport.zoom > 10) {
            return <Marker
                position={[crime._id.coordinates[1], crime._id.coordinates[0]]}
                icon={new L.divIcon({
                    html: `${svgIconHandler(crime.count, crime.distribution_point)}`
                })}
                onClick={() => { onClick() }}
            >
                <Popup>
                    Crime count: {crime.count}
                    <br />
                    Handled by: {crime.falls_within}.
                    <br />
                    Location: {crime.street_name}.
                    <br />
                    </Popup>
            </Marker>

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
            ref={map}
            onViewportChanged={(newviewport) => {
                mDispatch({ type: 'SET_VIEWPORT', payload: newviewport });
                mDispatch({ type: 'SET_VIEWBOUNDS', payload: map.current.leafletElement.getBounds() });
            }}
            onClick={() => { cDispatch({ type: 'RESET' }) }}
            onload={() => { mDispatch({ type: 'SET_VIEWBOUNDS', payload: map.current.leafletElement.getBounds() })}}
        >
            <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors" />
            {createMarkers()}
        </Map>
    )
}
