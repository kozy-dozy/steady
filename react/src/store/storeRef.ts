import type { AnyAction, Store } from '@reduxjs/toolkit'

import type { RootState } from './rootReducer'

// ApiService needs the store, and the store's slices import ApiService.
// storeSetup registers the store here so ApiService can read it at call
// time without importing '@/store' (which caused a circular-import crash).
let storeInstance: Store<RootState, AnyAction> | null = null

export const registerStore = (store: Store<RootState, AnyAction>) => {
    storeInstance = store
}

export const getStore = (): Store<RootState, AnyAction> => {
    if (!storeInstance) throw new Error('Store has not been created yet')
    return storeInstance
}
