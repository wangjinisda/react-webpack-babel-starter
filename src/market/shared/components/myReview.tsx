import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { ReviewItem } from '../components/myReviewItem';
import { IUserDataState } from '../../State';
import { IUserReview, IAppDataItem } from '../Models';
import * as reviewRestClient from '../services/http/reviewRestClient';
import { ILocContext, ICommonContext } from '../interfaces/context';
// import { getMyReviewsPageTitle } from 'utils/localization';
import { getMyReviewsPageTitle } from './../../mac/utils/localization';

export interface IMyReviewProps {
    appList: IAppDataItem[];
    userInfo: IUserDataState;
    openRatingModal: (app: IAppDataItem, accessKey: string, ctaType: string, callback: any) => void;
    setUserReviewStatus: (hasReview: boolean) => void;
}

export interface IMyReviewState {
    itemData?: any;
}

export class Review extends SpzaComponent<IMyReviewProps, IMyReviewState> {
    context: ILocContext & ICommonContext;

    constructor(props: any, context: ILocContext & ICommonContext) {
        super(props);
        this.state = {
            itemData: []
        };
    }

    findAppDetail(appid: string) {
        let appList = this.props.appList;
        let targetApp: IAppDataItem = null;

        for (let i = 0; i < appList.length; i++) {
            targetApp = appList[i];
            if (targetApp.appid === appid) {
                break;
            }
        }

        return targetApp;
    }

    updateData(callback?: any) {
        reviewRestClient.get('authorization', this.props.userInfo.accessToken.spza, '*').then(
            (result: IUserReview[]) => {
                this.setState({
                    itemData: result
                });
                if (callback) {
                    callback();
                }
            })
            .catch((error) => {
                this.props.setUserReviewStatus(false);
                this.setState({
                    itemData: []
                });
                if (callback) {
                    callback();
                }
            });
    }

    componentDidMount() {
        if (this.props.userInfo.signedIn) {
            this.updateData();
            document.getElementsByTagName('title')[0].innerHTML = getMyReviewsPageTitle(this.context);
        }
    }

    updateItem(app: IAppDataItem) {
        let self = this;
        // no need for accessKey, set to null
        this.props.openRatingModal(app, null, app.actionString, (result: string) => {
            if (result === 'success') {
                self.updateData();
            }
        });
    }

    deleteItem(app: IAppDataItem) {
        reviewRestClient.del('authorization', this.props.userInfo.accessToken.spza, app.appid).then(
            () => {
                this.updateData.bind(this)();
            });
    }

    renderItems(self: any) {
        let itemListBlock: JSX.Element[] = [];
        let itemListData = this.state.itemData;
        itemListData.map((review: IUserReview) => {
            itemListBlock.push(
                <ReviewItem app={this.findAppDetail(review.appid)} review={review} updateItem={this.updateItem.bind(this)} deleteItem={this.deleteItem.bind(this)} />
            );
        });
        return itemListBlock;
    };

    renderImpl() {
        let context = this.context as any;
        return (
            <div className='spza_reviewContainer'>
                <div className='reviewHeader'>{context.loc('Rating_MyReviews', 'My Reviews')}</div>
                {
                    this.state.itemData.length > 0 ?
                    this.renderItems.bind(this)() :
                    <p>{this.context.loc('Rating_MyreviewEmpty',
                    'When you submit a review for apps you’ve acquired or for partners you’ve contacted, they’ll show up here.') }</p>
                }
            </div>
        );
    }
}
(Review as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
