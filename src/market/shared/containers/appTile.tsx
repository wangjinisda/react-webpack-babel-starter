import * as React from 'react';
import { IState } from '../../State';
// import { AppTile as AppTileComponent, IAppTileProps } from 'components/appTile';
import { AppTile as AppTileComponent, IAppTileProps } from './../../mac/components/appTile';
let { connect } = require('react-redux');
import { PricingStates } from '../Models';

const mapStateToProps = (state: IState, ownProps: IAppTileProps) => {
    let props: any = {};
    for (let prop in ownProps) {
        props[prop] = ownProps[prop];
    }
    props.billingCountryCode = state.config.billingCountryCode;

    if (state.config.isEmbedded) {
        props.startingPrice = {
            pricingData: PricingStates.AlwaysAvailable
        };
    }

    return props;
};

export const AppTile = connect(mapStateToProps, null)(AppTileComponent) as React.StatelessComponent<any>;