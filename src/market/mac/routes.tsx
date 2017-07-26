// import AppView from 'containers/appView';
import AppView from './../shared/containers/appView';
// import GalleryPage from 'containers/galleryPage';
import GalleryPage from './../shared/containers/galleryPage';
// import AppDetails from 'containers/appDetails';
import AppDetails from './../shared/containers/appDetails';
// import LocalePicker from 'components/localepicker';
import LocalePicker from './../shared/components/localepicker';
// import MyReviews from 'containers/myReview';
import MyReviews from './../shared/containers/myReview';
// import { createSetCurrentViewAction } from 'actions/actions';
import { createSetCurrentViewAction } from './../shared/actions/actions';
// import { routes } from 'routerHistory';
let { routes } = require('./routerHistory');
import { Marketing } from './components/marketing';
import { About } from './components/about';
// import { BillingRegionPicker } from 'containers/billingRegionPicker';
import { BillingRegionPicker } from './../shared/containers/billingRegionPicker';
// import TestDrivePage from 'containers/testDrivePage';
import TestDrivePage from './../shared/containers/testDrivePage';
// import { FieldHub } from 'containers/fieldHub';
import { FieldHub } from './../shared/containers/fieldHub';

import * as React from 'react';

let { Route, IndexRoute }= require('react-router');
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
          <IndexRoute onEnter={setCurrentView(routes.marketplace.name)} component={GalleryPage}/>
          <Route path='home' onEnter={setCurrentView(routes.marketplace.name)} component={GalleryPage}/>
          <Route path='marketplace' onEnter={setCurrentView(routes.marketplace.name)} component={GalleryPage}/>
          <Route path='marketplace/apps' onEnter={setCurrentView(routes.marketplace.name)} component={GalleryPage}/>
          <Route path='marketplace/apps/category/(:category)' onEnter={setCurrentView(routes.marketplace.name)} component={GalleryPage}/>
          <Route path='marketplace/apps/(:appid)' onEnter={setCurrentView(routes.appDetails.name)} component={AppDetails}/>
          <Route path='localepicker' onEnter={setCurrentView(routes.localePicker.name)} component={LocalePicker}/>
          <Route path='user/my-reviews' component={MyReviews}/>
          <Route path='sell' onEnter={setCurrentView(routes.marketing.name)} component={Marketing}/>
          <Route path='about' onEnter={setCurrentView(routes.about.name)} component={About}/>
          <Route path='billingregion' component={BillingRegionPicker}/>
          <Route path='marketplace/apps/(:appid)/manage/testdrive' component={TestDrivePage}/>
          <Route path='field-hub' onEnter={setCurrentView(routes.fieldHub.name)} component={FieldHub}/>
      </Route>
    );
}