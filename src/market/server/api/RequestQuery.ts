import { RequestHeaders, getStringQueryParam, throwIfQueryParamPresent, RequestCookies } from '../Utils';
import { IRequestContext } from '../../shared/Models';

export class ODataQuery {
    private static unsupportedODataQueryOptions = [
        '$expand',
        '$orderby',
        '$skip',
        '$top'
        ];

    /*
        $top: number;
        $skip: number;
        $select: any;
        $filter: any;
    */
    $skiptoken: string;
    $select: string[];
    $filter: string;

    static createODataQuery(req: any): ODataQuery {
        ODataQuery.unsupportedODataQueryOptions.forEach(element => {
            throwIfQueryParamPresent(req, element);
        });

        let odataQuery = new ODataQuery();
        odataQuery.$skiptoken = getStringQueryParam(req, '$skiptoken');
        let selectQueryParam = getStringQueryParam(req, '$select');
        if (selectQueryParam) {
            odataQuery.$select = selectQueryParam.split(',');
        }

        let filterQueryParam = getStringQueryParam(req, '$filter');
        if (filterQueryParam) {
            odataQuery.$filter = filterQueryParam;
        }

        return odataQuery;
    }
}

export class RequestQuery {
    requestContext: IRequestContext;
    headers: RequestHeaders;
    apiVersion: string;
    requestParams: any;
    cookies?: RequestCookies;
    // The following should be an array in the future
    flightCode: string;
    billingRegion: string;
    odataQuery: ODataQuery;
    appId: string;
    partnerId: string;
    planId: string;
    testDriveOfferId: string;
    id: string;
}