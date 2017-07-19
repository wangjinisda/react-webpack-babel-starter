import * as React from 'react';
import { IState } from '../../State';
import { Footer as FooterComponent } from '../components/footer';
let { connect } = require('react-redux');

const mapStateToProps = (state: IState, ownProps: any) => {
    return {};
};

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {};
};

export const Footer = connect(mapStateToProps, mapDispatchToProps)(FooterComponent) as React.StatelessComponent<any>;