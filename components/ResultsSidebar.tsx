import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppSelector, useAppDispatch } from '../lib/hooks'
import { selectFace, clearSelectedFace } from '../lib/facesSlice'

export default function ResultsSidebar() {
  const dispatch = useAppDispatch()
  const faces = useAppSelector((state) => state.faces.detectedFaces)
  const selectedFaceId = useAppSelector((state) => state.faces.selectedFaceId)

  const handleFaceClick = (faceId: string) => {
    if (selectedFaceId === faceId) {
      dispatch(clearSelectedFace())
    } else {
      dispatch(selectFace(faceId))
    }
  }

  return (
    <Card className="w-64 p-4">
      <h2 className="text-lg font-semibold mb-4">Detected Faces</h2>
      <ScrollArea className="h-[600px]">
        {faces.map((face) => (
          <div
            key={face.id}
            className={`mb-4 p-2 bg-secondary rounded-lg cursor-pointer ${
              selectedFaceId === face.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleFaceClick(face.id)}
          >
            <h3 className="font-medium">Face {face.id}</h3>
            <p className="text-sm">Name: {face.name}</p>
            <p className="text-sm">Estimated Age: ~{face.estimatedAge}</p>
            <p className="text-sm">Gender: {face.gender}</p>
            <p className="text-sm">Probability: {(face.probability * 100).toFixed(2)}%</p>
            <p className="text-sm">
              Position: ({face.boundingBox.topLeft[0]}, {face.boundingBox.topLeft[1]})
            </p>
            <p className="text-sm">
              Size: {face.boundingBox.bottomRight[0] - face.boundingBox.topLeft[0]} x {face.boundingBox.bottomRight[1] - face.boundingBox.topLeft[1]}
            </p>
          </div>
        ))}
      </ScrollArea>
    </Card>
  )
}

