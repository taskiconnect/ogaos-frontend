declare module 'html2canvas-pro' {
  interface Html2CanvasOptions {
    scale?: number
    backgroundColor?: string | null
    useCORS?: boolean
    windowWidth?: number
    onclone?: (document: Document) => void
  }
  export default function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions,
  ): Promise<HTMLCanvasElement>
}