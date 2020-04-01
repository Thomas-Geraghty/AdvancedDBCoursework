import React from "react";
import { MapContext } from '../MapContext';
import { geocoderRequest } from "../../../API";
import "./SearchBar.scss";

export default function MapSearch() {
    const { mDispatch } = React.useContext(MapContext);
    const [ autocomplete, setAutocomplete ] = React.useState([]);

    /**
     *  Handles submitting search, selects first entry (aslong as one exists)
     */ 
    function onSubmit(e) {
        e.preventDefault();
        geocoderRequest(e.target.input_origin.value).then((response) => {
            if(response.length > 0) {
                mDispatch({ type: 'SET_VIEWPORT', payload: { center: [response[0].lat, response[0].lon], zoom: 15 } });
                setAutocomplete(null)
            }
        })
    }

    /**
     * Gives live suggestions whilst typing as long as over 3 letters are entered.
     */
    function onInput(e) {
        e.persist();
        if (e.target.value.length >= 3) {
            geocoderRequest(e.target.value).then((response) => {
                let items = response.map((element) => {
                    delete element.address.country_code;
                    delete element.address.county;
                    return (
                        <li data-type="address" onClick={(e) => { mDispatch({ type: 'SET_VIEWPORT', payload: { center: [element.lat, element.lon], zoom: 15 } })} }>
                            <span>address</span>
                            {Object.values(element.address).join(', ')}
                        </li>
                    )
                })
                items = items.slice(0, 5);
                setAutocomplete(items)
            })
        } else {
            setAutocomplete(null)
        }
    }

    // Renders search bar.
    return (
        <div className="search-bar">
            <form className="form" onSubmit={onSubmit}>
                <input className="search-bar__input" type="text" name='input_origin' autoComplete="off" placeholder="Address, town or service..." onChange={onInput}></input>
                <button className="button button--square button--color-1" type="submit"><i className="fa fa-search"></i></button>
                <ul className="search-bar__input--autocomplete">{autocomplete}</ul>
            </form>
        </div>
    )
}