import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { ICommonContext } from '../interfaces/context';
let classNames = require('classnames-minimal');

interface IRatingsControlProps {
    avgRating: number;
}

export class RatingsControl extends SpzaComponent<IRatingsControlProps, any> {
    context: ICommonContext;
    constructor(props: IRatingsControlProps, context: ICommonContext) {
        super(props, context);
    }

    renderRatingsPane(avgRating: number) {
        let RatePane: JSX.Element[] = [];
        let arr = [1, 2, 3, 4, 5];
        arr.map((value) => {
            const starColor = classNames({
                'f-full': avgRating >= value,
                'f-none': avgRating < value,
                'f-half': avgRating > value - 1 && avgRating < value,
                'c-glyph': true
            });
            RatePane.push(
                <span className={starColor} key={value}>
                </span>
            );
        });
        return RatePane;
    };

    renderImpl() {
        return (
            <div className='c-rating f-community-rated f-aggregate' itemScope itemType='https://schema.org/Rating'>
                {this.renderRatingsPane(this.props.avgRating)}
            </div>
        );
    }
}

(RatingsControl as any).contextTypes = {
    renderErrorModal: React.PropTypes.func
};