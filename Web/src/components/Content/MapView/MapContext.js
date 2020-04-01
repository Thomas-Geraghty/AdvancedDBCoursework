import React, { useEffect } from 'react'

export const MapContext = React.createContext()

/**
 * Intial state setup with empty objects.
 */
const initialState = {
    viewport: null,
    viewbounds: null,
    location: null
};

/**
 * Reducer function for easily accessing context state outside of provider.
 * Used by consumers that subscribe to this.
 */
const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_VIEWPORT':
            return { ...state, viewport: action.payload };
        case 'SET_VIEWBOUNDS':
            return { ...state, viewbounds: action.payload };
        case 'SET_MAP_SETTINGS':
            return { ...state, map_settings: action.payload };
        default:
            break;
    }
};

export default ({ children }) => {
    const [mState, mDispatch] = React.useReducer(reducer, initialState)

    /**
     * Sets viewport to user location (if allowed) and if not, set it to Birmingham U.K.
     * Runs only at first load.
     */
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                if (mState.viewport === null) {
                    mDispatch({ type: 'SET_VIEWPORT', payload: { center: [position.coords.latitude, position.coords.longitude], zoom: 16 } })
                }
            });
        } else {
            mDispatch({ type: 'SET_VIEWPORT', payload: { center: [52.4862, -1.8904], zoom: 16 } })
        }
    }, [])

    const Map = { mState, mDispatch }

    return <MapContext.Provider value={Map}>{children}</MapContext.Provider>
}
