import { Action, isType, UserSignInAction, EmbedUserSignInAction, UserReviewUpdateAction, AccessTokenReceivedAction } from './../actions/actions';
import { IUserDataState, initialUserDataState, copyState } from './../../State';

export default function userDataReducer(state: IUserDataState = initialUserDataState, action: Action<any>): IUserDataState {
  let newState = copyState(state);
  if (isType(action, UserSignInAction) || isType(action, EmbedUserSignInAction)) {
    newState.id = action.payload.id;
    newState.group = action.payload.group;
    newState.email = action.payload.email || '';
    newState.signedIn = action.payload.signedIn;
    newState.idToken = action.payload.idToken;
    newState.refreshToken = action.payload.refreshToken;
    newState.firstName = action.payload.firstName;
    newState.lastName = action.payload.lastName;
    newState.displayName = action.payload.displayName;
    newState.oid = action.payload.oid;
    newState.tid = action.payload.tid;
    newState.alternateEmail = action.payload.alternateEmail;
    newState.isMSAUser = action.payload.isMSAUser;
    newState.isFieldUser = action.payload.isFieldUser;
    newState.tokenRefreshTime = action.payload.tokenRefreshTime;

    if (!newState.displayName) {
      newState.displayName = newState.firstName + ' ' + newState.lastName;
      newState.email = newState.email.substr(newState.email.indexOf('#') + 1);
    }

    // Embedded scenario does not send access token in the required format. So we call a different action
    // so that it is formatted the right way.
    if (isType(action, EmbedUserSignInAction)) {
      newState.accessToken = {
        spza: action.payload.accessToken
      };
    } else if (isType(action, UserSignInAction)) {
      newState.accessToken = (action as any).payload.accessToken;
    }
  } else if (isType(action, UserReviewUpdateAction)) {
    newState.hasReview = action.payload;
  } else if (isType(action, AccessTokenReceivedAction)) {
    newState.accessToken = action.payload;
  } else {
    return state;
  }

  return newState;
}
