import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { ITelemetryData } from '../../shared/Models';
import { Constants } from '../../shared/utils/constants';
import { SpzaInstrumentService } from '../../shared/services/telemetry/spza/spzaInstrument';

export interface IBasicSearchProps {
    changeHandler: (searchText: string) => void;
    defaultValue?: string;
    isEmbedded: boolean;
    host: string;
}

export default class BasicSearch extends SpzaComponent<IBasicSearchProps, any> {
    private searchRef: HTMLInputElement;

    logSearchTelemetry() {
        const details = {
            searchTerm: this.searchRef.value,
            source: this.props.host
        };
        const payload: ITelemetryData = {
            page: 'In App Gallery(' + this.props.host + ')',
            action: Constants.Telemetry.Action.Search,
            actionModifier: Constants.Telemetry.ActionModifier.Info,
            details: JSON.stringify(details)
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
    }

    renderImpl() {
        let context = this.context as any;
        return (
            <div className='basicSearchBox'>
                {
                    /* 
                        TODO : Split this into 2 components or get the design changed for the embed experience
                        For the embed case, we set the value of the input box from the state. This is faster as we not using azure search and no much logic involved for filtering.
                        If we use the same logic for the homepage basic search, it will be super slow as there is a lot of processing involved in the filtering logic and as a result
                        some of the characters will be skipped while typing them and give incorrect results.
                     */
                    this.props.isEmbedded ?
                        <div>
                            <input className='searchInput'
                                ref={(el) => { this.searchRef = el; }}
                                type='text'
                                defaultValue={this.props.defaultValue}
                                value={this.props.defaultValue}
                                placeholder={context.loc('Embedded_SearchPlaceholder')}
                                onChange={() => {
                                    this.logSearchTelemetry();
                                    this.props.changeHandler(this.searchRef.value);
                                }} />
                            <button className='searchButton'>
                                <span className='c-glyph'></span>
                            </button>
                        </div> :
                        <div>
                            <input className='searchInput'
                                ref={(el) => { this.searchRef = el; }}
                                type='text'
                                defaultValue={this.props.defaultValue}
                                placeholder={context.loc('SB_Placeholder')}
                                onChange={() => this.props.changeHandler(this.searchRef.value)} />
                            <button className='searchButton'>
                                <span className='c-glyph'></span>
                            </button>
                        </div>
                }
            </div>
        );
    }
}

(BasicSearch as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
