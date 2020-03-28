import React from "react";
import "./SearchBar.scss";
import { MainContext } from '../MainContext';

export default function MapSearch() {
    const { mDispatch } = React.useContext(MainContext);
    const [ autocomplete, setAutocomplete ] = React.useState([]);

    function geocoderRequest(value) {
        const protocol = "https://";
        const url = 'nominatim.openstreetmap.org';
        const path = '/search?q=';
        const format = '&format=json&addressdetails=1';
        const locality = "West Midlands, England, United Kingdom";
        const xhr = new XMLHttpRequest();

        var query = `${value} ${locality}`.replace(/[^\w\s]/gi, '').replace(/ /g, '+');
        var requestURL = protocol + url + path + query + format;
        xhr.open('GET', requestURL, true);
        xhr.send();

        return new Promise((resolve) => {
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    resolve(response);
                }
            }
        })
    }

    // Handles submitting search, selects first entry
    function onSubmit(e) {
        e.preventDefault();
        geocoderRequest(e.target.input_origin.value).then((response) => {
            mDispatch({ type: 'SET_VIEWPORT', payload: { center: [response[0].lat, response[0].lon], zoom: 15 } });
            setAutocomplete(null)
        })
    }

    // Handles live suggestions whilst typing
    function onInput(e) {
        e.persist();
        if (e.target.value.length >= 4) {
            geocoderRequest(e.target.value).then((response) => {
                const items = response.map((element) => {
                    delete element.address.country_code;
                    delete element.address.county;
                    return (
                        <li data-type="address" onClick={(e) => { mDispatch({ type: 'SET_VIEWPORT', payload: { center: [element.lat, element.lon], zoom: 15 } })} }>
                            <span>address</span>
                            {Object.values(element.address).join(', ')}
                        </li>
                    )
                })
                setAutocomplete(items)
            })
        } else {
            setAutocomplete(null)
        }
    }

    function onSwitch(e) {
        let field1 = e.target.parentNode.input_origin.value;
        let field2 = e.target.parentNode.input_destination.value;

        e.target.parentNode.input_origin.value = field2;
        e.target.parentNode.input_destination.value = field1;
    }

    // Render
    return (
        <div className="search-bar">
            <form className="form" onSubmit={onSubmit}>
                <input className="search-bar__input" type="text" name='input_origin' autoComplete="off" placeholder="Address, town or service..." onChange={onInput}></input>
                <button className="button button--square button--color-1" type="submit"><i className="fa fa-search"></i></button>

                <input className="search-bar__input search-bar__input--slide" type="text" name='input_destination' autoComplete="off" placeholder="Address, town or service..." onChange={onInput}></input>
                <button className="button button--square button--color-1 search-bar__button--slide" type="button" onClick={onSwitch}><i className="fa fa-arrows-v"></i></button>
                <ul className="search-bar__input--autocomplete">{autocomplete}</ul>
            </form>
        </div>
    )
}