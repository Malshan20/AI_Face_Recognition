import { configureStore } from '@reduxjs/toolkit'
import facesReducer from './facesSlice'
import webcamReducer from './webcamSlice'

export const store = configureStore({
  reducer: {
    faces: facesReducer,
    webcam: webcamReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

