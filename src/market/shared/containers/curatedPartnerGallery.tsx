import { IState } from '../../State';
import { ensureCuratedPartnerData } from '../actions/thunkActions';
import { CuratedGallery as CuratedGalleryComponent } from './../components/curatedGallery';
import { PartnerTile } from './../components/partnerTile';
import { routes } from '../routerHistory';
import { parseCuratedSections } from '../../shared/utils/hashMapUtils';
import { DataMap } from '../utils/dataMapping';

let { connect } = require('react-redux');

const mapStateToProps = (state: IState, ownProps: any) => {
  let category = (ownProps.category &&  DataMap.products[ownProps.category]) ? DataMap.products[ownProps.category].BackendKey : 'everything';
  let section = state.partners.curatedData[category] ? state.partners.curatedData[category] : state.partners.curatedData['everything'];

  return {
    TileType: PartnerTile,
    sections: parseCuratedSections(section, state.partners.partnerData, state.partners.partnerIdMap),
    route: routes.marketplacePartners,
    titleLocKey: 'CuratedType_PartnersFor'
  };
};

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
  return {
    ensureCuratedData: () => {
      return dispatch(ensureCuratedPartnerData());
    }
  };
};

const CuratedPartnerGallery = connect(
  mapStateToProps,
  mapDispatchToProps
)(CuratedGalleryComponent);

export default CuratedPartnerGallery;
