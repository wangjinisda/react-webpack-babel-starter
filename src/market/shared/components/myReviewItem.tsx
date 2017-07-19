import * as React from 'react';
import { ILocContext, ICommonContext } from '../interfaces/context';
import { IAppDataItem, IUserReview } from '../Models';
import SpzaComponent from './spzaComponent';

export interface IMyReviewItemProps {
    app: IAppDataItem; // For PowerBI Embedded - this could be null for the first load
    review: IUserReview;
    updateItem: (app: IAppDataItem, icon: string) => void;
    deleteItem: (app: IAppDataItem) => void;
}

export interface IMyReviewItemState {
    deleteReview: boolean;
    lastUpdated: string;
}

export class ReviewItem extends SpzaComponent<IMyReviewItemProps, IMyReviewItemState> {
    constructor(props: any, context: ILocContext & ICommonContext) {
        super(props, context);

        this.state = {
            deleteReview: false,
            lastUpdated: this.props.review.lastUpdated
        };
    }

    componentWillMount() {
        let tileOnDemandLoadingService = this.context.getTileOnDemandLoadingService();
        tileOnDemandLoadingService.fetchTileExtraData(this.props.app);
    }

    getDetailInformation(id: string) {
        if (this.props.app && this.props.app.detailInformation && this.props.app.detailInformation[id]) {
            return this.props.app.detailInformation[id];
        } else {
            return '';
        }
    }

    handleEdit() {
        let icon = this.getDetailInformation('LargeIconUri');
        this.props.updateItem(this.props.app, icon);
    }

    handleDelete() {
        this.setState({
            deleteReview: true,
            lastUpdated: this.state.lastUpdated + 1
        });
    }

    handleConfirmDelete() {
        this.props.deleteItem(this.props.app);
        this.setState({
            deleteReview: false,
            lastUpdated: this.state.lastUpdated
        });
    }

    handleCancelDelete() {
        this.setState({
            deleteReview: false,
            lastUpdated: this.state.lastUpdated
        });
    }

    ratingPane(self: any) {
        let RatePane: JSX.Element[] = [];
        for (let i = 0; i < this.props.review.rating; i++) {
            RatePane.push(
                <span className='c-glyph'></span>
            );
        };
        return RatePane;
    };

    renderImpl() {
        let context = this.context as any;
        let iconURL = this.props.app.iconURL ? (this.props.app.iconURL.substring(0, this.props.app.iconURL.length - 9) + 'large.png') : '';
        return (
            <div className='reviewItem'>
                <div className='leftBar'>
                    <div className='iconHost'>
                        <img className='appLargeIcon' src={iconURL} />
                    </div>
                    <div className='appTitle'>{this.props.app.title}</div>
                </div>
                <div className='rightContent'>
                    <div className='rightBar'>
                        <div className='reviewContent'>
                            <div className='contentHeader'>{this.props.review.title}</div>
                            <div className='reviewRating'>
                                {this.ratingPane(this)}
                            </div>
                            <div className='reviewDate'>{this.props.review.lastUpdated}</div>
                            <div className='content'>{this.props.review.description}</div>
                        </div>
                    </div>
                    <div className='writableButtons'>
                        {
                            this.state.deleteReview ?
                                <div>
                                    <button className='c-button confirmDeteleText'
                                        disabled={true}>{context.loc('Rating_ConfirmDelete', 'Are you sure you want to delete this review?')}</button>
                                    <button className='c-button reviewButton confirm'
                                        onClick={this.handleConfirmDelete.bind(this)}>{context.loc('Common_Yes', 'Yes')}
                                    </button>
                                    <button className='c-button reviewButton confirm'
                                        onClick={this.handleCancelDelete.bind(this)}>{context.loc('Common_No', 'No')}
                                    </button>
                                </div> :
                                <div>
                                    <button className='c-button reviewButton'
                                        onClick={this.handleEdit.bind(this)}>{context.loc('Common_Edit', 'Edit')}
                                    </button>
                                    <button className='c-button reviewButton'
                                        onClick={this.handleDelete.bind(this)}>{context.loc('Common_Delete', 'Delete')}
                                    </button>
                                </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

(ReviewItem as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func,
    getTileOnDemandLoadingService: React.PropTypes.func
};
