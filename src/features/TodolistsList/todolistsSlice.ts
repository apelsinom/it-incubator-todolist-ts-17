import { todolistsAPI, TodolistType } from "api/todolists-api"
import { appAction, RequestStatusType } from "app/appSlice"
import { handleServerNetworkError } from "utils/error-utils"
import { AppThunk } from "app/store"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { fetchTasksTC } from "features/TodolistsList/tasksSlice"

const slice = createSlice({
  name: "todolists",
  initialState: [] as TodolistDomainType[],
  reducers: {
    removeTodolist: (state, action: PayloadAction<{ todolistId: string }>) => {
      const index = state.findIndex((todo) => todo.id === action.payload.todolistId)
      if (index !== -1) state.splice(index, 1)
    },
    addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
      state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" })
    },
    changeTodolistTitle: (state, action: PayloadAction<{ todolistId: string; title: string }>) => {
      const todolist = state.find((todo) => todo.id === action.payload.todolistId)
      if (todolist) todolist.title = action.payload.title
    },
    changeTodolistFilter: (state, action: PayloadAction<{ todolistId: string; filter: FilterValuesType }>) => {
      const todolist = state.find((todo) => todo.id === action.payload.todolistId)
      if (todolist) todolist.filter = action.payload.filter
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ todolistId: string; status: RequestStatusType }>) => {
      const todolist = state.find((todo) => todo.id === action.payload.todolistId)
      if (todolist) todolist.entityStatus = action.payload.status
    },
    setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
      action.payload.todolists.forEach((tl) => {
        state.push({ ...tl, filter: "all", entityStatus: "idle" })
      })
    },
    clearTodosDate: (state) => {
      state = []
    },
  },
})
export const todolistsReducer = slice.reducer
export const todolistsAction = slice.actions
// thunks
export const fetchTodolistsTC = (): AppThunk => {
  return (dispatch) => {
    dispatch(appAction.setAppStatus({ status: "loading" }))
    todolistsAPI
      .getTodolists()
      .then((res) => {
        dispatch(todolistsAction.setTodolists({ todolists: res.data }))
        dispatch(appAction.setAppStatus({ status: "succeeded" }))
        return res.data
      })
      .then((todos) => {
        todos.forEach((tl) => dispatch(fetchTasksTC(tl.id)))
      })
      .catch((error) => {
        handleServerNetworkError(error, dispatch)
      })
  }
}
export const removeTodolistTC = (todolistId: string): AppThunk => {
  return (dispatch) => {
    //изменим глобальный статус приложения, чтобы вверху полоса побежала
    dispatch(appAction.setAppStatus({ status: "loading" }))
    //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
    dispatch(todolistsAction.changeTodolistEntityStatus({ todolistId, status: "loading" }))
    todolistsAPI.deleteTodolist(todolistId).then((res) => {
      dispatch(todolistsAction.removeTodolist({ todolistId }))
      //скажем глобально приложению, что асинхронная операция завершена
      dispatch(appAction.setAppStatus({ status: "succeeded" }))
    })
  }
}
export const addTodolistTC = (title: string): AppThunk => {
  return (dispatch) => {
    dispatch(appAction.setAppStatus({ status: "loading" }))
    todolistsAPI.createTodolist(title).then((res) => {
      dispatch(todolistsAction.addTodolist({ todolist: res.data.data.item }))
      dispatch(appAction.setAppStatus({ status: "succeeded" }))
    })
  }
}
export const changeTodolistTitleTC = (todolistId: string, title: string): AppThunk => {
  return (dispatch) => {
    todolistsAPI.updateTodolist(todolistId, title).then((res) => {
      dispatch(todolistsAction.changeTodolistTitle({ todolistId, title }))
    })
  }
}

// types
export type FilterValuesType = "all" | "active" | "completed"
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
/*type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>*/
