import AppView from './containers/appView';
import Home from './containers/home';
// import GalleryPage from 'containers/galleryPage';
import GalleryPage from './containers/galleryPage';
import PartnerGalleryPage from './containers/partnerGalleryPage';
import AppDetails from './containers/appDetails';
import LocalePicker from './components/localepicker';
import Partners from './components/partner';
import MyReviews from './containers/myReview';
import { createSetCurrentViewAction } from './actions/actions';
import PartnerListingForm from './containers/partnerform';
import { AppListingForm }  from './components/appform';
import PartnerDetail from './containers/partnerDetail';
import { routes } from './routerHistory';
// import { BillingRegionPicker } from 'containers/billingRegionPicker';
import { BillingRegionPicker } from './containers/billingRegionPicker';
import TestDrivePage from './containers/testDrivePage';

import * as React from 'react';

let Route = require('react-router').Route;
let IndexRoute = require('react-router').IndexRoute;
// todo: typings for react-router give me error on HistoryModule, so turning them off
// import {Route}  from 'react-router';
// import {IndexRoute} from 'react-router';

// This function returns the React Router component heirarchy with a dispatch method available
// Right now 'dispatch' is being used in the onEnter methods to trigger state updates
export default function(dispatch: (s: any) => void) {

    // Set the current view -- corresponds to state.config.currentView
    let setCurrentView = function(view: string) {
        return function (nextState: any) {
            let action = createSetCurrentViewAction({ currentView: view });
            dispatch(action);
        };
    };

    return (
      // Following route configuration strictly expects 'locale' to be first thing in the pathname
      // Both server.js and buildHREF need to make sure that locale is passed down to this route configuration
      // NOTE:: any change to the testdrive path would need an update to aad.js to enforce auth
      <Route name='app' component={AppView} path='/:locale'>
          <IndexRoute onEnter={setCurrentView(routes.home.name)} component={Home}/>
          <Route path='home' onEnter={setCurrentView(routes.home.name)} component={Home}/>
          <Route path='marketplace' onEnter={setCurrentView(routes.marketplace.name)} component={GalleryPage}/>
          <Route path='marketplace/apps' onEnter={setCurrentView(routes.marketplace.name)} component={GalleryPage}/>
          <Route path='marketplace/partners' onEnter={setCurrentView(routes.marketplacePartners.name)} component={PartnerGalleryPage}/>
          <Route path='marketplace/partners/(:partnerId)' onEnter={setCurrentView(routes.partnerDetail.name)} component={PartnerDetail} />
          <Route path='product/(:productId)/(:appid)' onEnter={setCurrentView(routes.appDetails.name)} component={AppDetails}/>
          <Route path='localepicker' onEnter={setCurrentView(routes.localePicker.name)} component={LocalePicker}/>
          <Route path='partners' onEnter={setCurrentView(routes.partners.name)} component={Partners}/>
          <Route path='partners-form' onEnter={setCurrentView(routes.listApps.name)} component={AppListingForm}/>
          <Route path='partners/list-an-app'  onEnter={setCurrentView(routes.listApps.name)} component={AppListingForm}/>
          <Route path='partners/list-as-partner'  onEnter={setCurrentView(routes.listPartners.name)} component={PartnerListingForm}/>
          <Route path='user/my-reviews' component={MyReviews}/>
          <Route path='billingregion' component={BillingRegionPicker}/>
          <Route path='product/(:productId)/(:appid)/manage/testdrive' component={TestDrivePage}/>
      </Route>
    );
}
