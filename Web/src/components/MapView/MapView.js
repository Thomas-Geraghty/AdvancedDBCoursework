import React from "react";
import MainContext from './MainContext'
import CrimeDataContext from './CrimeDataContext'
import LeafletMap from './Map/LeafletMap.js';
import SearchBar from './SearchBar/SearchBar';
import MapSettings from './MapSettings/MapSettings';
import './MapView.scss';


function MapView() {
  return (
    <div className="MapView">
      <MainContext>
        <CrimeDataContext>
          <SearchBar />
          <MapSettings />
          <LeafletMap />
        </CrimeDataContext>
      </MainContext>
    </div>
  )
};

export default MapView;