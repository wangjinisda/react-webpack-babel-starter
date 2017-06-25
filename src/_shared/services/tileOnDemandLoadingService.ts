import { IAppDataItem } from './../models/models';

export class TileOnDemandLoadingService {
    private tileExtraDataToLoad: IAppDataItem[];
    private getTileExtraDataHandler: (idList: { [id: string]: number }) => void;

    private registerTileExtraDataHandler: (appData: IAppDataItem) => void;

    constructor(registerTileExtraDataHandler: (appData: IAppDataItem) => void, getTileExtraDataHandler: (idList: { [id: string]: number }) => void) {
        this.registerTileExtraDataHandler = registerTileExtraDataHandler;
        this.getTileExtraDataHandler = getTileExtraDataHandler;
        this.tileExtraDataToLoad = [];
    }

    public registerTileToLoad(appData: IAppDataItem) {
        // Normally this function is called in AppTile componentWillMount().
        // At server side, the app extra data is already loaded, so we just simply register the tile extra data to make it show up in the initial state.
        // At client side, the app extra data is not loaded, so we add this app into the tileExtraDataToLoad list 
        // then later its extra data will be loaded together with other tiles on the screen. 
        if (appData.extraDataLoaded) {
            this.registerTileExtraDataHandler(appData);
        } else {
            this.tileExtraDataToLoad.push(appData);
        }
    }

    public getTileExtraData(): void {
        // Normally this function is called in componentDidMount() in AppView component.
        // But it can be called anywhere if the tile extra data needs to be ready as long as setting React state is allowed.
        // This function simply flush the tileExtraDataToLoad list to get tile extra data for all the tiles in the list and merge with the app list in the global state in order to 
        // let the tile extra data to be rendered for all the tiles on the screen.        
        let idList: { [id: string]: number } = {};
        let foundTileToProcess = false;
        this.tileExtraDataToLoad.forEach(item => {
            if (!item.extraDataLoaded) {
                idList[item.appid.toLocaleLowerCase()] = 1;
                foundTileToProcess = true;
            }
        });

        this.tileExtraDataToLoad = [];

        if (foundTileToProcess) {
            this.getTileExtraDataHandler(idList);
        }
    }

    public fetchTileExtraData(appData: IAppDataItem) {
        // This function should be used in componentWillMount() when a specfic tile extra data needs to be ready in a UI out of Home and Gallery Page.
        // For example, in MyReview UI, during rendering the UI, this function should be called to make sure the icon URL will be available to render.
        this.registerTileToLoad(appData);
        this.getTileExtraData();
    }
}
