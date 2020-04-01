import React from "react";
import MapContext from './MapContext'
import CrimeDataContext from '../CrimeDataContext'
import LeafletMap from './Map/LeafletMap.js';
import SearchBar from './SearchBar/SearchBar';
import MapSettings from './MapSettings/MapSettings';
import './MapView.scss';


function MapView() {
  return (
    <div className="MapView">
      <MapContext>
        <CrimeDataContext>
          <SearchBar />
          <MapSettings />
          <LeafletMap />
        </CrimeDataContext>
      </MapContext>
    </div>
  )
};

export default MapView;