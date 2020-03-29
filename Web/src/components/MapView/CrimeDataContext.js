import React, { useEffect } from 'react'
import { MainContext } from './MainContext'
import { getNearbyCrimes } from '../../client/API';

export const CrimeDataContext = React.createContext();

const initialState = {
  nearby: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'RESET':
      let reset = {
        nearby: state.nearby
      };
      return reset;
    case 'SET_NEARBY':
      return { ...state, nearby: action.payload };
  }
};

export default ({ children }) => {
  const [ cState, cDispatch ] = React.useReducer(reducer, initialState)
  const { mState } = React.useContext(MainContext);

  // Get Nearby Crime Data
  useEffect(() => {
    if (mState.viewport) {
      getNearbyCrimes(mState.viewport.center, 100)
        .then(result => {
          cDispatch({ type: 'SET_NEARBY', payload: result })
        });
    }
  }, [mState.viewport])

  const CrimeData = { cState, cDispatch }

  return <CrimeDataContext.Provider value={CrimeData}>{children}</CrimeDataContext.Provider>
}