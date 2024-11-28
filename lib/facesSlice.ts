import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Face {
  image: Tensor3D
  id: string
  boundingBox: {
    topLeft: [number, number]
    bottomRight: [number, number]
  }
  landmarks: number[][]
  probability: number
  estimatedAge: number
  gender: string
  name: string
}

interface FacesState {
  detectedFaces: Face[]
  selectedFaceId: string | null
}

const initialState: FacesState = {
  detectedFaces: [],
  selectedFaceId: null,
}

const facesSlice = createSlice({
  name: 'faces',
  initialState,
  reducers: {
    setDetectedFaces: (state, action: PayloadAction<Face[]>) => {
      state.detectedFaces = action.payload
    },
    selectFace: (state, action: PayloadAction<string>) => {
      state.selectedFaceId = action.payload
    },
    clearSelectedFace: (state) => {
      state.selectedFaceId = null
    },
  },
})

export const { setDetectedFaces, selectFace, clearSelectedFace } = facesSlice.actions
export default facesSlice.reducer

