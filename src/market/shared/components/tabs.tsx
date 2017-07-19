import * as React from 'react';
import SpzaComponent from './spzaComponent';
import * as DetailUtils from '../utils/detailUtils';
import { Constants } from '../utils/constants';

let classNames = require('classnames-minimal');

export interface ITabProps {
    title: string;
    name: string;
}

export class Tab extends SpzaComponent<ITabProps, any> {
    renderImpl() {
        return this.props.children;
    }
}

export interface ITabsProps {
    defaultTab: string;
    ownerType: DetailUtils.OwnerType;
    ownerId: string;
    changeTabCallback: (tabTitle: string) => void;
    getTabHref: (tabTitle: string) => string;
}

export class Tabs extends SpzaComponent<ITabsProps, any> {

    changeTabWithName(e: any, name: string) {
        e.preventDefault();

        let detailsObject = {
            tab: name
        };
        DetailUtils.generateClickPayloadAndLogTelemetry(this.props.ownerType, this.props.ownerId, Constants.Telemetry.ActionModifier.Tab, detailsObject);

        this.props.changeTabCallback(name);
    }

    getCurrentTabIndex() {
        const tabsList = React.Children.toArray(this.props.children);
        const length = tabsList.length;

        for (let index = 0; index < length; index++) {
            let tab = tabsList[index].valueOf() as Tab;

            if (tab.props.name === this.props.defaultTab) {
                return index;
            }
        }

        return 0;
    }

    getHeaderElement(currentTabIndex: number) {
        let self = this;
        return function (child: Tab, index: number) {
            const classes = classNames({
                'tabSelected': currentTabIndex === index,
                'defaultTab': true
            });

            if (child.props.children) {
                return (
                    <a href={self.props.getTabHref(child.props.title)}
                       className={classes} key={'tab' + index}
                       onClick={(e: any) => { this.changeTabWithName(e, child.props.name); return false; }}>
                       <label>{child.props.title}</label>
                    </a>
                );
            } else {
                return null;
            }
        };
    }

    renderHeaders(currentTabIndex: number) {
        const minimumHeaderCount = 2;
        const createHeaderElement = this.getHeaderElement(currentTabIndex);

        // we do not render a header if there's only one tab
        if (React.Children.count(this.props.children) < minimumHeaderCount) {
            return null;
        } else {
            return (
                <div>
                    {React.Children.map(this.props.children, createHeaderElement.bind(this))}
                </div>
            );
        }
    }

    renderImpl() {
        const currentTabIndex = this.getCurrentTabIndex();

        return (
            <div className='tabContainer'>
                {this.renderHeaders(currentTabIndex)}
                <div className='tabContent'>
                    <div className='separator'></div>
                    {React.Children.toArray(this.props.children)[currentTabIndex]}
                </div>
            </div>
        );
    }
}

(Tab as any).contextTypes = {
    renderErrorModal: React.PropTypes.func
};

(Tabs as any).contextTypes = {
    renderErrorModal: React.PropTypes.func
};