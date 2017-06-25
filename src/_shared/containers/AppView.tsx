import * as React from 'react';
let { connect } = require('react-redux');
import { AppView as AppViewComponent } from './../components/appView';
import { IState } from './../states/state';

export const mapStateToProps = (state: IState, ownProps: any) => {
    return {};
}

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {};
}

const AppView = connect(
    mapStateToProps,
    mapDispatchToProps
)(AppViewComponent);

export default AppView as React.StatelessComponent<any>;