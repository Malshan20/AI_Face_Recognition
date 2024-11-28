import FacialRecognitionApp from '../components/FacialRecognitionApp'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-3xl font-bold">Facial Recognition App</h1>
      <FacialRecognitionApp />
    </main>
  )
}

