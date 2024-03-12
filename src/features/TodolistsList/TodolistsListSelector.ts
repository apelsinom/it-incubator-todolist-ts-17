import { AppRootStateType } from "app/store"

export const selectorTodolists = (state: AppRootStateType) => state.todolists
export const selectorTasks = (state: AppRootStateType) => state.tasks
export const selectorIsLoggedIn = (state: AppRootStateType) => state.auth.isLoggedIn
