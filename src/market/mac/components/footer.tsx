import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import { InternalLink } from '../../shared/components/internalLink';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');
import { IBuildHrefContext, ILocContext, ICommonContext } from '../../shared/interfaces/context';
import { AllLocales } from '../utils/localesList';

interface IFooterLink {
    title: string;
    link: string;
}

export interface IFooterProps {
    locale: string;
    billingCountryCode: string;
}

export class Footer extends SpzaComponent<IFooterProps, any> {
    context: IBuildHrefContext & ILocContext & ICommonContext;
    private allFooterLinks: { [menuTitle: string]: IFooterLink[] } = {};

    constructor(props: IFooterProps, context: IBuildHrefContext & ILocContext & ICommonContext) {
        super(props, context);

        this.allFooterLinks = this.getFooterLinks();
    }

    renderTopSection() {
        return (
            <div className='topSection'>
                {
                    Object.keys(this.allFooterLinks).map((key: string, index: number) => {
                        let currentMenu = this.allFooterLinks[key];

                        return (
                            <div className='menu' key={index}>
                                <div className='menuTitle'>
                                    {key}
                                </div>
                                {
                                    currentMenu.map((footerLink: IFooterLink, footerIndex: number) => {
                                        const link = footerLink.link.replace('en-us', this.props.locale);

                                        return (
                                            <div className='menuItem' key={footerIndex}>
                                                <a href={link}>
                                                    {footerLink.title}
                                                </a>
                                            </div>);
                                    })
                                }
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    renderLocalePickerElement() {
        const path = this.context.buildHref(routes.localePicker, null, {});
        const localesLength = AllLocales.length;
        let index = 0;
        let locale = '';

        for (index = 0; index < localesLength; index++) {
            if (AllLocales[index].locale.toLowerCase() === this.props.locale.toLowerCase()) {
                break;
            }
        }

        if (index < localesLength) {
            locale = AllLocales[index].language;
        } else {
            // could not find the locale
            locale = this.context.loc('LocaleChooser');
        }

        return (
            <InternalLink className='menuTitle clickableItem' href={path} scrollToTop={true}>
                {locale}
            </InternalLink>);
    }

    renderBottomSectionFooterElement(title: string, path: string) {
        return (
            <div className='menuTitle clickableItem'>
                <a href={path}>
                    {title}
                </a>
            </div>);
    }

    renderBillingCountrySelector() {
        return (
            <div className='billingCountry'>
                <InternalLink className='menuTitle clickableItem'
                    href={this.context.buildHref(routes.billingRegion, null, {})}
                    scrollToTop={true}>
                    {this.context.loc('ChangeBillingRegion')}
                </InternalLink>
            </div>
        );
    }

    renderImpl() {
        return (
            <div className='macFooter'>
                <div className='macFooterContent'>
                    {this.renderTopSection()}
                    <div className='bottomSection'>
                        {/* Start Mooncake */}
                        <div className='menu'>
                            {this.renderBottomSectionFooterElement('不在中国区域内使用 Azure?',
                                'http://windowsazure.com/')}
                        </div>
                        <div className='menu'>
                            {this.renderBottomSectionFooterElement('沪ICP备13015306号-25',
                                'http://www.miibeian.gov.cn/')}
                        </div>
                        <div className='menu'>
                            <div className='menuTitle clickableItem'>
                                <a href='http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=31011502002224'>
                                    <img src='/mooncake/beijing-public-network.png' className='vertical-icon' />
                                    京公网安备 31011502002224号
                                </a>
                            </div>;
                        </div>
                        <div className='menu'>
                            {this.renderBottomSectionFooterElement('隐私',
                                'https://www.azure.cn/support/trust-center/privacy/')}
                        </div>
                        <div className='menu'>
                        </div>
                        {/* End Mooncake */}
                    </div>
                </div>
            </div>
        );
    }

    private getForCustomersLinks() {
        let links: IFooterLink[] = [];

        // Start Mooncake
        // TODO: Add some links here
        // End Mooncake

        return links;
    }

    private getForPublishersLinks() {
        let links: IFooterLink[] = [];

        // Start Mooncake
        links.push({
            title: '认识Azure',
            link: 'https://www.azure.cn/home/features/what-is-azure/'
        });

        links.push({
            title: '产品',
            link: 'https://www.azure.cn/home/features/virtual-machines/'
        });

        links.push({
            title: '价格',
            link: 'https://www.azure.cn/pricing/'
        });

        links.push({
            title: '价格估算器',
            link: 'https://www.azure.cn/pricing/calculator/'
        });

        links.push({
            title: '优惠详情',
            link: 'https://www.azure.cn/support/legal/offer-rate-plans/'
        });

        links.push({
            title: '入门指南',
            link: 'https://www.azure.cn/starter-guide/'
        });

        links.push({
            title: '通用解决方案',
            link: 'https://www.azure.cn/solutions/virtual-machines/'
        });

        links.push({
            title: '客户案例',
            link: 'https://www.azure.cn/partnerancasestudy/case-studies/'
        });

        links.push({
            title: '技术文档',
            link: 'https://www.azure.cn/documentation/'
        });

        links.push({
            title: '博客',
            link: 'https://www.azure.cn/blog/'
        });

        links.push({
            title: '工具下载',
            link: 'https://www.azure.cn/downloads/?sdk=net'
        });
        // End Mooncake

        return links;
    }

    private getForPartnersLinks() {
        let links: IFooterLink[] = [];

        // Start Mooncake
        links.push({
            title: '联系我们',
            link: 'https://www.azure.cn/support/contact/'
        });

        links.push({
            title: '支持计划',
            link: 'https://www.azure.cn/support/plans/'
        });

        links.push({
            title: '服务仪表盘',
            link: 'https://www.azure.cn/support/service-dashboard/'
        });

        links.push({
            title: '法律',
            link: 'https://www.azure.cn/support/legal/'
        });

        links.push({
            title: '服务级别协议',
            link: 'https://www.azure.cn/support/legal/sla/'
        });

        links.push({
            title: 'ICP备案',
            link: 'https://www.azure.cn/icp/'
        });

        links.push({
            title: '发票',
            link: 'https://www.azure.cn/pricing/billing/azure-fapiao-process/'
        });

        links.push({
            title: '常见问题',
            link: 'https://www.azure.cn/support/faq/'
        });

        links.push({
            title: '最新公告',
            link: 'https://www.azure.cn/what-is-new/'
        });
        // End Mooncake

        return links;
    }

    private getMicrosoftAzureLinks() {
        let links: IFooterLink[] = [];

        // Start Mooncake
        links.push({
            title: '隐私',
            link: 'https://www.trustcenter.cn/zh-cn/privacy/default.html'
        });

        links.push({
            title: '安全性',
            link: 'https://www.trustcenter.cn/zh-cn/security/default.html'
        });

        links.push({
            title: '合规性',
            link: 'https://www.trustcenter.cn/zh-cn/compliance/default.html'
        });

        links.push({
            title: '透明度',
            link: 'https://www.trustcenter.cn/zh-cn/transparency/default.html'
        });
        // End Mooncake

        return links;
    }

    // Start Mooncake
    private getAccountLinks() {
        let links: IFooterLink[] = [];
        links.push({
            title: '经典管理门户',
            link: 'https://manage.windowsazure.cn/'
        });
        links.push({
            title: 'Azure门户预览',
            link: 'https://portal.azure.cn/'
        });
        links.push({
            title: '订阅与账单',
            link: 'https://account.windowsazure.cn/'
        });
        links.push({
            title: '企业门户网站',
            link: 'http://ea.windowsazure.cn/'
        });
        return links;
    }
    // End Mooncake

    private getFooterLinks() {
        let footerLinks: { [menuTitle: string]: IFooterLink[] } = {};

        // Start Mooncake
        footerLinks['关于我们'] = this.getForCustomersLinks();
        footerLinks['Azure'] = this.getForPublishersLinks();
        footerLinks['支持'] = this.getForPartnersLinks();
        footerLinks['信任中心'] = this.getMicrosoftAzureLinks();
        footerLinks['账户'] = this.getAccountLinks();
        // End Mooncake

        return footerLinks;
    }
}

(Footer as any).contextTypes = {
    loc: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};