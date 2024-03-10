import { ResponseType } from "api/todolists-api"
import { appAction } from "app/appSlice"
import { Dispatch } from "@reduxjs/toolkit"

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
  if (data.messages.length) {
    dispatch(appAction.setAppError({ error: data.messages[0] }))
  } else {
    dispatch(appAction.setAppError({ error: "Some error occurred" }))
  }
  dispatch(appAction.setAppStatus({ status: "failed" }))
}

export const handleServerNetworkError = (error: { message: string }, dispatch: Dispatch) => {
  dispatch(appAction.setAppError({ error: error.message ? error.message : "Some error occurred" }))
  dispatch(appAction.setAppStatus({ status: "failed" }))
}
