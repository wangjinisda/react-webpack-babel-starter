import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import {
    IPricingInformation, IVMSKU, IVMSKUInstance, IStorageSize,
    IVMCategory, IFirstPartyPricing, IFirstPartyPricingItem
} from './../Models';
import { regionOrder, getThirdPartyStartingPrice, sortVMSKUsByStartingPrice, renderNotAvailablePriceUI } from '../utils/pricing';
import { getPriceString } from '../../shared/utils/pricing';
import { IBuildHrefContext, ILocContext, ILocParamsContext, ICTACallbackContext, ICommonContext } from '../../shared/interfaces/context';
import { RichTextDropDown, IRichTextDropDownItem } from '../../shared/components/richTextDropDown';
import { DoubleSlider } from '../../shared/components/doubleSlider';
import * as DetailUtils from '../../shared/utils/detailUtils';
import { Constants } from '../../shared/utils/constants';
import { readCookie, saveCookie, attachClickHandlerToElement } from '../../shared/utils/appUtils';
import { IPrice, IBillingCountry } from '../../shared/Models';
// import { routes, urlPush } from 'routerHistory';
let { routes, urlPush } = require('./../../mac/routerHistory');

const deploymentRegionCookieName = 'vmDeploymentRegion';

export interface IVMPricingProps {
    pricing: IPricingInformation;
    billingCountry: IBillingCountry;
    firstPartyPricing: IFirstPartyPricing;
    appid: string;
    skuChangeCallback: (sku: any) => void;
}

export interface IVMPricingState {
    filterMode?: FilterMode;
    skuId?: string;
    regionList?: IRichTextDropDownItem<string>[];
    regionItem?: IRichTextDropDownItem<string>;
    categoryList?: IRichTextDropDownItem<IVMCategory>[];
    categoryItem?: IRichTextDropDownItem<IVMCategory>;
    minCore?: number;
    maxCore?: number;
    minRAM?: number;
    maxRAM?: number;
    minCoreRange?: number;
    maxCoreRange?: number;
    minRAMRange?: number;
    maxRAMRange?: number;
    diskSpaceOptionItem?: IRichTextDropDownItem<DiskSpaceOption>;
    driveTypeList?: IRichTextDropDownItem<string>[];
    driveType?: IRichTextDropDownItem<string>;
    notFoundPlansInBillingCountry?: boolean;
    currencyCodeMismatch?: boolean;
}

interface IPriceTableRow {
    tier: string;
    category: string;
    coreCount: string;
    ram: string;
    diskSize: string;
    driveType: string;
    infrastructurePrice: string;
    softwarePrice: string;
    hourlyTotalPrice: string;
    monthlyTotalPrice: string;
}

export enum DiskSpaceOption { All, Small, Medium, Large };
export enum FilterMode { VMSize, RecommendatedInstances };

export class VMPricing extends SpzaComponent<IVMPricingProps, IVMPricingState> {
    context: IBuildHrefContext & ILocContext & ILocParamsContext & ICTACallbackContext & ICommonContext;

    private byol: string = this.context.loc('Pricing_BYOL');
    private isInitialLoading = true;

    private diskSpaceOptionList: IRichTextDropDownItem<DiskSpaceOption>[] = [
        { text: this.context.loc('Pricing_DiskSpaceOption_All'), value: DiskSpaceOption.All },
        { text: this.context.loc('Pricing_DiskSpaceOption_Small'), value: DiskSpaceOption.Small },
        { text: this.context.loc('Pricing_DiskSpaceOption_Medium'), value: DiskSpaceOption.Medium },
        { text: this.context.loc('Pricing_DiskSpaceOption_Large'), value: DiskSpaceOption.Large }
    ];

    private skus: IVMSKU[] = null;
    private timeoutID: number = -1;

    constructor(props: IVMPricingProps, context: IBuildHrefContext & ILocContext & ILocParamsContext & ICTACallbackContext & ICommonContext) {
        super(props, context);

        // default value
        let regionItem: IRichTextDropDownItem<string> = {
            text: this.context.loc('us-central'),
            value: 'us-central'
        };

        let deploymentRegion = readCookie(deploymentRegionCookieName, false);
        if (deploymentRegion) {
            regionItem.text = this.context.loc(deploymentRegion);
            regionItem.value = deploymentRegion;
        }

        this.state = {
            filterMode: FilterMode.RecommendatedInstances,
            diskSpaceOptionItem: { text: this.context.loc('Pricing_DiskSpaceOption_All'), value: DiskSpaceOption.All },
            regionItem: regionItem
        };
    };

    componentWillMount(): void {
        this.handleBillingCountryChange(this.props.billingCountry, this.props.firstPartyPricing, this.props.pricing);
    }

    componentWillReceiveProps(nextProps: IVMPricingProps, nextState: any) {
        if (this.props.billingCountry.countryCode !== nextProps.billingCountry.countryCode ||
            this.props.firstPartyPricing !== nextProps.firstPartyPricing ||
            this.props.pricing !== nextProps.pricing) {
            this.handleBillingCountryChange(nextProps.billingCountry, nextProps.firstPartyPricing, nextProps.pricing);
        }
    }

    componentDidMount() {
        let internalNavigation = () => {
            return (event: any) => {
                const billingRegionPickerHref = this.context.buildHref(routes.billingRegion, null, {});
                urlPush(billingRegionPickerHref);
                return false;
            };
        };

        attachClickHandlerToElement('billingregion-picker-appdetails-link', internalNavigation());
    }

    delayUpdatePricingTable(stateObject: any) {
        let self = this;
        if (self.timeoutID > -1) {
            window.clearTimeout(self.timeoutID);
            self.timeoutID = -1;
        }

        self.timeoutID = window.setTimeout(() => {
            const key = Object.keys(stateObject)[0];
            const detailsObject = {
                filterType: key,
                filterValue: stateObject[key]
            };
            DetailUtils.generateFilterClickPayloadAndLogTelemetry(
                DetailUtils.OwnerType.App,
                this.props.appid,
                Constants.Telemetry.ActionModifier.VMFilter,
                detailsObject);

            this.setState(stateObject);
        }, 300);
    }

    renderImpl() {
        if (!this.state.skuId && !this.state.notFoundPlansInBillingCountry) {
            return (<div>{this.context.loc('Loading')}</div>);
        }

        let priceTableRows: IPriceTableRow[] = null;
        let currentSKU: IVMSKU = null;
        let hasPersistentStorage = false;

        if (!this.state.notFoundPlansInBillingCountry) {
            priceTableRows = this.constructPriceTableRows();
            hasPersistentStorage = priceTableRows.filter(item => item.tier.indexOf('*') !== -1).length > 0;
            currentSKU = this.skus.filter(sku => sku.id === this.state.skuId)[0];
        }

        const downloadingCSVHref = () => {
            DetailUtils.generateFilterClickPayloadAndLogTelemetry(
                DetailUtils.OwnerType.App,
                this.props.appid,
                Constants.Telemetry.ActionModifier.DownloadCSV,
                {});

            let csvContent = '\ufeff' + this.constructCSVDownloadingHRef(priceTableRows);
            let filename = 'price.csv';
            if (navigator.msSaveBlob) {
                let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                navigator.msSaveBlob(blob, filename);
            } else {
                let link = document.createElement('a');
                link.setAttribute('href', 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(csvContent));
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link); // Required for FF
                link.click();
                document.body.removeChild(link);
            }
        };

        return (
            <div className='pricing vmPricing'>
                <span className='c-paragraph-3'>{this.context.loc('Pricing_VMPricing_PageDescription')}</span>
                <div className='c-paragraph-3 topPriceExplain' dangerouslySetInnerHTML={{
                    __html: this.context.locParams('Pricing_VMPricing_PageDescription_part2',
                        ['<a id="billingregion-picker-appdetails-link" class="c-hyperlink" href="' + this.context.buildHref(routes.billingRegion, null, {}) + '">' +
                            this.context.loc('ChangeBillingRegionLowercase') + '</a>'])
                }}>
                </div>
                {
                    this.state.notFoundPlansInBillingCountry
                        ? renderNotAvailablePriceUI(this.context)
                        : (
                            <div>
                                {
                                    this.skus.length === 1
                                        ? (<div>
                                            <h6 className='c-heading-6'>{this.context.loc('Pricing_SoftwarePlanDetail_Title')}</h6>
                                            <div className='skuList'>{this.renderPlanOption(this.skus[0])}</div>
                                        </div>)
                                        : (<div>
                                            <div className='c-label softwarePlanLabel'>{this.context.loc('Pricing_SelectASoftwarePlan')}</div>
                                            <RichTextDropDown
                                                className='skuList'
                                                options={this.skus}
                                                defaultValue={currentSKU}
                                                renderValue={(item: any) => this.renderPlanOption(item)}
                                                renderOption={(item: any) => this.renderPlanOption(item)}
                                                onChange={(item: any) => {
                                                    let detailsObject = {
                                                        SKUChosen: item.title
                                                    };
                                                    DetailUtils.generateFilterClickPayloadAndLogTelemetry(
                                                        DetailUtils.OwnerType.App,
                                                        this.props.appid,
                                                        Constants.Telemetry.ActionModifier.ChooseSKU,
                                                        detailsObject);
                                                    this.props.skuChangeCallback(item);
                                                    this.handleSKUChange(this.props.billingCountry, item.id, this.props.firstPartyPricing);
                                                }}
                                            />
                                        </div>)
                                }
                                {this.state.skuId ? (
                                    <div>
                                        <div className='c-paragraph-2'>
                                            <h6 className='c-heading-6 inline'>{this.context.loc('Pricing_VMFilter_Title')}</h6>
                                            <a onClick={(event: React.SyntheticEvent<any>) => { event.stopPropagation(); downloadingCSVHref(); }}
                                                className='c-hyperlink downloadCSV'>{this.context.loc('Pricing_CSV_Link')}</a>
                                            <div className='filter'>
                                                <div className='filterContainer'>
                                                    {
                                                        this.state.filterMode === FilterMode.VMSize ?
                                                            <a href='#' className='c-label c-hyperlink resetFilter'
                                                                onClick={event => { event.preventDefault(); this.resetFilter(); }}>{this.context.loc('Pricing_ResetFilters')}</a>
                                                            : null
                                                    }
                                                    <div className='c-radio filterModelSelector'>
                                                        <legend className='c-label'>{this.context.loc('Pricing_Show_Label')}</legend>
                                                        <label className='c-label'><input name='filterType' type='radio' aria-label='Male' className='recommendatedInstances'
                                                            checked={this.state.filterMode === FilterMode.RecommendatedInstances}
                                                            onChange={(event: any) => {
                                                                const detailsObject = {
                                                                    isRecommended: true
                                                                };
                                                                DetailUtils.generateFilterClickPayloadAndLogTelemetry(
                                                                    DetailUtils.OwnerType.App,
                                                                    this.props.appid,
                                                                    Constants.Telemetry.ActionModifier.VMFilter,
                                                                    detailsObject);

                                                                this.setState({ filterMode: FilterMode.RecommendatedInstances });
                                                            }} />
                                                            <span>{this.context.loc('Pricing_VMFilterMode_PublisherRecommendations')}</span>
                                                        </label>
                                                        <label className='c-label'><input name='filterType' type='radio' aria-label='Male' className='vmSize'
                                                            checked={this.state.filterMode === FilterMode.VMSize}
                                                            onChange={(event: any) => {
                                                                const detailsObject = {
                                                                    isRecommended: false
                                                                };
                                                                DetailUtils.generateFilterClickPayloadAndLogTelemetry(
                                                                    DetailUtils.OwnerType.App,
                                                                    this.props.appid,
                                                                    Constants.Telemetry.ActionModifier.VMFilter,
                                                                    detailsObject);

                                                                this.setState({ filterMode: FilterMode.VMSize });
                                                            }} />
                                                            <span>{this.context.loc('Pricing_VMFilterMode_VMInstancesMode')}</span>
                                                        </label>
                                                    </div>
                                                    {this.state.filterMode === FilterMode.VMSize ? (
                                                        <div className='vmSizeFilter'>
                                                            <div className='filterItem wide'>
                                                                <label>{this.context.loc('Pricing_VMFilter_Field_Cores')
                                                                    + ' ( ' + this.state.minCoreRange.toString() + ' ' + this.context.loc('Pricing_VMFilter_Field_To')
                                                                    + ' ' + this.state.maxCoreRange.toString() + ' )'}</label>
                                                                <DoubleSlider min={this.state.minCoreRange} max={this.state.maxCoreRange}
                                                                    defaultValue1={this.state.minCore} defaultValue2={this.state.maxCore}
                                                                    onValue1Change={value => this.delayUpdatePricingTable({ minCore: value })}
                                                                    onValue2Change={value => this.delayUpdatePricingTable({ maxCore: value })}
                                                                />
                                                            </div>
                                                            <div className='filterItem wide'>
                                                                <label>{this.context.loc('Pricing_VMFilter_Field_RAM')
                                                                    + '( ' + this.state.minRAMRange.toString() + this.context.loc('Pricing_VMFilter_Field_GB')
                                                                    + ' ' + this.context.loc('Pricing_VMFilter_Field_To')
                                                                    + ' ' + this.state.maxRAMRange.toString() + this.context.loc('Pricing_VMFilter_Field_GB') + ' )'}</label>
                                                                <DoubleSlider min={this.state.minRAMRange} max={this.state.maxRAMRange}
                                                                    defaultValue1={this.state.minRAM} defaultValue2={this.state.maxRAM}
                                                                    onValue1Change={value => this.delayUpdatePricingTable({ minRAM: value })}
                                                                    onValue2Change={value => this.delayUpdatePricingTable({ maxRAM: value })}
                                                                />
                                                            </div>
                                                            {this.getVMCategoryFilter()}
                                                            {this.getRegionFilter()}
                                                            {this.getDiskSpaceFilter()}
                                                            {this.getDriveTypeFilter()}
                                                        </div>
                                                    ) : (
                                                            <div className='recommendations'>
                                                                {this.getRegionFilter()}
                                                                {
                                                                    priceTableRows.length > 0 ?
                                                                        <div className='description'>
                                                                            {this.context.locParams('Pricing_VMFilter_FitlerMode_Recommendations_Description',
                                                                                [priceTableRows.length.toString()])}
                                                                        </div>
                                                                        : <div className='description noRecommendations'>
                                                                            {this.context.loc('Pricing_VMFilter_FitlerMode_NoRecommendations_Description')}
                                                                        </div>
                                                                }
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className='c-table pricingList'>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th colSpan={2}>{this.context.loc('Pricing_VirtualMachine')}</th>
                                                        <th colSpan={4}>{this.context.loc('Pricing_VMFilter_Result_Field_Configuration')}</th>
                                                        <th colSpan={2}>{this.context.loc('Pricing_VMFilter_Result_Field_CostPerHour')}</th>
                                                        {this.state.currencyCodeMismatch ? null : (<th colSpan={2}>{this.context.loc('Pricing_VMFilter_Result_Field_TotalCost')}</th>)}
                                                    </tr>
                                                    <tr className='header'>
                                                        <th className='instance'>{this.context.loc('Pricing_VMFilter_Result_Field_Instance')}</th>
                                                        <th className='instance'>{this.context.loc('Pricing_Category')}</th>
                                                        <th>{this.context.loc('Pricing_VMFilter_Field_Cores')}</th>
                                                        <th>{this.context.loc('Pricing_VMFilter_Field_RAM')}</th>
                                                        <th>{this.context.loc('Pricing_VMFilter_Field_DiskSpace')}</th>
                                                        <th>{this.context.loc('Pricing_VMFilter_Field_DriveType')}</th>
                                                        <th>{this.context.loc('Pricing_VMFilter_Result_InfrastructureCost')}</th>
                                                        <th>{this.context.loc('Pricing_VMFilter_Result_SoftwareCost')}</th>
                                                        {this.state.currencyCodeMismatch ? null : (<th>{this.context.loc('Pricing_VMFilter_Result_Hourly')}</th>)}
                                                        {this.state.currencyCodeMismatch ? null : (<th>{this.context.loc('Pricing_VMFilter_Result_Monthly')}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        priceTableRows.map(row => {
                                                            return (
                                                                <tr className='pricingListItem' key={row.tier + row.category}>
                                                                    <td className='tier'><span>{row.tier}</span></td>
                                                                    <td className='category'><span>{row.category}</span></td>
                                                                    <td className='coreCount'>{row.coreCount}</td>
                                                                    <td className='ram'>{row.ram}</td>
                                                                    <td className='diskSize'>{row.diskSize}</td>
                                                                    <td className='driveType'>{row.driveType}</td>
                                                                    <td className='hardwareCost'>{row.infrastructurePrice}</td>
                                                                    <td className='softwareCost'>{row.softwarePrice}</td>
                                                                    <td className='hourlyTotal'>{row.hourlyTotalPrice}</td>
                                                                    <td className='monthlyTotal'>{row.monthlyTotalPrice}</td>
                                                                </tr>
                                                            );
                                                        })
                                                    }
                                                </tbody>
                                            </table>
                                            {
                                                hasPersistentStorage ?
                                                    (
                                                        <span className='note'>{this.context.loc('Pricing_PersistentStorageNote')}
                                                            <a href='https://docs.microsoft.com/en-us/azure/storage/storage-premium-storage'
                                                                className='c-hyperlink' target='_blank'>{this.context.loc('App_LearnMore')}</a>
                                                        </span>
                                                    )
                                                    : null
                                            }
                                        </div>
                                    </div>
                                ) : null
                                }
                            </div>
                        )
                }
            </div>
        );
    }

    constructPriceTableRows(): IPriceTableRow[] {
        let currentSKU = this.skus.filter(item => item.id === this.state.skuId)[0] as IVMSKU;
        let instances = currentSKU.instances.filter(instance => this.filterSKUInstance(currentSKU, instance as IVMSKUInstance, this.state.regionItem.value));
        return instances.map(instance => {
            let softwarePriceValue = 0;
            if (currentSKU.thirdPartyPricing.pricePerCore) {
                softwarePriceValue = this.GetThirdPartyPricePerInstance(currentSKU, instance).value;
            }

            let hourlyTotalPrice: IPrice = null;
            let monthlyTotalPrice: IPrice = null;

            if (currentSKU.thirdPartyPricing.currencyCode === instance.hardwareCurrencyCode) {
                hourlyTotalPrice = {
                    value: instance.hardwareCost[this.state.regionItem.value].value + softwarePriceValue,
                    unit: this.context.loc('Pricing_Hour')
                };

                monthlyTotalPrice = {
                    value: hourlyTotalPrice.value * 24 * 31, // hourly total price * 24 hours * 31 days
                    unit: this.context.loc('Pricing_Month')
                };
            }

            return {
                tier: instance.tier,
                category: this.context.loc('Pricing_FirstPartyCategory_' + instance.category),
                coreCount: instance.coreCount.toString(),
                ram: this.getStorageSizeString(instance.ram),
                diskSize: this.getStorageSizeString(instance.diskSize),
                driveType: instance.driveType,
                infrastructurePrice: getPriceString(this.context, instance.hardwareCost[this.state.regionItem.value],
                    this.props.billingCountry.countryCode, instance.hardwareCurrencyCode, 3, '{0}'),
                softwarePrice: currentSKU.isBYOL ?
                    this.byol :
                    getPriceString(
                        this.context,
                        this.GetThirdPartyPricePerInstance(currentSKU, instance),
                        this.props.billingCountry.countryCode,
                        currentSKU.thirdPartyPricing.currencyCode,
                        3, '{0}'),
                hourlyTotalPrice: hourlyTotalPrice ? getPriceString(this.context, hourlyTotalPrice, this.props.billingCountry.countryCode, instance.hardwareCurrencyCode, 3, '{0}') : null,
                monthlyTotalPrice: monthlyTotalPrice ? getPriceString(this.context, monthlyTotalPrice, this.props.billingCountry.countryCode, instance.hardwareCurrencyCode, 3, '{0}') : null
            };
        });
    }

    constructCSVDownloadingHRef(rows: IPriceTableRow[]): string {
        let result = '';
        if (rows) {
            let csvRows: string[] = [];
            let csvHeaders = [
                this.context.loc('Pricing_VMFilter_Result_Field_Instance'),
                this.context.loc('Pricing_Category'),
                this.context.loc('Pricing_VMFilter_Field_Cores'),
                this.context.loc('Pricing_VMFilter_Field_RAM'),
                this.context.loc('Pricing_VMFilter_Field_DiskSpace'),
                this.context.loc('Pricing_VMFilter_Field_DriveType'),
                this.context.loc('Pricing_VMFilter_Result_InfrastructureCost'),
                this.context.loc('Pricing_VMFilter_Result_SoftwareCost')
            ];
            if (!this.state.currencyCodeMismatch) {
                csvHeaders.push(this.context.loc('Pricing_VMFilter_Result_Hourly'));
                csvHeaders.push(this.context.loc('Pricing_VMFilter_Result_Monthly'));
            }
            csvRows.push(csvHeaders.join(','));

            for (let i = 0, len = rows.length; i < len; i++) {
                let row = rows[i];
                let csvCells: string[] = [
                    row.tier,
                    row.category,
                    row.coreCount,
                    row.ram,
                    row.diskSize,
                    row.driveType,
                    row.infrastructurePrice,
                    row.softwarePrice
                ];
                if (!this.state.currencyCodeMismatch) {
                    csvCells.push(row.hourlyTotalPrice);
                    csvCells.push(row.monthlyTotalPrice);
                } csvRows.push(csvCells.join(','));
            }

            result = csvRows.join('\n');
        }

        return result;
    }

    escapeCSVCell(cell: string): string {
        // Wraps the cell string with double quotes then comma can be part of the cell string.
        // Replace all the double quote in cell string to double "double quote" to escape it.
        return '\'"' + cell.replace(/"/g, '""') + '\'"';
    }

    resetFilter(): void {
        this.setState({
            categoryItem: this.state.categoryList[0],
            minCore: this.state.minCoreRange,
            maxCore: this.state.maxCoreRange,
            minRAM: this.state.minRAMRange,
            maxRAM: this.state.maxRAMRange,
            diskSpaceOptionItem: this.diskSpaceOptionList[0],
            driveType: this.state.driveTypeList[0]
        });
    }

    filterSKUInstance(sku: IVMSKU, instance: IVMSKUInstance, region: string): boolean {
        let shouldDisplay = true;
        if (!instance.hardwareCost[region]
            || sku.thirdPartyPricing.pricePerCore && !sku.thirdPartyPricing.pricePerCore[this.mapInstanceCoreCountToThirdPartyPricingMeterID(instance)]) {
            shouldDisplay = false;
        } else if (this.state.filterMode === FilterMode.VMSize) {
            if ((this.state.categoryItem.value && this.state.categoryItem.value.name !== instance.category)
            ) { // Filter by the VM Category.
                shouldDisplay = false;
            }
            if (!(instance.coreCount >= this.state.minCore && instance.coreCount <= this.state.maxCore)) { // Filter by the cores.
                shouldDisplay = false;
            } else if (!(instance.ram.capacity >= this.state.minRAM && instance.ram.capacity <= this.state.maxRAM)) { // Filter by the RAM.
                shouldDisplay = false;
            } else if (this.state.diskSpaceOptionItem.value === DiskSpaceOption.Small && instance.diskSize.capacity >= 100) { // Filter by the disk space (small).
                shouldDisplay = false;
            } else if (this.state.diskSpaceOptionItem.value === DiskSpaceOption.Medium
                && (instance.diskSize.capacity < 100 || instance.diskSize.capacity > 600)) { // Filter by the disk space (medium).
                shouldDisplay = false;
            } else if (this.state.diskSpaceOptionItem.value === DiskSpaceOption.Large && instance.diskSize.capacity <= 600) { // Filter by the disk space (large).
                shouldDisplay = false;
            } else if (this.state.driveType.value && instance.driveType !== this.state.driveType.value) { // Filter by the drive type.
                shouldDisplay = false;
            }
        } else if (this.state.filterMode === FilterMode.RecommendatedInstances
            && (!sku.recommendedInstanceIDs
                || sku.recommendedInstanceIDs.filter(item => item.toLowerCase() === instance.id.toLowerCase()).length === 0)) {
            // Filter by the recommendations.
            shouldDisplay = false;
        }
        return shouldDisplay;
    }

    getVMCategoryFilter(): JSX.Element {
        return (
            <div className='filterItem'>
                <label>{this.context.loc('Pricing_VMFilter_Field_VirtualMachineCategory')}</label>
                <RichTextDropDown
                    className='category'
                    options={this.state.categoryList}
                    defaultValue={this.state.categoryItem}
                    renderOption={(item: any) => this.renderCategoryOption(item)}
                    onChange={(option: any) => {
                        const detailsObject = {
                            filterType: 'VMCategory',
                            filterValue: option.text
                        };
                        DetailUtils.generateFilterClickPayloadAndLogTelemetry(
                            DetailUtils.OwnerType.App,
                            this.props.appid,
                            Constants.Telemetry.ActionModifier.VMFilter,
                            detailsObject);

                        this.setState({ categoryItem: option });
                    }}
                />
            </div>
        );
    }

    getRegionFilter(): JSX.Element {
        return (
            <div className='filterItem'>
                <label>{this.context.loc('Pricing_VMFilter_Field_Region')}</label>
                <RichTextDropDown
                    className='regionList'
                    options={this.state.regionList}
                    defaultValue={this.state.regionItem}
                    onChange={(option: any) => {
                        const detailsObject = {
                            filterType: 'Region',
                            filterValue: option.text
                        };
                        DetailUtils.generateFilterClickPayloadAndLogTelemetry(
                            DetailUtils.OwnerType.App,
                            this.props.appid,
                            Constants.Telemetry.ActionModifier.VMFilter,
                            detailsObject);

                        this.handleRegionChange(this.state.skuId, this.state.categoryList, option);
                    }}
                />
            </div>
        );
    }

    getDiskSpaceFilter(): JSX.Element {
        return (
            <div className='filterItem'>
                <label>{this.context.loc('Pricing_VMFilter_Field_DiskSpace')}</label>
                <RichTextDropDown
                    className='diskSpaceOption'
                    options={this.diskSpaceOptionList}
                    defaultValue={this.state.diskSpaceOptionItem}
                    onChange={(option: any) => {
                        const detailsObject = {
                            filterType: 'DiskSpace',
                            filterValue: option.text
                        };
                        DetailUtils.generateFilterClickPayloadAndLogTelemetry(
                            DetailUtils.OwnerType.App,
                            this.props.appid,
                            Constants.Telemetry.ActionModifier.VMFilter,
                            detailsObject);

                        this.setState({ diskSpaceOptionItem: option });
                    }}
                />
            </div>
        );
    }

    getDriveTypeFilter(): JSX.Element {
        return (
            <div className='filterItem'>
                <label>{this.context.loc('Pricing_VMFilter_Field_DriveType')}</label>
                <RichTextDropDown
                    className='driveTypeList'
                    options={this.state.driveTypeList}
                    defaultValue={this.state.driveType}
                    onChange={(option: any) => {
                        const detailsObject = {
                            filterType: 'DriveType',
                            filterValue: option.text
                        };
                        DetailUtils.generateFilterClickPayloadAndLogTelemetry(
                            DetailUtils.OwnerType.App,
                            this.props.appid,
                            Constants.Telemetry.ActionModifier.VMFilter,
                            detailsObject);

                        this.setState({ driveType: option });
                    }}
                />
            </div>
        );
    }

    getStorageSizeString(storageSize: IStorageSize): string {
        return storageSize.capacity + storageSize.unit;
    }

    handleRegionChange(skuId: string, categoryList: IRichTextDropDownItem<IVMCategory>[], regionOption: IRichTextDropDownItem<string>): void {
        this.setState({ regionItem: regionOption });
        saveCookie(deploymentRegionCookieName, regionOption.value, 'expires=Fri, 31 Dec 9999 23:59:59 GMT');

        categoryList.forEach(category => {
            if (category.value) {
                category.value.startingPrice = {
                    value: Number.MAX_VALUE,
                    unit: this.context.loc('Pricing_Hour')
                };
            }
        });
        let currentSKU = this.skus.filter(sku => sku.id === skuId)[0] as IVMSKU;
        currentSKU.instances.forEach(instance => {
            let vmSKUInstance = instance as IVMSKUInstance;
            let category = categoryList.filter(item => item.value && item.value.name === vmSKUInstance.category)[0];
            if (category) {
                if (vmSKUInstance.hardwareCost[regionOption.value]) {
                    category.value.startingPrice.value = Math.min(category.value.startingPrice.value, vmSKUInstance.hardwareCost[regionOption.value].value);
                }
            }
        });
    }

    handleSKUChange(billingCountry: IBillingCountry, skuId: string, firstPartyPricing: IFirstPartyPricing): void {
        if (!firstPartyPricing) {
            return;
        }

        let currentSKU = this.skus.filter(sku => sku.id === skuId)[0] as IVMSKU;
        let currencyCodeMismatch = false;
        let regionItem = this.state.regionItem;
        let regionItemFound = false;

        currentSKU.instances = firstPartyPricing.items[currentSKU.os].map((item: IFirstPartyPricingItem): IVMSKUInstance => {
            if (item.currencyCode !== currentSKU.thirdPartyPricing.currencyCode) {
                currencyCodeMismatch = true;
            }

            return {
                tier: item.instanceName + (item.hasPersistentStorage ? '*' : ''),
                category: item.category,
                coreCount: item.cores,
                ram: item.ram,
                diskSize: item.disk,
                driveType: item.diskType,
                hardwareCost: item.prices,
                id: item.id,
                hardwareCurrencyCode: item.currencyCode
            };
        });

        // Aggregate the region options based on the existing region information in each SKU instance.
        let regionList: IRichTextDropDownItem<string>[] = [];
        (currentSKU.instances as IVMSKUInstance[]).forEach(instance => {
            for (let regionData in instance.hardwareCost) {
                if (regionList.filter(item => item.value === regionData).length === 0) {
                    regionList.push({ text: this.context.loc(regionData), value: regionData });

                    if (regionItem.value === regionData) {
                        regionItemFound = true;
                    }
                }
            }
        });

        regionList.sort((a, b) => {
            let orderA = regionOrder[a.value] || Number.MAX_VALUE;
            let orderB = regionOrder[b.value] || Number.MAX_VALUE;
            return orderA - orderB;
        });

        if (!regionItemFound) {
            regionItem = regionList[0];
        }

        // Aggregate the drive type options based on the existing drive type information in each SKU instance.
        let driveTypeList: IRichTextDropDownItem<string>[] = [{ text: this.context.loc('Pricing_DriveTypeOption_All'), value: null }];
        (currentSKU.instances as IVMSKUInstance[]).forEach(instance => {
            if (driveTypeList.filter(item => item.value === instance.driveType).length === 0) {
                driveTypeList.push({
                    text: instance.driveType,
                    value: instance.driveType
                });
            }
        });

        // Aggregate the VM category options based on the existing VM category information in each SKU instance.
        let categoryList: IRichTextDropDownItem<IVMCategory>[] = [{ text: this.context.loc('Pricing_CategoryOption_All'), value: null }];
        (currentSKU.instances as IVMSKUInstance[]).forEach(instance => {
            let category = categoryList.filter(item => item.value && item.value.name === instance.category)[0];
            if (!category) {
                let newCategory = {
                    name: instance.category
                };
                categoryList.push({
                    text: this.context.loc('Pricing_FirstPartyCategory_' + newCategory.name), value: newCategory
                });
            }
        });

        let minCoreRange = Number.MAX_VALUE;
        let maxCoreRange = 0;
        let minRAMRange = Number.MAX_VALUE;
        let maxRAMRange = 0;
        (currentSKU.instances as IVMSKUInstance[]).forEach(instance => {
            minCoreRange = Math.min(minCoreRange, instance.coreCount);
            maxCoreRange = Math.max(maxCoreRange, instance.coreCount);
            minRAMRange = Math.min(minRAMRange, instance.ram.capacity);
            maxRAMRange = Math.max(maxRAMRange, instance.ram.capacity);
        });

        minRAMRange = Math.floor(minRAMRange);
        maxRAMRange = Math.ceil(maxRAMRange);

        this.handleRegionChange(skuId, categoryList, regionItem);

        if (this.state.filterMode === FilterMode.RecommendatedInstances && this.isInitialLoading) {
            let filteredInstances = currentSKU.instances.filter(instance => this.filterSKUInstance(currentSKU, instance as IVMSKUInstance, regionList[0].value));
            if (filteredInstances.length === 0) {
                this.setState({ filterMode: FilterMode.VMSize });
            }
            this.isInitialLoading = false;
        }

        this.setState({
            regionList: regionList,
            skuId: skuId,
            categoryList: categoryList,
            driveTypeList: driveTypeList,
            driveType: driveTypeList[0],
            diskSpaceOptionItem: this.diskSpaceOptionList[0],
            categoryItem: categoryList[0],
            minCoreRange: minCoreRange,
            maxCoreRange: maxCoreRange,
            minRAMRange: minRAMRange,
            maxRAMRange: maxRAMRange,
            minCore: minCoreRange,
            maxCore: maxCoreRange,
            minRAM: minRAMRange,
            maxRAM: maxRAMRange,
            currencyCodeMismatch: currencyCodeMismatch
        });
    }

    handleBillingCountryChange(billingCountry: IBillingCountry, firstPartyPricing: IFirstPartyPricing, pricing: IPricingInformation): void {
        if (pricing) {
            if (pricing.skus && pricing.skus.length > 0) {
                this.setState({ notFoundPlansInBillingCountry: false });
                this.skus = pricing.skus as IVMSKU[];

                this.skus.forEach(sku => {
                    sku.startingPrice = getThirdPartyStartingPrice(sku);
                });

                sortVMSKUsByStartingPrice(this.skus as IVMSKU[]);

                this.handleSKUChange(billingCountry, this.skus[0].id, firstPartyPricing);
            } else {
                this.setState({ notFoundPlansInBillingCountry: true });
            }
        }
    }

    renderCategoryOption(item: IRichTextDropDownItem<IVMCategory>) {
        return (item.value
            ? (<div className='item'>
                <div className='left'><div className='title'>{this.context.loc('Pricing_FirstPartyCategory_' + item.value.name)}</div>{this.context.loc(item.value.description)}</div>
                <div className='right'><div className='title'>{this.context.loc('StartingAt')}</div>
                    {item.value.startingPrice.value === Number.MAX_VALUE ?
                        'N/A' : getPriceString(this.context, item.value.startingPrice, this.props.billingCountry.countryCode, this.props.billingCountry.currency, 3)}
                </div>
            </div>)
            : (<div className='item'><div className='title'>{this.context.loc('Pricing_CategoryOption_All')}</div></div>));
    }

    renderPlanOption(item: any) {
        if (item) {
            let sku = item as IVMSKU;
            return sku ? (
                <div className='item'>
                    <div className='left'>
                        <div className='title'>{sku.title}</div>
                        <div className='description'>{sku.summary}</div>
                    </div>
                    {
                        sku.isBYOL ?
                            <div className='right'><div className='price'>{this.byol}</div></div>
                            : <div className='right'>
                                <div>{this.context.loc('StartingAt')}</div>
                                <div className='price'>
                                    {getPriceString(
                                        this.context,
                                        sku.startingPrice && sku.startingPrice.pricingData,
                                        this.props.billingCountry.countryCode,
                                        this.props.billingCountry.currency,
                                        3)}
                                </div>
                            </div>

                    }
                </div>
            ) : null;
        }
    }

    renderCustomToggleButton = (open: boolean, flipped: boolean) => {
        return (
            <div className='c-glyph'>
                <span className='x-screen-reader'></span>
            </div>
        );
    };

    mapInstanceCoreCountToThirdPartyPricingMeterID(vmInstance: IVMSKUInstance): string {
        return (vmInstance.tier === 'A0' || vmInstance.tier === 'A0*') ? 'sharedcore' : (vmInstance.coreCount + 'core');
    }

    GetThirdPartyPricePerInstance(vmSKU: IVMSKU, vmInstance: IVMSKUInstance): IPrice {
        let meterID = this.mapInstanceCoreCountToThirdPartyPricingMeterID(vmInstance);
        let price = {
            value: 0,
            unit: 'hour'
        };

        if (vmSKU.thirdPartyPricing && vmSKU.thirdPartyPricing.pricePerCore) {
            price = vmSKU.thirdPartyPricing.pricePerCore[meterID];
        }

        return price;
    }
}

(VMPricing as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    locDateString: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    ctaCallback: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};