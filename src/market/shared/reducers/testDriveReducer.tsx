import { Action, isType, TestDriveInitializedAction } from './../actions/actions';
import { ITestDriveState, initialTestDriveState } from './../../State';


export default function testDriveReducer(state: ITestDriveState[] = initialTestDriveState, action: Action<any>): ITestDriveState[] {
    let newTestDrives = [] as ITestDriveState[];

    if (isType(action, TestDriveInitializedAction)) {
        let index = -1;
        let newTestDrive = {
            id: action.payload.id,
            state: action.payload.status,
            expirationDate: action.payload.expirationDate,
            outputs: action.payload.outputs,
            appid: action.payload.appid
        };
        // check if there is a testdrive for this app.
        for (let i = 0; i < state.length; i++) {
            if (state[i].appid === action.payload.appid) {
                index = i;
                break;
            }
        }
        // if the app has a test drive update with the new test drive state
        if (index >= 0) {
            let newDataList = state.slice(0, index)
                .concat(newTestDrive)
                .concat(state.slice(index + 1));
            newTestDrives = newDataList;

        } else {
            newTestDrives.push(newTestDrive);
        }
    } else {
        return state;
    }
    return newTestDrives;
}