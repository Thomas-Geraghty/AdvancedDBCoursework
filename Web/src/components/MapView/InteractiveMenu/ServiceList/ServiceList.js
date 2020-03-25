import React from "react";
import { PublicTransportContext } from '../../PublicTransportContext';
import './ServiceList.scss';

export default function ServiceList() {
    const { ptState } = React.useContext(PublicTransportContext);

    return (
        <div className="services__list">
            <h4 className="services__list--title">Services</h4>
            <ul className="services__list--list">
                {ptState.data.services.map((service) => {
                    return <ServiceListItem
                        key={service.id}
                        id={service.id}
                        name={service.name}
                        color={service.color}
                    />;
                })}
            </ul>
        </div>
    )
}

function ServiceListItem(service) {
    const { ptState, ptDispatch } = React.useContext(PublicTransportContext);

    function onClick() {
        if(service.id !== ptState.activeServiceID) {
            ptDispatch({ type: 'SET_ACTIVE_SERVICE_ID', payload: service.id })
        } else {
            ptDispatch({ type: 'SET_ACTIVE_SERVICE_ID', payload: null })
        }
    }

    return (
        <li style={{ color: service.color }} className={(service.id === ptState.activeServiceID && 'active')} onClick={() => { onClick() }}>
            {service.name}
        </li>
    )
}