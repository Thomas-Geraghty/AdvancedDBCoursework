import React, { useEffect } from 'react'
import { MapContext } from './MapContext'
import { getCrimesWithinArea, getCrimeTypes } from '../API';

export const CrimeDataContext = React.createContext();

const initialState = {
  nearby: [],
  crime_types: [],
  map_settings: {}
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_NEARBY':
      return { ...state, nearby: action.payload };
    case 'SET_CRIME_TYPES':
      return { ...state, crime_types: action.payload };
    case 'SET_MAP_SETTINGS':
      return { ...state, map_settings: action.payload };
    default:
      break
  }
};

export default ({ children }) => {
  const [ cState, cDispatch ] = React.useReducer(reducer, initialState)
  const { mState } = React.useContext(MapContext);

  // Get Nearby Crime Data
  useEffect(() => {
    if (mState.viewbounds && mState.viewport.zoom > 14) {
      getCrimesWithinArea(mState.viewbounds)
        .then(result => {
          cDispatch({ type: 'SET_NEARBY', payload: result })
        });
    }
  }, [mState.viewbounds])

  // Get crime types
  useEffect(() => {
    getCrimeTypes()
      .then(result => {
        result.push('All')
        cDispatch({ type: 'SET_CRIME_TYPES', payload: result })
      });
  }, [])

  const CrimeData = { cState, cDispatch }

  return <CrimeDataContext.Provider value={CrimeData}>{children}</CrimeDataContext.Provider>
}
