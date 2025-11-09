"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import FloatingButton from "./FloatingButton";
import BackButton from "./BackButton";
import { resolveWsBase } from "@/lib/config";
import * as faceapi from "face-api.js";

interface DetectionResult {
  name?: string;
  status: string;
}
interface WebSocketResponse {
  results: DetectionResult[];
}

export default function OpenCVCameraComponent() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manuallyStoppedRef = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // FACE-API model loading
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;
    (async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      ]);
      if (isActive) setModelsLoaded(true);
    })();
    return () => { isActive = false; };
  }, []);

  // Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;
      } catch (err) {
        setError("Unable to access camera. Please grant camera permission.");
      }
    };
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // LIVE FACE DETECTION & DRAW WITH COLOR ACCORDING TO DETECTION RESULT
  useEffect(() => {
    if (!modelsLoaded) return;
    let animationId: number;
    const detectFaces = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (
        !video || !canvas ||
        video.videoWidth === 0 || video.videoHeight === 0 ||
        video.readyState !== 4
      ) {
        animationId = requestAnimationFrame(detectFaces);
        return;
      }
      if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
      if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
      // Face detection (frame)
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      // Matching detection box color with results (by index)
      detections.forEach((det, idx) => {
        // Default colors
        let boxColor = "red", label = "Unknown Face";
        if (results[idx]) {
          if (
            (results[idx].status && results[idx].status.endsWith("_SUCCESS")) ||
            (results[idx].name && results[idx].name !== "Unknown Face")
          ) {
            boxColor = "green";
            label = results[idx].name!;
          }
        }
        const box = det.box;
        ctx!.strokeStyle = boxColor;
        ctx!.lineWidth = 4;
        ctx!.strokeRect(box.x, box.y, box.width, box.height);

        // Draw label text above box
        ctx!.font = "bold 20px Arial";
        ctx!.fillStyle = boxColor;
        ctx!.fillText(label, box.x, box.y - 10);
      });
      animationId = requestAnimationFrame(detectFaces);
    };
    animationId = requestAnimationFrame(detectFaces);
    return () => animationId && cancelAnimationFrame(animationId);
  }, [modelsLoaded, results]);

  // WebSocket & Frame Send Logic (unchanged)
  const getWsConfig = (): { url: string; action: "mengambil" | "mengembalikan"; } => {
    const isBrowser = typeof window !== "undefined";
    const path = isBrowser ? window.location.pathname : "/";
    const base = resolveWsBase();
    if (path.startsWith("/return-")) {
      if (path === "/return-phone") return { url: `${base}/ws/log-hp`, action: "mengembalikan" };
      if (path === "/return-laptop") return { url: `${base}/ws/log-laptop`, action: "mengembalikan" };
    } else if (path.startsWith("/take-")) {
      if (path === "/take-phone") return { url: `${base}/ws/log-hp`, action: "mengambil" };
      if (path === "/take-laptop") return { url: `${base}/ws/log-laptop`, action: "mengambil" };
    }
    return { url: `${base}/ws/log-hp`, action: "mengambil" };
  };
  const sendFrame = useCallback((action: "mengambil" | "mengembalikan") => {
    if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    try {
      const targetWidth = Math.min(640, video.videoWidth);
      const targetHeight = Math.round((video.videoHeight / video.videoWidth) * targetWidth);
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameData = canvas.toDataURL("image/jpeg", 0.6);
      wsRef.current.send(JSON.stringify({ frame: frameData, action: action }));
    } catch (err) {}
  }, []);

  const scheduleReconnect = () => {
    const attempt = reconnectAttemptsRef.current + 1;
    reconnectAttemptsRef.current = attempt;
    const delay = Math.min(30000, 1000 * Math.pow(2, attempt - 1));
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!manuallyStoppedRef.current) startWebSocket();
    }, delay);
  };

  const startWebSocket = useCallback(() => {
    try {
      const { url, action } = getWsConfig();
      wsRef.current = new WebSocket(url);
      wsRef.current.onopen = () => {
        setIsConnected(true); setError(null);
        reconnectAttemptsRef.current = 0; manuallyStoppedRef.current = false;
        setElapsedTime(0);
        timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
        intervalRef.current = setInterval(() => sendFrame(action), 2000);
      };
      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketResponse = JSON.parse(event.data);
          setResults(data.results || []);
        } catch (err) {}
      };
      wsRef.current.onclose = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setIsConnected(false);
        if (!manuallyStoppedRef.current) scheduleReconnect();
      };
      wsRef.current.onerror = () => {
        setError("WebSocket connection error");
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setIsConnected(false);
        if (!manuallyStoppedRef.current) scheduleReconnect();
      };
    } catch (err) {
      setError("Failed to create WebSocket connection");
    }
  }, [sendFrame]);
  const stopWebSocket = useCallback(() => {
    manuallyStoppedRef.current = true;
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsConnected(false); setResults([]); setElapsedTime(0);
  }, []);
  useEffect(() => {
    return () => {
      manuallyStoppedRef.current = true;
      if (wsRef.current) { try { wsRef.current.close(); } catch {} wsRef.current = null; }
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (reconnectTimeoutRef.current) { clearTimeout(reconnectTimeoutRef.current); reconnectTimeoutRef.current = null; }
    };
  }, []);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center gap-4">
      {/* Camera */}
      <div className="absolute w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-black"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: 2, pointerEvents: "none" }}
        />
      </div>
      <FloatingButton />
      <div className="px-5 py-2 absolute right-4 top-8 bg-purple-500 text-white rounded-lg text-sm font-medium">
        ⏱️ Timer: {formatTime(elapsedTime)}
      </div>
      <div className="absolute right-4 top-20 flex gap-4">
        <button
          onClick={startWebSocket}
          disabled={isConnected}
          className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
        >Start</button>
        <button
          onClick={stopWebSocket}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
        >Stop</button>
      </div>
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <BackButton />
      </div>
      <div className="absolute bottom-12 w-full text-center">
        <div className="p-4 w-full mt-24 bg-transparent mx-auto max-w-7xl py-18 rounded-lg">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
              ❌ {error}
            </div>
          )}
          <div className="space-y-2 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-md font-extrabold text-7xl ${
                  result.status?.endsWith("_SUCCESS")
                    ? "text-green-500 drop-shadow-[0_0_4px_black]"
                    : result.status === "NOT_FOUND" || result.name === "Unknown Face"
                      ? "text-red-500 drop-shadow-[0_0_4px_black]"
                      : "text-orange-500 drop-shadow-[0_0_4px_black]"
                }`}
              >
                <div className="flex items-center justify-center">
                  <span className="truncate">{result.name || "Unknown Face"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
