import { useState, useRef, useEffect } from 'react'
import api from '../utils/api'

const Camera = () => {
  const [image, setImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [stream, setStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [showUploadOption, setShowUploadOption] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      setCameraError(null)
      console.log('Requesting camera access...')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      console.log('Camera access granted, stream obtained:', mediaStream)
      setStream(mediaStream)
      
      // Small delay to ensure state update
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Video ref found, setting srcObject')
          videoRef.current.srcObject = mediaStream
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight)
            videoRef.current.play().then(() => {
              console.log('Video playing successfully')
            }).catch(err => {
              console.error('Video play error:', err)
            })
          }
        } else {
          console.error('Video ref not found')
        }
      }, 100)
    } catch (err) {
      console.error('Camera error:', err)
      setCameraError('Camera access denied or not available')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg')
      setImage(imageData)
      stopCamera()
      
      // Convert to file for analysis
      canvas.toBlob((blob) => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
        analyzeImage(file)
      }, 'image/jpeg')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result)
        analyzeImage(file)
      }
      reader.readAsDataURL(file)
    }
    setShowUploadOption(false)
  }

  const analyzeImage = async (file) => {
    setAnalyzing(true)
    try {
      const result = await api.uploadImage(file, 10.0)
      setResult(result)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Failed to analyze image: ' + error.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const retakePhoto = () => {
    setImage(null)
    setResult(null)
    startCamera()
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Crack Detection</h1>
      
      <div className="flex-1 bg-gray-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
        {image ? (
          <img src={image} alt="Crack" className="w-full h-full object-contain" />
        ) : stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : cameraError ? (
          <div className="text-center text-gray-400 p-6">
            <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mb-4">{cameraError}</p>
            <button
              onClick={handleUploadClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Upload Image Instead
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="mb-4">Take a photo of the crack</p>
            <button
              onClick={startCamera}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-2"
            >
              Open Camera
            </button>
            <button
              onClick={handleUploadClick}
              className="block mx-auto text-blue-500 hover:text-blue-600 text-sm"
            >
              Or upload existing image
            </button>
          </div>
        )}
        
        {analyzing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Analyzing crack...</p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="mt-4 bg-blue-50 rounded-xl p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Analysis Results</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <div>Length: {result.length_mm} mm</div>
            <div>Type: {result.crack_type}</div>
            <div>Avg Width: {result.avg_width_mm} mm</div>
            <div>Max Width: {result.max_width_mm} mm</div>
            <div>Area: {result.area_mm2} mm²</div>
            <div>Angle: {result.angle_deg}°</div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-center gap-4">
        {image ? (
          <button
            onClick={retakePhoto}
            className="w-16 h-16 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        ) : stream ? (
          <button
            onClick={capturePhoto}
            className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={startCamera}
            className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
        
        <button
          onClick={handleUploadClick}
          className="w-16 h-16 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}

export default Camera
