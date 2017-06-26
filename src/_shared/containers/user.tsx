import * as React from 'react';
let { connect } = require('react-redux');
import { IState } from './../States/State';
import { UserComponent } from './../components/user';
import {createModalAction} from '../actions/actions';

export const mapStateToProps = (state: IState, ownProps: any) => {
    return {
        userInfo: state.users,
        correlationId: state.config.correlationId
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        openModal: (modalId: number) => {
            return dispatch(createModalAction({
                    showModal: true,
                    modalId: modalId
                }
                ));
        }
    };
};

const UserContainer = connect(mapStateToProps, mapDispatchToProps)(UserComponent);

export default UserContainer as React.StatelessComponent<any>;
