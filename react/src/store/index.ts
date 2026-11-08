import store from './storeSetup'

export * from './storeSetup'
// auth / base / theme / locale slice actions + state types now come from
// @kozy-dozy/foundation (the slices are composed via `foundationReducers`).
export * from '@kozy-dozy/foundation'
export * from './rootReducer'
export * from './hooks'
export default store
