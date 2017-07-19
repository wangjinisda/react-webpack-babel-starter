import { IState } from '../../State';
import { ensureCuratedData } from '../actions/thunkActions';
import { CuratedGallery as CuratedGalleryComponent } from './../components/curatedGallery';
// import { AppTile } from 'containers/appTile';
import { AppTile } from './../../mac/containers/appTile';
import { routes } from '../routerHistory';
import { parseCuratedSections } from '../../shared/utils/hashMapUtils';
import { DataMap } from '../utils/dataMapping';

let { connect } = require('react-redux');

const mapStateToProps = (state: IState, ownProps: any) => {
  let category = (ownProps.category &&  DataMap.products[ownProps.category]) ? DataMap.products[ownProps.category].BackendKey : 'everything';
  let section = state.apps.curatedData[category] ? state.apps.curatedData[category] : state.apps.curatedData['everything'];

  return {
    TileType: AppTile,
    sections: parseCuratedSections(section, state.apps.appData, state.apps.appIdMap),
    route: routes.marketplace,
    titleLocKey: 'CuratedType_AppsFor'
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
