export interface ActionType<TPayload> extends String { }

export type Action<TPayload> = {
    type: ActionType<TPayload>,
    payload: TPayload
}

interface ActionCreator<P> {
    (payload: P): Action<P>;
}

export function actionCreator<TPayload>(type: ActionType<TPayload>): ActionCreator<TPayload> {
    return (payload) => ({
        type,
        payload
    });
}

export function isType<TPayload>(
    action: Action<any>,
    type: ActionType<TPayload>
): action is Action<TPayload> {
    return action.type === type;
}


export const SetCurrentViewAction: ActionType<{ currentView: string }> = 'SetCurrentView';
export const createSetCurrentViewAction = actionCreator(SetCurrentViewAction);