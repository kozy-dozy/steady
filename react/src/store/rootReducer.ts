import {
    foundationReducers,
    type FoundationState,
} from '@kozy-dozy/foundation'
import { combineReducers, Action, Reducer } from 'redux'

import member, { MemberState } from './slices/domain/memberSlice'

// The auth / base / locale / theme slices now come from @kozy-dozy/foundation
// (composed via `foundationReducers`). Only Steady's own slices are
// declared here.
export type RootState = FoundationState & {
    member: MemberState
}

export interface AsyncReducers {
    [key: string]: Reducer<any, Action>
}

const staticReducers = {
    ...foundationReducers,
    member,
}

const rootReducer =
    (asyncReducers?: AsyncReducers) => (state: RootState | undefined, action: Action) => {
        const combinedReducer = combineReducers({
            ...staticReducers,
            ...asyncReducers,
        })
        return combinedReducer(state, action)
    }

export default rootReducer
