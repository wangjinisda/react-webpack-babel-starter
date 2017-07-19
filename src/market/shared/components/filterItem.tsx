import * as React from 'react';
import { ILocContext, IBuildHrefContext, ICommonContext } from '../interfaces/context';
import { IDataValues } from '../utils/dataMapping';
import { InternalLink } from './internalLink';
import { urlPush } from '../routerHistory';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { ITelemetryData } from '../Models';
import SpzaComponent from './spzaComponent';

export interface IFilterItemProps<T> {
    filter: IDataValues;
    isActive: boolean;
    category: string;
    queryValue: string;
    href: string;
    showExpandedIcon?: boolean;
    hideCheckbox?: boolean;
    onClick?: () => void;
    iconClassName?: string;
    resultCount?: number;
    className?: string;
}

export function handleFilterToggle(
    filterType: string,
    filterValue: string,
    isActive: boolean,
    href: string,
    actionModifier: string,
    clickCallback?: () => void) {

    return (e?: any) => {
        if (!href) {
            return;
        }

        let data = {
            filterType: filterType,
            filterValue: filterValue,
            isActive: isActive
        };
        let payload: ITelemetryData = {
            page: href,
            action: Constants.Telemetry.Action.FilterClick,
            actionModifier: actionModifier,
            details: JSON.stringify(data)
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
        urlPush(href);

        if (clickCallback) {
            clickCallback();
        }
    };
}

export default class FilterItem<T> extends SpzaComponent<IFilterItemProps<T>, any> {
    context: ILocContext & IBuildHrefContext & ICommonContext;

    renderImpl() {
        let filter = this.props.filter;
        let itemClassName = this.props.className ? this.props.className : 'spza_filterItem';
        let filterText = this.context.loc(
            ((filter as any).locKey ? (filter as any).locKey : filter.LocKey),
            ((filter as any).title ? (filter as any).title : filter.Title));

        if (this.props.showExpandedIcon) {
            filterText += ' >';
        }

        let clickHandler = handleFilterToggle(
            this.props.category,
            this.props.queryValue,
            this.props.isActive,
            this.props.href,
            Constants.Telemetry.ActionModifier.FilterPane,
            this.props.onClick
        );

        return (
            <div className='c-checkbox filterItem'>
                <label className={itemClassName + ' filterItemName' + (this.props.isActive ? ' spza_activeFilter' : '')}>
                    {
                        !this.props.hideCheckbox ?
                            <input tabIndex={-1} type='checkbox' checked={this.props.isActive} onClick={clickHandler} /> : null
                    }
                    <span>
                        <InternalLink accEnabled={true} href={this.props.href} onClick={clickHandler} className='' key={filter.FilterID} >
                            {
                                this.props.iconClassName ? (
                                    <div className='productIcon'>
                                        <div className={this.props.iconClassName}></div>
                                    </div>
                                ) : null
                            }
                            <span className='filterText'>{filterText}</span>
                        </InternalLink>
                    </span>
                    <span className='resultCount'>{this.props.resultCount ? this.props.resultCount : null}</span>
                </label>
            </div>
        );
    }
}

(FilterItem as any).contextTypes = {
    loc: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
