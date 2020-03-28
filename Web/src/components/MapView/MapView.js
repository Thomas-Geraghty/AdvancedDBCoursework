import React from "react";
import MainContext from './MainContext'
import CrimeDataContext from './CrimeDataContext'
import LeafletMap from './Map/LeafletMap.js';
import InteractionMenu from "./InteractiveMenu/InteractionMenu";
import SearchBar from './SearchBar/SearchBar';
import './MapView.scss';


function MapView() {
  return (
    <div className="MapView">
      <MainContext>
        <CrimeDataContext>
          <SearchBar />
          <LeafletMap />
          <InteractionMenu />
        </CrimeDataContext>
      </MainContext>
    </div>
  )
};

export default MapView;