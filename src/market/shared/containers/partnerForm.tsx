import * as React from 'react';
import { IState } from '../../State';
import { PartnerListingForm as partnerListFormComponent } from '../components/partnerform';

let { connect } = require('react-redux');

export const mapStateToProps = (state: IState, ownProps: any) => {
    return {
        correlationId: state.config.correlationId
    };
};

const PartnerListingForm = connect(
    mapStateToProps)(partnerListFormComponent);

export default PartnerListingForm as React.StatelessComponent<any>;
