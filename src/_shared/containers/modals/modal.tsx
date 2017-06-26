import * as React from 'react';
import { IState } from './../../states/state';
import { getWindow } from './../../services/window';
import { Modal as ModalComponent } from './../../components/modals/modal';
let { connect } = require('react-redux');

export const mapStateToProps = (state: IState, ownProps: any) => {
}

export const mapDispatchToProps = (dispatch: any, ownProps: any): any => {
}

const Modal = connect(
    mapStateToProps,
    mapDispatchToProps
)(ModalComponent);

export default Modal as React.StatelessComponent<any>;