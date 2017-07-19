import * as React from 'react';
import { IState } from '../../State';
import { BillingRegionPicker as BillingRegionPickerComponent } from '../components/billingRegionPicker';
let { connect } = require('react-redux');
// import { changeBillingRegion } from 'actions/thunkActions';
import { changeBillingRegion } from './../../mac/actions/thunkActions';

const mapStateToProps = (state: IState, ownProps: any) => {
    return {
    };
};

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        setBillingCountry: (countryCode: string) => {
            let countryCodeValue = countryCode ? countryCode.toLowerCase() : countryCode;
            return dispatch(changeBillingRegion(countryCodeValue));
        }
    };
};

export const BillingRegionPicker = connect(mapStateToProps, mapDispatchToProps)(BillingRegionPickerComponent) as React.StatelessComponent<any>;