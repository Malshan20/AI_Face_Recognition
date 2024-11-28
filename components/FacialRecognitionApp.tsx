'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WebcamStream from './WebcamStream'
import ImageUpload from './ImageUpload'
import ResultsSidebar from './ResultsSidebar'
import { Camera, Upload } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../lib/hooks'
import { setWebcamActive } from '../lib/webcamSlice'

export default function FacialRecognitionApp() {
  const [activeTab, setActiveTab] = useState('webcam')
  const dispatch = useAppDispatch()
  const isWebcamActive = useAppSelector((state) => state.webcam.isActive)

  const handleToggleWebcam = () => {
    dispatch(setWebcamActive(!isWebcamActive))
  }

  return (
    <div className="flex w-full max-w-6xl gap-4">
      <Card className="flex-grow p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="webcam">
              <Camera className="mr-2 h-4 w-4" />
              Webcam
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </TabsTrigger>
          </TabsList>
          <TabsContent value="webcam" className="mt-4">
            <WebcamStream />
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleToggleWebcam}
                variant={isWebcamActive ? "destructive" : "default"}
              >
                {isWebcamActive ? "Stop Webcam" : "Start Webcam"}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="upload" className="mt-4">
            <ImageUpload />
          </TabsContent>
        </Tabs>
      </Card>
      <ResultsSidebar />
    </div>
  )
}

