import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import { ILocContext, ICommonContext, ILocParamsContext, IBuildHrefContext } from '../../shared/interfaces/context';
import { getPowerBIEmbedReportURL } from '../utils/fieldHubUtils';
import { urlReplace, routes } from '../routerHistory';
import { ITelemetryData } from '../Models';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { getWindow } from '../services/window';
import { Constants } from '../utils/constants';

interface IFieldHubProps {
    isFieldHubUser: boolean;
    openFieldHubModal: (reportURL: string) => void;
    openDisclaimerModal: (title: string, description: string) => void;
}

export class FieldHub extends SpzaComponent<IFieldHubProps, any> {
    context: ILocContext & ILocParamsContext & ICommonContext & IBuildHrefContext;
    private instrument = SpzaInstrumentService.getProvider();

    constructor(props: any, context: ILocContext & ILocParamsContext & ICommonContext & IBuildHrefContext) {
        super(props, context);
        this.state = {
            description: this.context.loc('Field_Feedback_Desc')
        };
    }

    openReport(e: Event) {
        let reportName = e.toString();
        let reportURL = getPowerBIEmbedReportURL(reportName);

        let data = {
            linkType: 'reports',
            embedURL: reportURL,
            tab: 'Default',
            linkValue: reportName
        };

        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.Link,
            details: JSON.stringify(data)
        };
        this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
        this.props.openFieldHubModal(reportURL);
    }

    editFeedback(e: any) {
        this.setState({
            description: e.target ? e.target.value : ''
        });
    }

    clearContents(e: any) {
        if (this.state.description === this.context.loc('Field_Feedback_Desc')) {
            this.setState({
                description: ''
            });
        }
    }

    submitFeedback(e: Event) {
        let feedback = {
            description: this.state.description
        };

        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.FieldHub,
            actionModifier: Constants.Telemetry.ActionModifier.Feedback,
            details: JSON.stringify(feedback)
        };
        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);

        // Reset the feedback once the feedback is submitted.
        this.setState({
            description: ''
        });
    }

    componentDidMount() {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.End
        };
        this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);

        if (this.props.isFieldHubUser) {
            this.props.openDisclaimerModal(this.context.loc('Field_Access_Title'), this.context.loc('Field_Access_Desc'));
        }
    }

    renderImpl() {
        if (!this.props.isFieldHubUser) {
            let newPath = this.context.buildHref(routes.marketplace, null, null);
            urlReplace(newPath);
            return null;
        }

        return (
            <div className='field-hub'>
                <div className='field-body'>
                    <div className='field-header'>
                        <div className='title'>{this.context.loc('Field_Insights')}</div>
                        <div className='sub-title'>{this.context.loc('Field_Description')}</div>
                    </div>
                    <div className='field-sections'>
                        <div className='sales'>
                            <div className='section-header'>
                                <div className='icon-container'><div className='icon' /></div>
                                <div className='section-title'>{this.context.loc('Field_Sales')}</div>
                                <div className='description'>{this.context.loc('Field_Sales_Desc')}</div>
                            </div>

                            <div className='columns'>
                                <div className='field-column'>
                                    <div className='title'>{this.context.loc('Field_Leads_Opportunities')}</div>
                                    <ul>
                                        <li onClick={this.openReport.bind(this, 'Field_Orders')}>{this.context.loc('Field_Orders')}</li>
                                        <li onClick={this.openReport.bind(this, 'Field_Summary')}>{this.context.loc('Field_Summary')}</li>
                                        <li onClick={this.openReport.bind(this, 'Field_Leads_Sent')}>{this.context.loc('Field_Leads_Sent')}</li>
                                        <li onClick={this.openReport.bind(this, 'Field_Contacts')}>{this.context.loc('Field_Contacts')}</li>
                                    </ul>
                                    {/*<div className='learn-more' dangerouslySetInnerHTML={{
                                        __html: this.context.locParams('Field_LearnMore',
                                            ['<span class="video">' + this.context.loc('Field_WatchVideo') + '</span>'])
                                    }}></div>*/}
                                </div>
                                <div className='field-column'>
                                    <div className='title'>{this.context.loc('Field_Trends')}</div>
                                    <ul>
                                        <li onClick={this.openReport.bind(this, 'Field_District_Sales')}>{this.context.loc('Field_District')}</li>
                                        <li onClick={this.openReport.bind(this, 'Field_Industry_Sales')}>{this.context.loc('Field_Industry')}</li>
                                        <li onClick={this.openReport.bind(this, 'Field_Region_Sales')}>{this.context.loc('Field_Region')}</li>
                                        <li onClick={this.openReport.bind(this, 'Field_Segment_Sales')}>{this.context.loc('Field_Segment')}</li>
                                    </ul>
                                    {/*<div className='learn-more' dangerouslySetInnerHTML={{
                                        __html: this.context.locParams('Field_LearnMore',
                                            ['<span class="video">' + this.context.loc('Field_WatchVideo') + '</span>'])
                                    }}></div>*/}
                                </div>
                            </div>
                        </div>
                        <div className='seperator' />
                        <div className='consumption'>
                            <div className='section-header'>
                                <div className='icon-container'><div className='icon' /></div>
                                <div className='section-title'>{this.context.loc('Field_Consumption')}</div>
                                <div className='description'>{this.context.loc('Field_Consumption_Desc')}</div>
                            </div>

                            <div className='columns'>
                                <div className='field-column'>
                                    <div className='title'>{this.context.loc('Field_UsageData')}</div>
                                    <ul>
                                        <li onClick={this.openReport.bind(this, 'Field_Usage_Hours')}>{this.context.loc('Field_Usage_Hours')}</li>
                                        <li onClick={this.openReport.bind(this, 'Field_Usage_Timeline')}>{this.context.loc('Field_Usage_Timeline')}</li>
                                        <li onClick={this.openReport.bind(this, 'Field_Top10_Products')}>{this.context.loc('Field_Top10_Products')}</li>
                                    </ul>
                                    {/*<div className='learn-more' dangerouslySetInnerHTML={{
                                        __html: this.context.locParams('Field_LearnMore',
                                            ['<span class="video">' + this.context.loc('Field_WatchVideo') + '</span>'])
                                    }}></div>*/}
                                </div>
                                <div className='field-column'>
                                    <div className='title'>{this.context.loc('Field_Trends')}</div>
                                    <ul>
                                        <li onClick={this.openReport.bind(this, 'Field_District')}>{this.context.loc('Field_District')}</li>
                                        <li onClick={this.openReport.bind(this, 'Field_Industry')}>{this.context.loc('Field_Industry')}</li>
                                        <li onClick={this.openReport.bind(this, 'Field_Region')}>{this.context.loc('Field_Region')}</li>
                                        <li onClick={this.openReport.bind(this, 'Field_Segment')}>{this.context.loc('Field_Segment')}</li>
                                    </ul>
                                    {/*<div className='learn-more' dangerouslySetInnerHTML={{
                                        __html: this.context.locParams('Field_LearnMore',
                                            ['<span class="video">' + this.context.loc('Field_WatchVideo') + '</span>'])
                                    }}></div>*/}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='field-footer'>
                    <div className='title'>{this.context.loc('Field_Feedback_Title')}</div>
                    <textarea className='feedback'
                        onChange={this.editFeedback.bind(this)}
                        onFocus={this.clearContents.bind(this)}
                        value={this.state.description} ></textarea>
                    <button className='submit' onClick={this.submitFeedback.bind(this)}>{this.context.loc('Field_Submit')}</button>
                </div>
            </div>
        );
    }
}

(FieldHub as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};