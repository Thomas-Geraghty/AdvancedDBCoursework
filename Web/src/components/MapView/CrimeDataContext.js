import React, { useEffect } from 'react'
import { MapContext } from './MapContext'
import { getCrimesWithinArea, getCrimeTypes } from '../../client/API';

export const CrimeDataContext = React.createContext();

const initialState = {
  nearby: [],
  crime_types: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'RESET':
      let reset = {
        nearby: state.nearby,
        crime_types: state.crime_types
      };
      return reset;
    case 'SET_NEARBY':
      return { ...state, nearby: action.payload };
    case 'SET_CRIME_TYPES':
      return { ...state, crime_types: action.payload };
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
