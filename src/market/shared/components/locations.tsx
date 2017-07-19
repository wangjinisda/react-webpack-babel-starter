import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IAddress } from './../Models';

export interface ILocationsProps {
    locations: IAddress[];
}

export class Locations extends SpzaComponent<ILocationsProps, any> {
    // line1, city and country are mandatory fields
    buildAddressLine(location: IAddress) {
        let addr = location.line1 + ', ' + location.city;
        if (location.state) {
            addr += ' ' + location.state + ', ';
        }
        addr += location.country;

        if (location.postal) {
            addr += ' ' + location.postal;
        }
        return addr;
    }

    buildLocationTable() {
        if (this.props.locations) {
            return this.props.locations.map((location: IAddress, index: number) => {
                let addr: string = this.buildAddressLine(location);
                return (
                    <tr key={index}>
                        <td>{addr}</td>
                    </tr>
                );
            });
        } else {
            return null;
        }
    }

    renderImpl() {
        return (
            <div className='locationsContent'>
                <table className='locationTable'>
                    <tbody>{this.buildLocationTable()}</tbody>
                </table>
            </div>
        );
    }
}

(Locations as any).contextTypes = {
    renderErrorModal: React.PropTypes.func
};