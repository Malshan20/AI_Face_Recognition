'use client'

import { useRef, useEffect, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as blazeface from '@tensorflow-models/blazeface'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppSelector, useAppDispatch } from '../lib/hooks'
import { setDetectedFaces } from '../lib/facesSlice'
import { estimateAge, classifyGender, getNameFromSocialMedia } from '../lib/faceUtils'

export default function WebcamStream() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dispatch = useAppDispatch()
  const isActive = useAppSelector((state) => state.webcam.isActive)
  const resolution = useAppSelector((state) => state.webcam.resolution)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let animationFrameId: number | null = null
    let model: blazeface.BlazeFaceModel | null = null

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: resolution.width, height: resolution.height } 
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error('Error accessing webcam:', error)
        setError('Error accessing webcam. Please check your permissions.')
      }
    }

    const stopWebcam = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }

    const loadModel = async () => {
      try {
        await tf.ready()
        model = await blazeface.load()
      } catch (error) {
        console.error('Error loading face detection model:', error)
        setError('Error loading face detection model. Please try again later.')
      }
    }

    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current || !model) return

      try {
        const predictions = await model.estimateFaces(videoRef.current, false)

        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        const faces = await Promise.all(predictions.map(async (prediction: any, index: number) => {
          const { topLeft, bottomRight, landmarks, probability } = prediction
          const width = bottomRight[0] - topLeft[0]
          const height = bottomRight[1] - topLeft[1]

          ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)'
          ctx.lineWidth = 2
          ctx.strokeRect(topLeft[0], topLeft[1], width, height)

          const faceImage = tf.browser.fromPixels(videoRef.current!)
            .slice([Math.round(topLeft[1]), Math.round(topLeft[0]), 0], [Math.round(height), Math.round(width), 3])

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
            name
          }
        }))

        dispatch(setDetectedFaces(faces))

        if (isActive) {
          animationFrameId = requestAnimationFrame(detectFaces)
        }
      } catch (error) {
        console.error('Error detecting faces:', error)
        setError('Error detecting faces. Please try again.')
      }
    }

    if (isActive) {
      startWebcam()
      loadModel().then(() => {
        detectFaces()
      })
    } else {
      stopWebcam()
    }

    return () => {
      stopWebcam()
    }
  }, [isActive, resolution, dispatch])

  if (error) {
    return (
      <Card className="relative w-full aspect-video flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </Card>
    )
  }

  return (
    <Card className="relative w-full aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        width={resolution.width}
        height={resolution.height}
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <p>Webcam is inactive</p>
        </div>
      )}
      <Badge className="absolute top-2 left-2" variant="secondary">
        {isActive ? 'Live' : 'Inactive'}
      </Badge>
    </Card>
  )
}

