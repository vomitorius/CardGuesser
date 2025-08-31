<template>
  <div>
    <NuxtRouteAnnouncer />
    <div class="container">
      <h1>Card Guesser</h1>
      <p>AI-powered playing card recognition using your webcam</p>
      
      <div class="camera-section">
        <video
          ref="videoElement"
          autoplay
          playsinline
          muted
          class="video-stream"
        ></video>
        
        <canvas
          ref="canvasElement"
          class="detection-canvas"
        ></canvas>
      </div>
      
      <div class="controls">
        <button @click="startCamera" :disabled="isProcessing" class="btn btn-primary">
          {{ cameraActive ? 'Camera Active' : 'Start Camera' }}
        </button>
        <button @click="toggleDetection" :disabled="!cameraActive" class="btn btn-secondary">
          {{ detectionActive ? 'Stop Detection' : 'Start Detection' }}
        </button>
      </div>
      
      <div class="results" v-if="prediction">
        <h3>Detected Card:</h3>
        <div class="card-result">
          <span class="card-name">{{ prediction.card }}</span>
          <span class="confidence">Confidence: {{ prediction.confidence }}%</span>
        </div>
      </div>
      
      <div class="status">
        <p>Status: {{ status }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Reactive state
const videoElement = ref(null)
const canvasElement = ref(null)
const cameraActive = ref(false)
const detectionActive = ref(false)
const isProcessing = ref(false)
const prediction = ref(null)
const status = ref('Ready to start')

// TensorFlow.js variables
let tf = null
let model = null
let stream = null
let animationId = null

// Card deck definition
const cardDeck = [
  'Ace of Spades', 'Two of Spades', 'Three of Spades', 'Four of Spades', 'Five of Spades',
  'Six of Spades', 'Seven of Spades', 'Eight of Spades', 'Nine of Spades', 'Ten of Spades',
  'Jack of Spades', 'Queen of Spades', 'King of Spades',
  'Ace of Hearts', 'Two of Hearts', 'Three of Hearts', 'Four of Hearts', 'Five of Hearts',
  'Six of Hearts', 'Seven of Hearts', 'Eight of Hearts', 'Nine of Hearts', 'Ten of Hearts',
  'Jack of Hearts', 'Queen of Hearts', 'King of Hearts',
  'Ace of Diamonds', 'Two of Diamonds', 'Three of Diamonds', 'Four of Diamonds', 'Five of Diamonds',
  'Six of Diamonds', 'Seven of Diamonds', 'Eight of Diamonds', 'Nine of Diamonds', 'Ten of Diamonds',
  'Jack of Diamonds', 'Queen of Diamonds', 'King of Diamonds',
  'Ace of Clubs', 'Two of Clubs', 'Three of Clubs', 'Four of Clubs', 'Five of Clubs',
  'Six of Clubs', 'Seven of Clubs', 'Eight of Clubs', 'Nine of Clubs', 'Ten of Clubs',
  'Jack of Clubs', 'Queen of Clubs', 'King of Clubs'
]

onMounted(async () => {
  try {
    status.value = 'Loading TensorFlow.js...'
    // Dynamically import TensorFlow.js for client-side only
    tf = await import('@tensorflow/tfjs')
    await import('@tensorflow/tfjs-backend-webgl')
    
    // Initialize TensorFlow.js
    await tf.ready()
    status.value = 'TensorFlow.js loaded successfully'
    
    // Create a simple model for demonstration
    await createSimpleModel()
    
  } catch (error) {
    console.error('Error loading TensorFlow.js:', error)
    status.value = 'Error loading TensorFlow.js'
  }
})

const createSimpleModel = async () => {
  try {
    status.value = 'Creating detection model...'
    
    // Create a simple convolutional neural network for demonstration
    // In a real application, you would load a pre-trained model
    model = tf.sequential({
      layers: [
        tf.layers.conv2d({
          inputShape: [224, 224, 3],
          filters: 32,
          kernelSize: 3,
          activation: 'relu'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 52, activation: 'softmax' }) // 52 cards
      ]
    })
    
    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })
    
    status.value = 'Model created (demo mode - random predictions)'
  } catch (error) {
    console.error('Error creating model:', error)
    status.value = 'Error creating model'
  }
}

const startCamera = async () => {
  try {
    isProcessing.value = true
    status.value = 'Requesting camera access...'
    
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'environment' // Use rear camera if available
      }
    })
    
    if (videoElement.value) {
      videoElement.value.srcObject = stream
      videoElement.value.play()
      cameraActive.value = true
      status.value = 'Camera active'
    }
  } catch (error) {
    console.error('Error accessing camera:', error)
    status.value = 'Error accessing camera'
  } finally {
    isProcessing.value = false
  }
}

const toggleDetection = () => {
  if (detectionActive.value) {
    stopDetection()
  } else {
    startDetection()
  }
}

const startDetection = () => {
  if (!cameraActive.value || !model) return
  
  detectionActive.value = true
  status.value = 'Detection active'
  processFrame()
}

const stopDetection = () => {
  detectionActive.value = false
  status.value = 'Detection stopped'
  
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

const processFrame = async () => {
  if (!detectionActive.value || !videoElement.value || !canvasElement.value) return
  
  try {
    const video = videoElement.value
    const canvas = canvasElement.value
    const ctx = canvas.getContext('2d')
    
    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Get image data and process with TensorFlow.js
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    await detectCard(imageData)
    
    // Continue processing frames
    if (detectionActive.value) {
      animationId = requestAnimationFrame(processFrame)
    }
  } catch (error) {
    console.error('Error processing frame:', error)
  }
}

const detectCard = async (imageData) => {
  try {
    // Convert ImageData to tensor
    const tensor = tf.browser.fromPixels(imageData)
      .resizeNearestNeighbor([224, 224])
      .expandDims(0)
      .div(255.0)
    
    // For demonstration, we'll use random predictions
    // In a real application, you would use: const predictions = model.predict(tensor)
    
    // Simulate model prediction with random results
    const randomIndex = Math.floor(Math.random() * cardDeck.length)
    const confidence = Math.floor(Math.random() * 40) + 60 // 60-100% confidence
    
    prediction.value = {
      card: cardDeck[randomIndex],
      confidence: confidence
    }
    
    // Clean up tensor
    tensor.dispose()
    
  } catch (error) {
    console.error('Error detecting card:', error)
  }
}

onUnmounted(() => {
  // Clean up resources
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  if (model) {
    model.dispose()
  }
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.camera-section {
  position: relative;
  margin: 20px 0;
  display: inline-block;
}

.video-stream {
  width: 100%;
  max-width: 640px;
  height: auto;
  border: 2px solid #3498db;
  border-radius: 8px;
}

.detection-canvas {
  display: none; /* Hidden canvas for processing */
}

.controls {
  margin: 20px 0;
}

.btn {
  padding: 10px 20px;
  margin: 0 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #2ecc71;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #27ae60;
}

.btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.results {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.card-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.card-name {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.confidence {
  font-size: 14px;
  color: #7f8c8d;
}

.status {
  margin-top: 20px;
  font-style: italic;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .card-result {
    flex-direction: column;
    gap: 5px;
  }
  
  .btn {
    display: block;
    width: 100%;
    margin: 5px 0;
  }
}
</style>
