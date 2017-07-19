import { IAppViewProps } from '../components/appView';
import { IAppDataItem } from '../Models';
import { Constants } from '../utils/constants';

export function handleCTACallback(
    props: IAppViewProps,
    app: IAppDataItem,
    ctaType: Constants.CTAType = Constants.CTAType.Create,
    skuId?: string) {

    props.showCTAModal(app.appid, ctaType, skuId);
}