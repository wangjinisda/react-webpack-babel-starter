import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IPartnerDataItem, IAppDataItem } from './../Models';
import { IBuildHrefContext, ILocContext, IContactCallbackContext, ICommonContext } from '../interfaces/context';
import { routes } from '../routerHistory';
import { Constants } from './../utils/constants';
import { BaseTile } from './baseTile';
import { generateTileClickPayloadAndLogTelemetry } from '../utils/detailUtils';
import { getComponentXYOffset } from '../utils/reactUtils';

export interface IPartnerTileProps extends IPartnerDataItem {
    customCSSClass?: string;
    crossListingAppcontext?: IAppDataItem;
    tileIndex: number;
}

export class PartnerTile extends SpzaComponent<IPartnerTileProps, any> {
    context: IBuildHrefContext & ILocContext & IContactCallbackContext & ICommonContext;

    constructor(props: IPartnerTileProps, context: IBuildHrefContext & ILocContext & IContactCallbackContext & ICommonContext) {
        super(props, context);
    }

    contact(e: Event) {
        e.stopPropagation();

        const offset = getComponentXYOffset(this.refs['partnerTile' + this.props.partnerId]);

        const details = {
            id: this.props.partnerId,
            index: this.props.tileIndex,
            xOffset: offset.x,
            yOffset: offset.y
        };

        generateTileClickPayloadAndLogTelemetry(Constants.Telemetry.ActionModifier.CTAModal, details);

        this.context.contactCallback(this.props);
    }

    shouldComponentUpdate(nextProps: IPartnerTileProps, nextState: any) {
        return this.props.partnerId !== nextProps.partnerId;
    }

    renderImpl() {
        let partnerDetailUrl = this.context.buildHref(routes.partnerDetail, { partnerId: this.props.partnerId }, { 'tab': 'Overview' });
        let badgeurl = this.props.competencyType !== Constants.CompetencyBadge.BadgeNotFound ?
            (this.props.competencyType === Constants.CompetencyBadge.Gold ? '/images/badgeGold.png' : '/images/badgeSilver.png') : '';

        let middleContent =
            <div>
                <p className='c-paragraph-4 description'>{this.props.tagline}</p>
                {this.props.competencyName ?
                    <div className='partnerMedal'>
                        <div className='goldMedal'>
                            <img src={badgeurl} />
                            <span>{this.props.competencyName}</span>
                        </div>
                    </div>
                    : null}
            </div>;

        let ctaContent =
            <div className='tileFooter'>
                <button className='c-button getButton' type='button' onClick={this.contact.bind(this)}>{this.context.loc('PartnerTile_ContactPartner')}</button>
            </div>;

        return (
            <BaseTile id={this.props.partnerId}
                iconURL={this.props.iconURL}
                iconBackgroundColor={null}
                title={this.props.title}
                middleContent={middleContent}
                ctaContent={ctaContent}
                detailUrl={partnerDetailUrl}
                customCSSClass={this.props.customCSSClass}
                tileIndex={this.props.tileIndex}
                ref={'partnerTile' + this.props.partnerId} />
        );
    }
}

(PartnerTile as any).contextTypes = {
    loc: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    contactCallback: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
