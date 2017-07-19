import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import SearchContainer from '../../shared/containers/SearchContainer';
import UserContainer from '../../shared/containers/user';
import { IBuildHrefContext, ILocContext, ICommonContext } from '../../shared/interfaces/context';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');
import { urlPush } from '../../shared/routerHistory';

let classNames = require('classnames-minimal');

export interface IHeaderProps {
    locale: string;
    currentView: string;
    isFieldHubUser: boolean;
}

interface ITopMenuItem {
    title: string;
    path: string;
}

interface IHeaderState {
    topMenuItems: ITopMenuItem[];
}

export class Header extends SpzaComponent<IHeaderProps, IHeaderState> {
    context: IBuildHrefContext & ILocContext & ICommonContext;

    private viewToHeader = {
        'home': this.context.loc('MAC_BrowseMP'),
        'appGallery': this.context.loc('MAC_BrowseMP'),
        'appDetails': '',
        'sell': this.context.loc('MAC_SellOnMP'),
        'about': this.context.loc('MAC_LearnMP')
    };

    constructor(props: IHeaderProps, context: IBuildHrefContext & ILocContext & ICommonContext) {
        super(props, context);

        this.state = {
            topMenuItems: this.getTopMenuItems(this.props.isFieldHubUser)
        };
    }

    navigate(e: any, item: any) {
        e.preventDefault();
        urlPush(item.path);
        window.scrollTo(0, 0);
        return false;
    }

    componentWillReceiveProps(nextProps: IHeaderProps, nextState: any) {
        // When a field user is logged in, we need to show "Field hub" tab in the header 
        if (nextProps.isFieldHubUser !== this.props.isFieldHubUser) {
            this.setState({
                topMenuItems: this.getTopMenuItems(nextProps.isFieldHubUser)
            });
        }
    }

    renderTopMenuItems() {
        const selectedMenu = this.viewToHeader[this.props.currentView];

        return this.state.topMenuItems.map((item: ITopMenuItem, index: number) => {
            const classes = classNames({
                'headerItem': true,
                'headerItemClickable': true,
                'headerItemSelected': selectedMenu === item.title
            });

            return (
                <a className={classes} key={index} href={item.path} onClick={(e: any) => { return this.navigate(e, item); }}> {item.title} </a>
            );
        });
    }

    renderImpl() {
        return (
            <div className='macHeaderContainer'>
                <div className='macHeader'>
                    <div className='macHeaderContent'>
                        <div className='headerItem'>{this.context.loc('MAC_AzureMarketplace')}</div>
                        {this.renderTopMenuItems()}
                        <div className='macSearchAndSignIn'>
                            <UserContainer />
                            <SearchContainer />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private getTopMenuItems(isFieldHubUser: boolean) {
        let items: ITopMenuItem[] = [];

        items.push({
            title: this.context.loc('MAC_BrowseMP'),
            path: this.context.buildHref(routes.marketplace,
                { category: null },
                routes.marketplace.initialParamsValue)
        });

        // Start Mooncake: Disable sell page
        // items.push({
        //    title: this.context.loc('MAC_SellOnMP'),
        //    path: this.context.buildHref(routes.marketing, null, {})
        // });
        // End Mooncake

        items.push({
            title: this.context.loc('MAC_LearnMP'),
            path: this.context.buildHref(routes.about, null, {})
        });

        if (isFieldHubUser) {
            items.push({
                title: this.context.loc('Field_Hub'),
                path: this.context.buildHref(routes.fieldHub, null, {})
            });
        }

        return items;
    }
}

(Header as any).contextTypes = {
    loc: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};