import React, { useEffect } from "react";
import "./MapSettings.scss";
import { CrimeDataContext } from '../../CrimeDataContext';
import { MapContext } from "../MapContext";

const d = new Date(); 

export default function MapSearch() {
    const { cState } = React.useContext(CrimeDataContext);
    const { mState, mDispatch } = React.useContext(MapContext);
    const [ active, setActive ] = React.useState(false);
    const [ startDate, setStartDate] = React.useState(dateFormatter(new Date(d.setMonth(d.getMonth() - 6))));
    const [ endDate, setEndDate ] = React.useState(dateFormatter(new Date() ));
    const [ crimeType, setCrimeType] = React.useState('All');

    const crime_options = cState.crime_types.map(type => {
        return <option value={type}>{type}</option>
    })

    /**
     * Formats ISO date into the correct format for use in a
     * the input field type 'date' (a datepicker used in forms).
     */
    function dateFormatter(date) {
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let yyyy = date.getFullYear();
        if (dd < 10) { dd = '0' + dd; }
        if (mm < 10) { mm = '0' + mm; }
        return `${yyyy}-${mm}-${dd}`;
    }

    /**
     * Updates map settings in the MapContext whenever startDate, endDate or crimeType
     * is updated. These values are acquired from the form inside the map setting option menu.
     */
    useEffect(() => {
        mDispatch({ type: 'SET_MAP_SETTINGS', payload: { startDate: startDate, endDate: endDate, crimeType: crimeType } })
    }, [startDate, endDate, crimeType])

    /**
     * Renders map settings element and inner form.
     */
    return (
        <div className={`map-settings ${ active ? "active" : "" }`}>
            <button className="button button--square button--color-1" onClick={() => { active ? setActive(false) : setActive(true) }}>
                <i className="fa fa-gear"></i>
            </button>
            <div className="map-settings__slide-out">
                <form>
                    <div className="map-settings__date-selector">
                        <h4>Date</h4>
                        <input type="date" name="date-start" value={startDate}
                            onChange={(e) => { setStartDate(e.target.value) }}>
                        </input>
                        <p>to</p>
                        <input type="date" name="date-end" value={endDate}
                            onChange={(e) => { setEndDate(e.target.value) }}>
                        </input>
                    </div>

                    <div className="map-settings__crime-selector">
                        <h4>Crime Type</h4>
                        <select name="crime-type" value={crimeType}
                        onChange={(e) => { setCrimeType(e.target.value) }}>>
                            {crime_options}
                        </select>
                    </div>
                </form>
            </div>
        </div>
    )
}
