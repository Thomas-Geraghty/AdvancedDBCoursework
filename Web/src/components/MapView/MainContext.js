import React, { useEffect } from 'react'

export const MainContext = React.createContext()

var userLoc = [];

const initialState = {
    viewport: null,
    viewbounds: null,
    location: null
};

const reducer = (state, action) => {

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
            return { ...state, viewbounds: action.payload };
        case 'GET_USER_LOCATION':
            return userLoc;
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
                userLoc = [position.coords.latitude, position.coords.longitude];
                if (mState.viewport === null) {
                    mDispatch({ type: 'SET_VIEWPORT', payload: { center: [position.coords.latitude, position.coords.longitude], zoom: 16 } })
                }
            });
        } else {
            mDispatch({ type: 'SET_VIEWPORT', payload: { center: [52.4862, -1.8904], zoom: 16 } })
        }
<<<<<<< Updated upstream
    }, [])
=======
    })

    useEffect(() => {
        navigator.geolocation.watchPosition((position) => {
            mDispatch({ type: 'SET_LOCATION', payload: [position.coords.latitude, position.coords.longitude] })
        },
        null,
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 250, distanceFilter: 10}
        )
    }, []);
>>>>>>> Stashed changes

    const Main = { mState, mDispatch }

    return <MainContext.Provider value={Main}>{children}</MainContext.Provider>
}
