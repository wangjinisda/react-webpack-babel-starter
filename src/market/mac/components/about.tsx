// Start Mooncake: Contents here are replaced with contents provided by China marketing team
import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import { ICommonContext, ILocContext, IBuildHrefContext } from '../../shared/interfaces/context';
import { SpzaInstrumentService } from '../../shared/services/telemetry/spza/spzaInstrument';
import { ITelemetryData } from '../../shared/Models';
import { getWindow } from '../../shared/services/window';
import { Constants } from '../../shared/utils/constants';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');

export class About extends SpzaComponent<any, any> {
    context: ICommonContext & ILocContext & IBuildHrefContext;
    getStartUrl: string;

    constructor(props: any, context: ICommonContext & ILocContext) {
        super(props, context);
        this.state = {
            videoEnabled: false
        };
        this.getStartUrl = this.context.buildHref(routes.marketplace, { category: null }, { filters: 'test-drive', page: '1' } );
    }

    componentDidMount() {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.End
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);

        document.getElementsByTagName('title')[0].innerHTML = this.context.loc('MACabout_pageTitle');
    }

    renderImpl() {
        return (
            <div>
                <div className='about'>
                    <div className='section part1'>
                        <div className='content'>
                            <div className='text'>
                                <h1 className='text-heading1'>Azure 市场能帮您</h1>
                                <p className='text-heading3'>享受Azure生态系统的一站式软件及解决方案提供平台-均已通过Azure认证并优化</p>
                            </div>
                            <div className='videoHolder'>
                            {/*
                                this.state.videoEnabled ?
                                <div className='videoContainer'>
                                    <iframe src='https://player.vimeo.com/video/198907138?title=0&byline=0&portrait=0&amp;autoplay=1'
                                        width='540' height='300' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen>
                                    </iframe>
                                    <span className='c-glyph' onClick={() => { this.setState({ videoEnabled: false });}}></span>
                                </div> :
                                <button className='videoPlayerButton' onClick={() => { this.setState({ videoEnabled: true });}}></button>
                            */}
                            </div>
                        </div>
                    </div>
                    <div className='section part3'>
                        <div className='content'>
                            <div className='column1'>
                                <div className='imgHolder'>
                                    <img className='searchImg' src='/images/mac-search.png'/>
                                </div>
                                <div className='text'>
                                    <h2 className='c-heading-4 header'>解决方案，取您所需</h2>
                                    <p className='c-paragraph-4 f-lean'>
                                        浏览Azure镜像市场中ISV发布的数以百计的产品及端到端解决方案。直接获取经过Azure认证和优化的各类产品，从开源镜像到企业应用。
                                    </p>
                                </div>
                            </div>
                            <div className='column2'>
                                <div className='imgHolder'>
                                    <img className='createImg' src='/images/create.png' />
                                </div>
                                <div className='text'>
                                    <h2 className='c-heading-4 header'>生态系统</h2>
                                    <p className='c-paragraph-4 f-lean'>
                                        不断增长的应用及服务可以更好地补充Azure的业务组合。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='section part5'>
                        <div className='content'>
                            <div className='column1'>
                                <div className='imgHolder'>
                                    <img className='focusImg' src='/images/focus.png' />
                                </div>
                                    <div className='text'>
                                    <h2 className='c-heading-4 header'>放心部署</h2>
                                    <p className='c-paragraph-4 f-lean'>
                                        构建可靠的端到端解决方案只需数分钟。在Azure镜像市场中，ISV均在发布产品方案前充分测试并验证，确保用户部署及使用体验尽可能的顺滑无缝。
                                    </p>
                                </div>
                            </div>
                            <div className='column2'>
                                <div className='imgHolder'>
                                    <img className='enterpriseImg' src='/images/enterprise.png'/>
                                </div>
                                <div className='text'>
                                    <h2 className='c-heading-4 header'>深度集成</h2>
                                    <p className='c-paragraph-4 f-lean'>
                                        来自第三方发布商的应用及服务通过镜像方式可方便地与客户已有方案进行集成。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

(About as any).contextTypes = {
    renderErrorModal: React.PropTypes.func,
    loc: React.PropTypes.func,
    buildHref: React.PropTypes.func
};
// End Mooncake