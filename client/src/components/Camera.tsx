"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import FloatingButton from "./FloatingButton";
import BackButton from "./BackButton";
import { resolveWsBase } from "@/lib/config";
import { useQueryClient } from "@tanstack/react-query";
import { useSaveFetection } from "@/hooks/useSaveDetection";

interface DetectionResult {
  name?: string;
  status: string;
}

interface WebSocketResponse {
  type?: "frame" | "result";
  image?: string;
  results: DetectionResult[];
}

export default function OpenCVCameraComponent() {
  const queryClient = useQueryClient();
  const { mutate: saveDetection } = useSaveFetection();

  const videoRef = useRef<HTMLVideoElement | null>(null);
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
  const [frame, setFrame] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const getWsConfig = (): {
    url: string;
    action: "mengambil" | "mengembalikan";
  } => {
    // Resolve WS base from env or current origin
    const isBrowser = typeof window !== "undefined";
    const path = isBrowser ? window.location.pathname : "/";
    const base = resolveWsBase();

    if (path.startsWith("/return-")) {
      if (path === "/return-phone") {
        return { url: `${base}/ws/log-hp`, action: "mengembalikan" };
      } else if (path === "/return-laptop") {
        return { url: `${base}/ws/log-laptop`, action: "mengembalikan" };
      }
    } else if (path.startsWith("/take-")) {
      if (path === "/take-phone") {
        return { url: `${base}/ws/log-hp`, action: "mengambil" };
      } else if (path === "/take-laptop") {
        return { url: `${base}/ws/log-laptop`, action: "mengambil" };
      }
    }

    // fallback to HP
    return { url: `${base}/ws/log-hp`, action: "mengambil" };
  };

  // Start the camera automatically when the component mounts
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      } catch (err) {
        console.error("❌ Failed to access camera:", err);
        setError(
          "Unable to access the camera. Please grant camera permission."
        );
      }
    };

    startCamera();

    return () => {
      // Clean up camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Periodically capture a frame and send it to the server
  const sendFrame = useCallback((action: "mengambil" | "mengembalikan") => {
    if (
      !videoRef.current ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    try {
      // Downscale frames to reduce bandwidth/CPU
      const targetWidth = Math.min(640, video.videoWidth);
      const targetHeight = Math.round(
        (video.videoHeight / video.videoWidth) * targetWidth
      );
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Lower JPEG quality to further reduce payload size
      const frameData = canvas.toDataURL("image/jpeg", 0.6);

      wsRef.current.send(JSON.stringify({ frame: frameData, action: action }));
    } catch (err) {
      console.error("Error while sending frame:", err);
    }
  }, []);

  // Reconnect handling with exponential backoff
  const scheduleReconnect = () => {
    const attempt = reconnectAttemptsRef.current + 1;
    reconnectAttemptsRef.current = attempt;
    const delay = Math.min(30000, 1000 * Math.pow(2, attempt - 1)); // 1s,2s,4s.. up to 30s
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!manuallyStoppedRef.current) startWebSocket();
    }, delay);
    console.log(
      `⏳ Reconnecting WebSocket in ${Math.round(delay / 1000)}s (attempt ${attempt})`
    );
  };

  // Connect WebSocket
  const startWebSocket = useCallback(() => {
    try {
      const { url, action } = getWsConfig();
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log("✅ Connected to WebSocket server");
        setIsConnected(true);
        setError(null);
        // Reset reconnect state
        reconnectAttemptsRef.current = 0;
        manuallyStoppedRef.current = false;

        // Start elapsed time counter
        setElapsedTime(0);
        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);

        // Start sending frames at an interval
        intervalRef.current = setInterval(() => {
          sendFrame(action);
        }, 2000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketResponse = JSON.parse(event.data);
          console.log("📥 Response from server:", data);
          setResults(data.results || []);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
          console.log("📩 Data dari server:", data)
            // 🟢 Save to TanStack cache
            queryClient.setQueryData(["latest-detection"], data.results);

            // 🟢 Send to backend using mutation
            saveDetection(data.results);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = () => {
        console.log("🔌 WebSocket connection closed");
        // Stop timers when WS closes
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsConnected(false);
        if (!manuallyStoppedRef.current) scheduleReconnect();
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setError("WebSocket connection error");
        // Stop timers on error as well
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsConnected(false);
        if (!manuallyStoppedRef.current) scheduleReconnect();
      };
    } catch (err) {
      console.error("Error creating WebSocket:", err);
      setError("Failed to create WebSocket connection");
    }
  }, [sendFrame]);

  // Stop WebSocket and timers
  const stopWebSocket = useCallback(() => {
    manuallyStoppedRef.current = true;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsConnected(false);
    setResults([]);
    setElapsedTime(0);
  }, []);

  // Ensure WS is closed when component unmounts
  useEffect(() => {
    return () => {
      manuallyStoppedRef.current = true;
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
        wsRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center gap-4">
      {/* Camera is always ON */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute w-full h-full object-cover bg-black"
      />

      <FloatingButton />

      {/* Timer runs only while WS is active */}
      <div className="px-5 py-2 absolute right-4 top-8 bg-purple-500 text-white rounded-lg text-sm font-medium">
        ⏱️ Timer: {formatTime(elapsedTime)}
      </div>

      {/* WebSocket controls */}
      <div className="absolute right-4 top-20 flex gap-4">
        <button
          onClick={startWebSocket}
          disabled={isConnected}
          className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
        >
          Start
        </button>
        <button
          onClick={stopWebSocket}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      {/* Navigation */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <BackButton />
      </div>

      {frame && (
        <img
          src={frame}
          alt="Frame dari server"
          className="absolute top-0 left-0 w-32 h-32 border-2 border-white"
        />
      )}

      {/* Detection results */}
      <div className="absolute bottom-12 w-full text-center">
        <div className="p-4 w-full mt-24 bg-transparent mx-auto max-w-7xl py-18 rounded-lg">
          {/* <h3 className="font-bold text-4xl text-gray-800 mb-3 flex items-center justify-center gap-2">
            🎯 Detection Results
          </h3> */}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
              ❌ {error}
            </div>
          )}

          {/* {results.length === 0 ? (
            <p className="text-white text-7xl italic">
              {isConnected ? "Menunggu deteksi..." : "WebSocket belum aktif"}
            </p>
          ) : ( */}
          <div className="space-y-2 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-md font-extrabold text-7xl ${
                  result.status?.endsWith("_SUCCESS")
                    ? "text-green-500 drop-shadow-[0_0_4px_black]"
                    : result.status === "NOT_FOUND"
                    ? "text-orange-500 drop-shadow-[0_0_4px_black]"
                    : "text-red-500 drop-shadow-[0_0_4px_black]"
                }`}
              >
                <div className="flex items-center justify-center">
                  <span className="truncate">{result.name || "Wajah Tidak Dikenali"}</span>
                  {/* <span className="ml-2 text-xs opacity-75">
                      {result.status}
                    </span> */}
                </div>
              </div>
            ))}
          </div>
          {/* )} */}
        </div>
      </div>
    </div>
  );
}
