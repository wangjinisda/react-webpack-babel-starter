
// This container points to the common galleyPage component
// While setting the props and dispath methods it calls the galleryPage component
// and updates the galllery page mode to Partners

import { IState } from '../../State';
import { Gallery } from '../components/galleryPage';
import { ensurePartnerData, ensureCuratedPartnerData, ensureAppData } from '../actions/thunkActions';
import { Constants } from '../utils/constants';
import {mapStateToProps, mapDispatchToProps} from './galleryPage';
let { connect } = require('react-redux');

const stateToProps = (state: IState, ownProps: any) => {
    let props = mapStateToProps(state, ownProps);
    props.galleryPageMode = Constants.GalleryPageMode.Partners;
    return props;
};

const dispatchToProps = (dispatch: any, ownProps: any) => {
    return mapDispatchToProps(dispatch, ownProps);
};

const PartnerGalleryPageContainer = connect(
    stateToProps,
    dispatchToProps
)(Gallery);

PartnerGalleryPageContainer.ensureAsyncData = (dispatch: any) => {
    return Promise.all([dispatch(ensurePartnerData()), dispatch(ensureCuratedPartnerData()), dispatch(ensureAppData(true))]);
};

export default PartnerGalleryPageContainer;