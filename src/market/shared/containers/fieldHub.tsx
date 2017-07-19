import * as React from 'react';
import { IState } from '../../State';
import { FieldHub as FieldHubComponent } from '../components/fieldHub';
import { createIFieldHubModalAction, createIDisclaimerModalAction } from '../actions/actions';

let { connect } = require('react-redux');

const mapStateToProps = (state: IState, ownProps: any) => {
    return {
        isFieldHubUser: state.users.isFieldUser
    };
};

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        openFieldHubModal: (reportURL: string) => {
            dispatch(createIFieldHubModalAction({
                showModal: true,
                url: reportURL
            }));
        },
        openDisclaimerModal: (title: string, description: string) => {
            dispatch(createIDisclaimerModalAction({
                showModal: true,
                title: title,
                description: description
            }));
        }
    };
};

export const FieldHub = connect(mapStateToProps, mapDispatchToProps)(FieldHubComponent) as React.StatelessComponent<any>;