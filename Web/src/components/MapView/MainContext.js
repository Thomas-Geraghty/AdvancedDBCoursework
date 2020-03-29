import React, { useEffect } from 'react'

export const MainContext = React.createContext()

const initialState = {
    viewport: null,
    location: null
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_VIEWPORT':
            console.log(action.payload);
            return { ...state, viewport: action.payload };
        case 'SET_LOCATION':
            return { ...state, location: action.payload };
    }
};

export default ({ children }) => {
    const [mState, mDispatch] = React.useReducer(reducer, initialState)

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                if(mState.viewport === null) {
                  mDispatch({ type: 'SET_VIEWPORT', payload: { center: [position.coords.latitude, position.coords.longitude], zoom: 16}})
                }
                mDispatch({ type: 'SET_LOCATION', payload: [position.coords.latitude, position.coords.longitude] })
            });
        } else {
            mDispatch({ type: 'SET_VIEWPORT', payload: { center: [52.4862, -1.8904], zoom: 16}})
        }
    })

    /*
    useEffect(() => {
        navigator.geolocation.watchPosition((position) => {
            mDispatch({ type: 'SET_LOCATION', payload: [position.coords.latitude, position.coords.longitude] })
        }, 
        null,
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 250, distanceFilter: 10}
        )
    }, []);
    */

    const Main = { mState, mDispatch }

    return <MainContext.Provider value={Main}>{children}</MainContext.Provider>
}