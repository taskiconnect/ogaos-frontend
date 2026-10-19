/** Renders the document node to a canvas. Library loads on demand. */
async function renderCanvas(node: HTMLElement): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas-pro')
  return html2canvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true, // lets the business logo render if its host sends CORS headers
    windowWidth: 900, // lay out at desktop width so the phone's 600px media query doesn't apply
    onclone: (doc: Document) => {
      doc.querySelectorAll<HTMLElement>('.oga-document').forEach((el: HTMLElement) => {
        el.style.borderRadius = '0'
        el.style.boxShadow = 'none'
      })
    },
  })
}

/** A4 PDF blob. */
export async function documentToPdf(node: HTMLElement): Promise<Blob> {
  const [canvas, { jsPDF }] = await Promise.all([renderCanvas(node), import('jspdf')])

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const imgH = (canvas.height * pageW) / canvas.width
  const img = canvas.toDataURL('image/jpeg', 0.92)

  let offset = 0
  do {
    if (offset > 0) pdf.addPage()
    pdf.addImage(img, 'JPEG', 0, -offset, pageW, imgH)
    offset += pageH
  } while (offset < imgH)

  return pdf.output('blob')
}

/** One tall PNG image of the whole document. */
export async function documentToImage(node: HTMLElement): Promise<Blob> {
  const canvas = await renderCanvas(node)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image'))),
      'image/png',
    )
  })
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const a = window.document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}