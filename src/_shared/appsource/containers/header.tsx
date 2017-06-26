import * as React from 'react';
let { connect } = require('react-redux');
import { Header as HeaderComponent } from '../components/header';

import { createVideoModalAction } from '../../actions/actions';

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        showHowItWorksModal: () => {
            dispatch(createVideoModalAction({
                showModal: true,
                videoThumbnail: null,
                videoUrl: 'https://aka.ms/spzavideo'
            }));
        }
    };
};

export const Header = connect(null, mapDispatchToProps)(HeaderComponent)as React.StatelessComponent<any>;
