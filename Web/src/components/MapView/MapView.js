import React from "react";
import MainContext from './MainContext'
import PublicTransportContext from './PublicTransportContext'
import LeafletMap from './Map/LeafletMap.js';
import InteractionMenu from "./InteractiveMenu/InteractionMenu";
import SearchBar from './SearchBar/SearchBar';
import './MapView.scss';


function MapView() {
  return (
    <div className="MapView">
      <MainContext>
        <PublicTransportContext>
          <SearchBar />
          <LeafletMap />
          <InteractionMenu />
        </PublicTransportContext>
      </MainContext>
    </div>
  )
};

export default MapView;