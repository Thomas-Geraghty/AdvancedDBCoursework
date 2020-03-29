import React, { useEffect } from 'react'

export const MainContext = React.createContext()

const initialState = {
    viewport: null,
    viewbounds: null,
    location: null
};

const reducer = (state, action) => {
    console.log(action.type)

    switch (action.type) {
        case 'SET_VIEWPORT':
            if(state.viewport !== action.payload) {
                return { ...state, viewport: action.payload };
            }
            break;
        case 'SET_LOCATION':
            if(state.location !== action.payload) {
                return { ...state, location: action.payload };
            }
            break;
        case 'SET_VIEWBOUNDS':
            return { ...state, location: action.payload };
        default:
            break;
    }
};

export default ({ children }) => {
    const [mState, mDispatch] = React.useReducer(reducer, initialState)

    // GPS stuff for setting map to user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                mDispatch({ type: 'SET_LOCATION', payload: [position.coords.latitude, position.coords.longitude] })
                if (mState.viewport === null) {
                    mDispatch({ type: 'SET_VIEWPORT', payload: { center: [position.coords.latitude, position.coords.longitude], zoom: 16 } })
                }
            });
        } else {
            mDispatch({ type: 'SET_VIEWPORT', payload: { center: [52.4862, -1.8904], zoom: 16 } })
        }
    }, [])

    const Main = { mState, mDispatch }

    return <MainContext.Provider value={Main}>{children}</MainContext.Provider>
}