import * as React from 'react';
import App from "./components/App";
import { createSetCurrentViewAction } from './actions/actions';
import { routes } from './routerHistory'
let { Route, IndexRoute } = require('react-router');

export default function(dispatch: (s: any) => void) {

    // Set the current view -- corresponds to state.config.currentView
    let setCurrentView = function(view: string) {
        return function (nextState: any) {
            let action = createSetCurrentViewAction({ currentView: view });
            dispatch(action);
        };
    };

   return (
    <Route name='app' component={App} path='/'>
          <IndexRoute onEnter={setCurrentView(routes.marketplace.name)} component={App}/>
          <Route path='home' onEnter={setCurrentView(routes.marketplace.name)} component={App}/>
          <Route path='marketplace' onEnter={setCurrentView(routes.marketplace.name)} component={App}/>
          <Route path='marketplace/apps' onEnter={setCurrentView(routes.marketplace.name)} component={App}/>
          <Route path='marketplace/apps/category/(:category)' onEnter={setCurrentView(routes.marketplace.name)} component={App}/>
          <Route path='marketplace/apps/(:appid)' onEnter={setCurrentView(routes.appDetails.name)} component={App}/>
          <Route path='localepicker' onEnter={setCurrentView(routes.localePicker.name)} component={App}/>
          <Route path='user/my-reviews' component={App}/>
          <Route path='sell' onEnter={setCurrentView(routes.marketing.name)} component={App}/>
          <Route path='about' onEnter={setCurrentView(routes.about.name)} component={App}/>
          <Route path='billingregion' component={App}/>
          <Route path='marketplace/apps/(:appid)/manage/testdrive' component={App}/>
          <Route path='field-hub' onEnter={setCurrentView(routes.fieldHub.name)} component={App}/>
      </Route>
   ); 
    
}