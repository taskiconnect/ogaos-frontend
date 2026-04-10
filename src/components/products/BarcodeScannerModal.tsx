'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { X, Camera, Loader2, RefreshCw, AlertCircle } from 'lucide-react'

interface BarcodeScannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDetected: (barcode: string) => void
}

const SCAN_INTERVAL_MS = 180
const REQUIRED_STABLE_FRAMES = 2
const SHOW_DEBUG_CANVAS = true

function getAdaptiveScanBox(videoWidth: number, videoHeight: number) {
  const aspectRatio = videoWidth / videoHeight

  if (aspectRatio >= 1.55) {
    return {
      x: 0.08,
      y: 0.28,
      width: 0.84,
      height: 0.24,
    }
  }

  return {
    x: 0.1,
    y: 0.26,
    width: 0.8,
    height: 0.3,
  }
}

export default function BarcodeScannerModal({
  open,
  onOpenChange,
  onDetected,
}: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimerRef = useRef<number | null>(null)
  const scanBusyRef = useRef(false)
  const isClosingRef = useRef(false)
  const lastScannedValueRef = useRef('')
  const stableCountRef = useRef(0)

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [cameraReady, setCameraReady] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [scanGuide, setScanGuide] = useState({
    x: 0.1,
    y: 0.26,
    width: 0.8,
    height: 0.3,
  })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const resetDetectionState = useCallback(() => {
    lastScannedValueRef.current = ''
    stableCountRef.current = 0
    scanBusyRef.current = false
    setDetecting(false)
  }, [])

  const stopScanner = useCallback(() => {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current)
      scanTimerRef.current = null
    }

    scanBusyRef.current = false
    setDetecting(false)

    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch {
          // ignore
        }
      })
      streamRef.current = null
    }

    const video = videoRef.current
    if (video) {
      try {
        video.pause()
      } catch {
        // ignore
      }
      video.srcObject = null
    }
  }, [])

  const closeModal = useCallback(() => {
    isClosingRef.current = true
    stopScanner()
    onOpenChange(false)
  }, [onOpenChange, stopScanner])

  const handleRefresh = useCallback(() => {
    stopScanner()
    setError('')
    setCameraReady(false)
    setDetecting(false)
    setDevices([])
    setDeviceId('')
    resetDetectionState()
    setRefreshKey((prev) => prev + 1)
  }, [resetDetectionState, stopScanner])

  const modalContent = useMemo(() => {
    if (!open) return null

    return (
      <div
        className="fixed inset-0 z-[2147483647] isolate"
        aria-modal="true"
        role="dialog"
      >
        <div
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={closeModal}
        />

        <div className="absolute inset-0 overflow-y-auto overscroll-contain">
          <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-5">
            <div
              className="relative z-[1] w-full overflow-hidden rounded-t-[1.75rem] border border-cyan-500/15 bg-[#0b1016] shadow-[0_24px_80px_rgba(0,0,0,0.65)] sm:max-w-2xl sm:rounded-[1.75rem]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 bg-[linear-gradient(180deg,rgba(10,16,24,0.98),rgba(10,16,24,0.9))] px-5 py-4 sm:px-6">
                <div>
                  <h3 className="text-base font-bold text-white sm:text-lg">Scan Barcode</h3>
                  <p className="text-xs text-gray-400 sm:text-sm">
                    Position the barcode inside the guide frame for fast scanning
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
                >
                  <X className="h-4 w-4 text-gray-300" />
                </button>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
                  <div className="relative flex min-h-[360px] w-full items-center justify-center sm:min-h-[420px]">
                    <video
                      ref={videoRef}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      autoPlay
                    />

                    <canvas
                      ref={canvasRef}
                      className={
                        SHOW_DEBUG_CANVAS
                          ? 'absolute bottom-3 right-3 z-20 h-24 w-40 rounded-xl border border-cyan-400/40 bg-black/70 object-contain shadow-xl sm:h-28 sm:w-48'
                          : 'hidden'
                      }
                    />

                    <div className="pointer-events-none absolute inset-0 z-10">
                      <div className="absolute inset-0 bg-black/48" />

                      <div
                        className="absolute rounded-[1.25rem] border-2 border-cyan-400/95 shadow-[0_0_0_9999px_rgba(0,0,0,0.28),0_0_0_1px_rgba(34,211,238,0.35),0_0_24px_rgba(34,211,238,0.28)]"
                        style={{
                          left: `${scanGuide.x * 100}%`,
                          top: `${scanGuide.y * 100}%`,
                          width: `${scanGuide.width * 100}%`,
                          height: `${scanGuide.height * 100}%`,
                        }}
                      >
                        <div className="absolute inset-x-3 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-300 to-transparent opacity-80" />
                      </div>
                    </div>

                    {loading && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/65">
                        <Loader2 className="h-7 w-7 animate-spin text-white" />
                        <p className="text-sm text-white">Starting camera...</p>
                      </div>
                    )}

                    {!loading && cameraReady && !error && (
                      <>
                        <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                          {detecting ? 'Scanning…' : 'Camera ready'}
                        </div>

                        {SHOW_DEBUG_CANVAS && (
                          <div className="pointer-events-none absolute bottom-[7.3rem] right-3 z-20 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-200 sm:bottom-[8.4rem]">
                            Decoder view
                          </div>
                        )}
                      </>
                    )}

                    {error && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/75 px-6 text-center">
                        <AlertCircle className="h-8 w-8 text-cyan-300" />
                        <p className="text-sm font-semibold text-white">Camera could not start</p>
                        <p className="max-w-sm text-xs leading-5 text-gray-300">{error}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Camera
                    </label>
                    <select
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/20"
                      disabled={devices.length === 0 || loading}
                    >
                      {devices.length === 0 ? (
                        <option value="" className="bg-[#0b1016]">
                          No camera available
                        </option>
                      ) : (
                        devices.map((device, index) => (
                          <option
                            key={device.deviceId || `device-${index}`}
                            value={device.deviceId}
                            className="bg-[#0b1016]"
                          >
                            {device.label || `Camera ${index + 1}`}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleRefresh}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 sm:w-auto"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Camera className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <div className="space-y-1">
                      <p className="text-xs leading-5 text-emerald-100">
                        Hold the barcode a bit farther away on laptop cameras so it stays sharp inside the guide.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }, [open, closeModal, loading, cameraReady, error, detecting, devices, deviceId, handleRefresh, scanGuide])

  useEffect(() => {
    if (!open) {
      isClosingRef.current = false
      stopScanner()
      setError('')
      setLoading(false)
      setCameraReady(false)
      resetDetectionState()
      return
    }

    let active = true
    isClosingRef.current = false

    async function setup() {
      try {
        setLoading(true)
        setError('')
        setCameraReady(false)
        resetDetectionState()

        if (!readerRef.current) {
          readerRef.current = new BrowserMultiFormatReader()
        }

        await ensureCameraPermission()

        const allDevices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (!active) return

        setDevices(allDevices)

        const preferredDevice =
          allDevices.find((d) => /back|rear|environment/i.test(d.label)) ?? allDevices[0]

        if (!preferredDevice) {
          setError('No camera found on this device')
          setLoading(false)
          return
        }

        const chosenId = deviceId || preferredDevice.deviceId
        setDeviceId(chosenId)

        await startCamera(chosenId)

        if (!active) return

        setCameraReady(true)
        setLoading(false)
        startCropScanning()
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Unable to access camera or start scanner'

        if (active) {
          setError(message)
          setLoading(false)
          setCameraReady(false)
          resetDetectionState()
        }
      }
    }

    void setup()

    return () => {
      active = false
      stopScanner()
    }
  }, [open, refreshKey, deviceId, resetDetectionState, stopScanner])

  useEffect(() => {
    if (!open || !deviceId || loading) return

    let cancelled = false

    async function restartForSelectedCamera() {
      try {
        stopScanner()
        setLoading(true)
        setError('')
        setCameraReady(false)
        resetDetectionState()

        await startCamera(deviceId)

        if (cancelled) return

        setCameraReady(true)
        setLoading(false)
        startCropScanning()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to switch camera'

        if (!cancelled) {
          setError(message)
          setLoading(false)
          setCameraReady(false)
          resetDetectionState()
        }
      }
    }

    const streamAlreadyUsingThisDevice =
      streamRef.current?.getVideoTracks?.()[0]?.getSettings?.().deviceId === deviceId

    if (!streamAlreadyUsingThisDevice) {
      void restartForSelectedCamera()
    }

    return () => {
      cancelled = true
    }
  }, [deviceId, loading, open, resetDetectionState, stopScanner])

  async function ensureCameraPermission() {
    const tempStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })

    tempStream.getTracks().forEach((track) => {
      try {
        track.stop()
      } catch {
        // ignore
      }
    })
  }

  async function startCamera(selectedDeviceId?: string) {
    stopScanner()

    const constraints: MediaStreamConstraints = {
      video: selectedDeviceId
        ? {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 1.777777778 },
            facingMode: { ideal: 'environment' },
          }
        : {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 1.777777778 },
          },
      audio: false,
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    streamRef.current = stream

    const video = videoRef.current
    if (!video) {
      throw new Error('Video element not ready')
    }

    video.srcObject = stream
    await video.play()

    if (video.readyState < 2) {
      await new Promise<void>((resolve) => {
        const handleLoaded = () => {
          video.removeEventListener('loadedmetadata', handleLoaded)
          resolve()
        }
        video.addEventListener('loadedmetadata', handleLoaded)
      })
    }

    if (video.videoWidth && video.videoHeight) {
      setScanGuide(getAdaptiveScanBox(video.videoWidth, video.videoHeight))
    }
  }

  function startCropScanning() {
    if (!readerRef.current || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx) {
      setError('Canvas is not available for barcode detection')
      return
    }

    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current)
      scanTimerRef.current = null
    }

    scanTimerRef.current = window.setInterval(() => {
      if (scanBusyRef.current) return
      if (!open || isClosingRef.current) return
      if (!video.videoWidth || !video.videoHeight) return

      scanBusyRef.current = true

      void (async () => {
        try {
          setDetecting(true)

          const box = getAdaptiveScanBox(video.videoWidth, video.videoHeight)
          setScanGuide(box)

          const cropX = Math.max(0, Math.floor(video.videoWidth * box.x))
          const cropY = Math.max(0, Math.floor(video.videoHeight * box.y))
          const cropW = Math.max(1, Math.floor(video.videoWidth * box.width))
          const cropH = Math.max(1, Math.floor(video.videoHeight * box.height))

          canvas.width = cropW
          canvas.height = cropH

          ctx.clearRect(0, 0, cropW, cropH)
          ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

          const result = await readerRef.current!.decodeFromCanvas(canvas)
          const value = result.getText()?.trim()

          if (!value) return

          if (value === lastScannedValueRef.current) {
            stableCountRef.current += 1
          } else {
            lastScannedValueRef.current = value
            stableCountRef.current = 1
          }

          if (stableCountRef.current >= REQUIRED_STABLE_FRAMES) {
            stopScanner()
            onDetected(value)
            onOpenChange(false)
          }
        } catch (err: unknown) {
          const maybeError = err as { name?: string; message?: string }
          const isNoCodeFrame =
            maybeError?.name === 'NotFoundException' ||
            maybeError?.message?.includes('No MultiFormat Readers were able to detect the code') ||
            maybeError?.message?.includes('No code detected')

          if (!isNoCodeFrame) {
            console.error('Barcode crop scan error:', err)
          }
        } finally {
          scanBusyRef.current = false
        }
      })()
    }, SCAN_INTERVAL_MS)
  }

  if (!mounted || !open) return null

  return createPortal(modalContent, document.body)
}