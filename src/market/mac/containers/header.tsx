import * as React from 'react';
import { IState } from '../../State';
import { Header as HeaderComponent } from '../components/header';
let { connect } = require('react-redux');

const mapStateToProps = (state: IState, ownProps: any) => {
    return {
        locale: state.config.locale,
        currentView: state.config.currentView,
        isFieldHubUser: state.users.isFieldUser
    };
};

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {};
};

export const Header = connect(mapStateToProps, mapDispatchToProps)(HeaderComponent) as React.StatelessComponent<any>;

