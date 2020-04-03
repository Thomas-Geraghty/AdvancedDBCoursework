import React, { useEffect } from 'react'
import { MapContext } from './MapView/MapContext'
import { getCrimesWithinArea, getCrimeTypes } from '../API';

export const CrimeDataContext = React.createContext();

/**
 * Intial state setup with empty objects.
 */
const initialState = {
  nearby: [],
  crime_types: [],
  map_settings: {}
};

/**
 * Reducer function for easily accessing context state outside of provider.
 * Used by consumers that subscribe to this.
 */
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_NEARBY':
      return { ...state, nearby: action.payload };
    case 'SET_CRIME_TYPES':
      return { ...state, crime_types: action.payload };
    default:
      break
  }
};

export default ({ children }) => {
  const [cState, cDispatch] = React.useReducer(reducer, initialState)
  const { mState } = React.useContext(MapContext);

  /**
   * Gets nearby crime data if viewbounds is set and viewport is zoomed in enough.
   * Sets results into context state field 'nearby' which is then accessible by any component
   * that subscribes to this context provider.
   * Runs every time the viewbounds change or the map settings are updated.
   */
  useEffect(() => {
    if (mState.viewbounds && mState.viewport.zoom > 14) {
      getCrimesWithinArea(mState.viewbounds, mState.map_settings.startDate, mState.map_settings.endDate, mState.map_settings.crimeType)
        .then(result => {
          cDispatch({ type: 'SET_NEARBY', payload: result })
        });
    }

    /**
    * Gets crime types and sets them into the context state.
    * Accessible by any component that subscribes to this context provider.
    */
    if (cState.crime_types.length == 0) {
      getCrimeTypes()
      .then(result => {
        result.push('All')
        cDispatch({ type: 'SET_CRIME_TYPES', payload: result })
      })
    }
  }, [mState.viewbounds, mState.map_settings])

  const CrimeData = { cState, cDispatch }

  return <CrimeDataContext.Provider value={CrimeData}>{children}</CrimeDataContext.Provider>
}
