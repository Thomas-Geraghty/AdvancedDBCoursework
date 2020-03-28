import React, { useEffect } from 'react'
import { MainContext } from './MainContext'
import { getNearbyStops, getStopAdvanced, getNearbyCrimes } from '../../client/API';

export const PublicTransportContext = React.createContext();

const initialState = {
  activeStopID: null,
  activeServiceID: null,
  data: null,
  nearby: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'RESET':
      let reset = {
        activeStopID: null,
        activeServiceID: null,
        data: null,
        nearby: state.nearby
      };
      return reset;
    case 'SET_ACTIVE_STOP_ID':
      return { ...state, activeStopID: action.payload };
    case 'SET_ACTIVE_SERVICE_ID':
      return { ...state, activeServiceID: action.payload };
    case 'SET_DATA':
      return { ...state, data: action.payload };
    case 'SET_NEARBY':
      return { ...state, nearby: action.payload };
  }
};

export default ({ children }) => {
  const [ ptState, ptDispatch ] = React.useReducer(reducer, initialState)
  const { mState } = React.useContext(MainContext);

  // Get Nearby Crime Data
  useEffect(() => {
    if (mState.viewport) {
      getNearbyCrimes(mState.viewport.center, Math.pow((20 - mState.viewport.zoom), 2.5) * 30)
        .then(result => {
          ptDispatch({ type: 'SET_NEARBY', payload: result })
        });
    }
  }, [mState.viewport])

  const PublicTransport = { ptState, ptDispatch }

  return <PublicTransportContext.Provider value={PublicTransport}>{children}</PublicTransportContext.Provider>
}