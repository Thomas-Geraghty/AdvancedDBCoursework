import React from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import { MapContext } from '../MapContext';
import { CrimeDataContext } from '../../CrimeDataContext';
import './LeafletMap.scss'


export default function LeafletMap() {
    const { mState, mDispatch } = React.useContext(MapContext);
    const { cState } = React.useContext(CrimeDataContext);
    const map = React.useRef();

    /**
     * Creates markers representing crimes based on data from CrimeDataContext.
     * Sizes and colors are automatically adjusted based on relative values
     * Plots onto map whenever context state field 'nearby' is updated.
     */
    function createMarkers() {
        if(cState.nearby !== null) {
            const markers = cState.nearby.map(crime => {
                return createMarker(crime)
            })
            return markers;
        } else {
            return null;
        }
    }

    // Creates actual marker element.
    function createMarker(crime) {
        if (mState.viewport.zoom > 10) {
            return <Marker
                key={`${crime._id.coordinates[1]}-${crime._id.coordinates[0]}`}
                position={[crime._id.coordinates[1], crime._id.coordinates[0]]}
                icon={new L.divIcon({
                    html: `${createMarkerIcon(crime.count, crime.distribution_point)}`
                })}
            >
                <Popup autoPan={false}>
                    Crime count: {crime.count}
                    <br />
                    Handled by: {crime.falls_within}.
                    <br />
                    Location: {crime.street_name}.
                    <br />
                    </Popup>
            </Marker>
        }

        function createMarkerIcon(value, distribution_point) {
            value = distribution_point
            var sizeValue = Math.min(Math.max(value/2, 25), 200)
            var colorValue = 100 - distribution_point;
        
            return `<svg height="${sizeValue}" width="${sizeValue}">
                        <circle cx="${sizeValue/2}" cy="${sizeValue/2}" r="${(sizeValue/2)}" fill=${perc2color(colorValue)} />
                    </svg>`
        
            function perc2color(perc) {
                var r, g, b = 0;
                r = 255;
                g = Math.round((perc / 100) * 255);
                var h = r * 0x10000 + g * 0x100 + b * 0x1;
                return '#' + ('000000' + h.toString(16)).slice(-6);
            }
        }
    }

    /**
     * Renders LeafletMap element, TileLayer (provided by OSM) and Marker elements.
     */
    return (
        console.log("map render"),
        <Map
            viewport={mState.viewport}
            ref={map}
            onViewportChanged={(newviewport) => {
                console.log("map viewport update");
                mDispatch({ type: 'SET_VIEWPORT', payload: newviewport });
                mDispatch({ type: 'SET_VIEWBOUNDS', payload: map.current.leafletElement.getBounds() });
            }}
            au
            onload={() => { mDispatch({ type: 'SET_VIEWBOUNDS', payload: map.current.leafletElement.getBounds() }) }}
        >
            <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors" />
            {createMarkers()}
        </Map>
    )
}
