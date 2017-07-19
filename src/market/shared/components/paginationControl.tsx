import * as React from 'react';
import SpzaComponent from './spzaComponent';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');
import { InternalLink } from './internalLink';
import { ILocContext, IBuildHrefContext, ICommonContext } from '../interfaces/context';
import { Constants } from '../utils/constants';

export interface IPaginationControl {
  maxPages: number;
  galleryPage: number;
  galleryPageMode: Constants.GalleryPageMode;
}

export default class PaginationControl extends SpzaComponent<IPaginationControl, any> {
  context: IBuildHrefContext & ILocContext & ICommonContext;

  getPageNavigationArray() {
    let pageArray: number[] = [];
    let pageSpan = 4;
    if (this.props.maxPages > 1) {
      let min = this.props.galleryPage - 2;
      if (min < 1) {
        min = 1;
      }
      let max = min + pageSpan; // there should only be a total of pageSpan + 1 'pages' visible
      if (max > this.props.maxPages) {
        max = this.props.maxPages;
      }

      if (max - min < pageSpan) {
        min = max - pageSpan;
        if (min < 1) {
          min = 1;
        }
      }

      for (let i = min; i <= max; i++) {
        pageArray.push(i);
      }
    }

    return pageArray;
  }

  renderImpl() {
    let pageArray = this.getPageNavigationArray();
    let pageArrayLen = pageArray.length;
    let route = this.props.galleryPageMode === Constants.GalleryPageMode.Apps ? routes.marketplace : routes.marketplacePartners;
    let getPageLink = (n: number) => this.context.buildHref(route, null, { page: n.toString() }, true);

    return (
      <div className='paginationContainer'>
        {
          pageArrayLen > 1 ? (
            <ul className='m-pagination'>
              { this.props.galleryPage === 1 ? null : (
                <li>
                  <InternalLink className='c-glyph paginationPrevious'
                    aria-label='Previous Page'
                    href={getPageLink(this.props.galleryPage - 1) }
                    scrollToTop={true} >
                    { this.context.loc('PAGINATION_Previous', 'Previous') }
                  </InternalLink>
                </li>
              )
              }
              { pageArray.map((e, i) => {
                let pageLink = <InternalLink href={ getPageLink(e) } scrollToTop={true} >{e}</InternalLink>;
                if (e === this.props.galleryPage) {
                  return <li key={i} className='f-active'>{ pageLink }</li>;
                } else {
                  return <li key={i}>{ pageLink }</li>;
                }
              })
              }
              {
                this.props.galleryPage === this.props.maxPages ? null : (
                  <li>
                    <InternalLink className='c-glyph paginationNext'
                      aria-label='Next Page'
                      href={ getPageLink(this.props.galleryPage + 1) } scrollToTop={true} >
                      { this.context.loc('PAGINATION_Next', 'Next') }
                    </InternalLink>
                  </li>
                )
              }
            </ul>) : null
        }
      </div>
    );
  }
}

(PaginationControl as any).contextTypes = {
  buildHref: React.PropTypes.func,
  loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
