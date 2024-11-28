'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload } from 'lucide-react'
import { useAppDispatch } from '../lib/hooks'
import { setDetectedFaces } from '../lib/facesSlice'
import * as tf from '@tensorflow/tfjs'
import * as blazeface from '@tensorflow-models/blazeface'
import { estimateAge, classifyGender, getNameFromSocialMedia } from '../lib/faceUtils'

export default function ImageUpload() {
  const [image, setImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dispatch = useAppDispatch()

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const detectFaces = async () => {
    if (!imageRef.current || !canvasRef.current || !image) return

    try {
      await tf.ready()
      const model = await blazeface.load()
      const predictions = await model.estimateFaces(imageRef.current, false)

      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      const faces = await Promise.all(
        predictions.map(async (prediction: any, index: number) => {
          const { topLeft, bottomRight, landmarks, probability } = prediction
          const width = bottomRight[0] - topLeft[0]
          const height = bottomRight[1] - topLeft[1]

          ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'
          ctx.lineWidth = 2
          ctx.strokeRect(topLeft[0], topLeft[1], width, height)

          const faceImage = tf.browser.fromPixels(imageRef.current!)
            .slice(
              [Math.round(topLeft[1]), Math.round(topLeft[0]), 0],
              [Math.round(height), Math.round(width), 3]
            )

          const estimatedAge = estimateAge(faceImage)
          const gender = classifyGender(faceImage)
          const name = getNameFromSocialMedia(gender)

          ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'
          ctx.font = '12px Arial'
          ctx.fillText(`Age: ~${estimatedAge}, Gender: ${gender}`, topLeft[0], topLeft[1] - 5)

          faceImage.dispose()

          return {
            id: `face-${index}`,
            boundingBox: {
              topLeft: topLeft as [number, number],
              bottomRight: bottomRight as [number, number],
            },
            landmarks: landmarks,
            probability: probability[0],
            estimatedAge,
            gender,
            name,
            image: faceImage, // Change to use Tensor3D
          }
        })
      )

      dispatch(setDetectedFaces(faces))
    } catch (error) {
      console.error('Error detecting faces:', error)
    }
  }

  return (
    <Card className="relative w-full aspect-video flex items-center justify-center">
      {image ? (
        <>
          <img
            ref={imageRef}
            src={image}
            alt="Uploaded"
            className="w-full h-full object-cover"
            onLoad={detectFaces}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />
        </>
      ) : (
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-1 text-sm text-gray-600">Drag and drop or click to upload an image</p>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-4 right-4"
      >
        Upload Image
      </Button>
    </Card>
  )} // Closing the return statement properly
