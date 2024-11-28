import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface WebcamState {
  isActive: boolean
  resolution: {
    width: number
    height: number
  }
}

const initialState: WebcamState = {
  isActive: false,
  resolution: {
    width: 640,
    height: 480,
  },
}

const webcamSlice = createSlice({
  name: 'webcam',
  initialState,
  reducers: {
    setWebcamActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload
    },
    setResolution: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.resolution = action.payload
    },
  },
})

export const { setWebcamActive, setResolution } = webcamSlice.actions
export default webcamSlice.reducer

