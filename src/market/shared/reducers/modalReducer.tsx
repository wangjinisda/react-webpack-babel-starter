import { Action, isType, ModalAction, ContactAction, VideoModalAction, RatingAction, DriveModalAction, IFieldHubModalAction, IDisclaimerModalAction } from './../actions/actions';
import { IModalState, initialModalState, copyState } from './../../State';
import { Constants } from '../utils/constants';
import { IVideo, IReviewPayload, IAppDataItem, IDrive, IFieldHub, IDisclaimer} from './../Models';

export default function modalReducer(state: IModalState = initialModalState, action: Action<any>): IModalState {
      let newState = copyState(state);

      if (isType(action, ModalAction)) {
            newState.showModal = action.payload.showModal;
            newState.appId = action.payload.appId ? action.payload.appId : '';
            newState.modalId = action.payload.modalId ? action.payload.modalId : Constants.ModalType.NoModalShow;
            newState.options = action.payload.options;
            newState.payload = null;
      } else if (isType(action, ContactAction)) {
            newState.showModal = action.payload.showModal;
            newState.partnerId = action.payload.partnerId ? action.payload.partnerId : '';
            newState.modalId = Constants.ModalType.Contact;
            let payload: IAppDataItem = action.payload.crossListingAppContext;
            newState.payload = payload;
      } else if (isType(action, VideoModalAction)) {
            newState.showModal = action.payload.showModal;
            newState.modalId = Constants.ModalType.Video;
            let videoPayload: IVideo = {
                  videoLink: action.payload.videoUrl,
                  thumbnailURL: action.payload.videoThumbnail
            };
            newState.payload = videoPayload;
      } else if (isType(action, DriveModalAction)) {
            newState.showModal = action.payload.showModal;
            newState.modalId = Constants.ModalType.Drive;
            let drivePayload: IDrive = {
                  urlLink: action.payload.driveUrl
            };
            newState.payload = drivePayload;
      } else if (isType(action, IFieldHubModalAction)) {
            newState.showModal = action.payload.showModal;
            newState.modalId = Constants.ModalType.Iframe;
            let iframePayload: IFieldHub = {
                  url: action.payload.url
            };
            newState.payload = iframePayload;
      } else if (isType(action, IDisclaimerModalAction)) {
            newState.showModal = action.payload.showModal;
            newState.modalId = Constants.ModalType.Disclaimer;
            let payload: IDisclaimer = {
                  title: action.payload.title,
                  description: action.payload.description
            };
            newState.payload = payload;
      }  else if (isType(action, RatingAction)) {
            newState.showModal = action.payload.showModal;
            newState.modalId = Constants.ModalType.Rating;
            let reviewPayload: IReviewPayload = {
                  showModal: true,
                  app: action.payload.app,
                  accessKey: action.payload.accessKey,
                  ctaType: action.payload.ctaType,
                  callback: action.payload.callback
            };
            newState.payload = reviewPayload;
      } else {
            return state;
      }

      return newState;
}
