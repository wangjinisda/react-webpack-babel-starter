import { IState } from '../../State';
import { ensureCuratedData } from '../../shared/actions/thunkActions';
// import { CuratedGallery as CuratedGalleryComponent } from 'components/curatedGallery';
import { CuratedGallery as CuratedGalleryComponent } from './../../mac/components/curatedGallery';
// import { AppTile } from 'containers/appTile';
import { AppTile } from './../../mac/containers/appTile';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');
import { parseCuratedSections } from '../../shared/utils/hashMapUtils';
import { DataMap } from '../utils/dataMapping';

let { connect } = require('react-redux');

const mapStateToProps = (state: IState, ownProps: any) => {
  let category = (ownProps.category && DataMap.category[ownProps.category]) ? DataMap.category[ownProps.category].backendKey : 'home';

  return {
      TileType: AppTile,
      sections: parseCuratedSections(state.apps.curatedData[category], state.apps.appData, state.apps.appIdMap),
      route: routes.marketplace,
      titleLocKey: 'CuratedType_AppsFor',
      category: category,
      dataMap: ownProps.dataMap
  };
};

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
  return {
    ensureCuratedData: () => {
      return dispatch(ensureCuratedData());
    }
  };
};

const CuratedGallery = connect(
  mapStateToProps,
  mapDispatchToProps
)(CuratedGalleryComponent);

export default CuratedGallery;
