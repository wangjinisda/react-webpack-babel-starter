import * as React from 'react';
import SearchContainer from '../../containers/SearchContainer';
import UserContainer from '../../containers/user';
import SpzaComponent from '../../components/spzaComponent';
import { urlPush, routes } from '../../routerHistory';
import { IBuildHrefContext, ICommonContext } from '../../interfaces/context';
import { attachClickHandlerToElement } from '../../utils/appUtils';

export interface IHeaderProps {
    showHowItWorksModal(): void;
}

export class Header extends SpzaComponent<IHeaderProps, any> {
    context: IBuildHrefContext & ICommonContext;

    componentDidMount() {
        let mainPageUrl = this.context.buildHref(routes.home, null, {
            category: null,
            industry: null,
            product: null,
            search: null
        });
        let appGalleryUrl = this.context.buildHref(routes.marketplace, null, {
            category: null,
            industry: null,
            product: null,
            search: null
        });
        let partnerGalleryUrl = this.context.buildHref(routes.marketplacePartners, null, {
            category: null,
            industry: null,
            product: null,
            search: null
        });
        let partnersUrl = this.context.buildHref(routes.partners, null, {
            category: null,
            industry: null,
            product: null,
            search: null
        });

        let internalNavigation = (url: string) => {
            return (event: any) => {
                urlPush(url);
                event.preventDefault();
            };
        };

        // main gallery
        attachClickHandlerToElement('uhfCatLogo', internalNavigation(mainPageUrl));
        attachClickHandlerToElement('mobileHomeLink', internalNavigation(mainPageUrl));
        attachClickHandlerToElement('uhf_galleryLink', internalNavigation(appGalleryUrl));
        attachClickHandlerToElement('uhf_partnerGalleryLink', internalNavigation(partnerGalleryUrl));
        attachClickHandlerToElement('uhf_partnerLink', internalNavigation(partnersUrl));
        attachClickHandlerToElement('uhf_howitworkslink', (event: any) => {
            this.props.showHowItWorksModal();
            event.preventDefault();
        });
        attachClickHandlerToElement('mobile-uhf_howitworksLink', (event: any) => {
            this.props.showHowItWorksModal();
            event.preventDefault();
        });
    }

    renderImpl() {
        return (
            <div className='searchSignInContainer'>
                <div className='searchAndSignIn'>
                    <div>
                        <UserContainer />
                        <SearchContainer />
                    </div>
                </div>
            </div>
        );
    }
}

(Header as any).contextTypes = {
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};