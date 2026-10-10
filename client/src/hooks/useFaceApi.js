import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

// CDN URL where pre-trained weights for TinyFaceDetector, FaceLandmark68Net, and FaceRecognitionNet are hosted
const MODEL_CDN_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
const LOCAL_MODEL_URL = '/models';

export function useFaceApi() {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [detectionState, setDetectionState] = useState({
    faceDetected: false,
    confidence: 0,
    box: null,
    livenessScore: 0,
    statusText: 'Initializing biometric scanner...',
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastDescriptorRef = useRef(null);

  // Load models on mount
  useEffect(() => {
    let isMounted = true;

    async function loadModels() {
      try {
        setIsModelLoading(true);
        setModelError(null);

        // Try local /models first, fallback to CDN
        try {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(LOCAL_MODEL_URL),
          ]);
        } catch (localErr) {
          // Fallback to CDN
          console.info('[EchoSense FaceAPI] Local weights not present, loading high-speed neural models from CDN...');
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_CDN_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_CDN_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_CDN_URL),
          ]);
        }

        if (isMounted) {
          setIsModelReady(true);
          setIsModelLoading(false);
          console.log('[EchoSense FaceAPI] Models loaded successfully.');
        }
      } catch (err) {
        console.error('[EchoSense FaceAPI Model Load Error]:', err);
        if (isMounted) {
          setModelError('Could not load face recognition neural nets: ' + err.message);
          setIsModelLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  // Start webcam video stream
  const startCamera = useCallback(async (videoElement) => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API is not supported in this browser.');
      }

      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoElement) {
        videoRef.current = videoElement;
        videoElement.srcObject = stream;
        await new Promise((resolve) => {
          videoElement.onloadedmetadata = () => {
            videoElement.play();
            resolve();
          };
        });
        setCameraActive(true);
      }
      return true;
    } catch (err) {
      console.error('[EchoSense Camera Error]:', err);
      let message = 'Unable to access webcam. Please check browser camera permissions.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No webcam device found on your system.';
      }
      setCameraError(message);
      setCameraActive(false);
      return false;
    }
  }, []);

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Real-time face detection loop
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !isModelReady || videoRef.current.paused || videoRef.current.ended) {
      return null;
    }

    try {
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5,
      });

      const detection = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const score = detection.detection.score;
        const box = detection.detection.box;
        const descriptor = Array.from(detection.descriptor);
        lastDescriptorRef.current = descriptor;

        // Simple liveness & quality score
        // Face should be centered and appropriately sized
        const videoWidth = videoRef.current.videoWidth || 640;
        const videoHeight = videoRef.current.videoHeight || 480;
        const isCentered =
          box.x > videoWidth * 0.1 &&
          box.x + box.width < videoWidth * 0.9 &&
          box.y > videoHeight * 0.1;
        const isGoodSize = box.width > 120 && box.height > 120;

        let liveness = 70;
        if (isCentered) liveness += 15;
        if (isGoodSize) liveness += 15;
        if (score > 0.85) liveness = Math.min(100, liveness + 5);

        let statusText = 'Face detected. Please hold still...';
        if (liveness >= 90) {
          statusText = 'Optimal biometric alignment. Ready to verify!';
        } else if (!isCentered) {
          statusText = 'Center your face inside the scanning ring.';
        } else if (!isGoodSize) {
          statusText = 'Move a bit closer to the camera.';
        }

        setDetectionState({
          faceDetected: true,
          confidence: Math.round(score * 100),
          box,
          livenessScore: liveness,
          statusText,
        });

        return {
          descriptor,
          confidence: score,
          liveness,
          box,
        };
      } else {
        lastDescriptorRef.current = null;
        setDetectionState({
          faceDetected: false,
          confidence: 0,
          box: null,
          livenessScore: 0,
          statusText: 'No face detected. Position your face in view.',
        });
        return null;
      }
    } catch (err) {
      console.warn('[EchoSense Detection Frame Warning]:', err.message);
      return null;
    }
  }, [isModelReady]);

  // Capture face descriptor for enrollment or authentication
  const captureDescriptor = useCallback(async () => {
    // If real camera and model are running
    if (videoRef.current && isModelReady) {
      const result = await processFrame();
      if (result && result.descriptor) {
        return result.descriptor;
      }
    }

    if (lastDescriptorRef.current) {
      return lastDescriptorRef.current;
    }

    return null;
  }, [isModelReady, processFrame]);

  // Generate deterministic synthetic biometric descriptor (for testing when camera is unavailable)
  const generateSimulatedDescriptor = useCallback((seedString = 'echosense_test_user') => {
    const vector = new Array(128);
    // Simple deterministic PRNG based on seed string
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (hash << 5) - hash + seedString.charCodeAt(i);
      hash |= 0;
    }

    let current = Math.abs(hash) || 12345;
    for (let i = 0; i < 128; i++) {
      current = (current * 9301 + 49297) % 233280;
      const val = (current / 233280) * 0.4 - 0.2; // Range ~ -0.2 to +0.2
      vector[i] = parseFloat(val.toFixed(6));
    }
    return vector;
  }, []);

  return {
    isModelLoading,
    isModelReady,
    modelError,
    cameraActive,
    cameraError,
    detectionState,
    videoRef,
    startCamera,
    stopCamera,
    processFrame,
    captureDescriptor,
    generateSimulatedDescriptor,
  };
}

export default useFaceApi;
