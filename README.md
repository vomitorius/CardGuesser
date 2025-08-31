# CardGuesser
AI Card guesser web app with TensorFlow.js

A Nuxt.js web application that uses your webcam and TensorFlow.js to identify playing cards from a standard 52-card deck in real-time.

## Features

- 🎯 Real-time card detection using webcam
- 🧠 TensorFlow.js integration for AI processing
- 📱 Responsive design for mobile and desktop
- 🎨 Clean, modern user interface
- 🚀 Fast client-side processing

## Demo

![Card Guesser Screenshot](https://github.com/user-attachments/assets/858733da-d10a-43cf-9905-e2c452d09fa4)

## Installation

```bash
# Clone the repository
git clone https://github.com/vomitorius/CardGuesser.git
cd CardGuesser

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Start Camera**: Click the "Start Camera" button to access your webcam
2. **Start Detection**: Once the camera is active, click "Start Detection" to begin card recognition
3. **Show Cards**: Hold playing cards in front of your camera for AI detection
4. **View Results**: Detected cards and confidence levels will be displayed in real-time

## Technologies Used

- **Nuxt.js 4**: Vue.js framework for the web application
- **TensorFlow.js**: Machine learning library for browser-based AI
- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe JavaScript development

## Browser Requirements

- Modern browser with webcam support
- JavaScript enabled
- HTTPS (required for camera access in production)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes

- The current implementation uses a demo model with random predictions for demonstration purposes
- For production use, you would need to train or integrate a proper card recognition model
- Camera access requires HTTPS in production environments
- The app is optimized for client-side rendering (SSR disabled for camera access)

## License

MIT License