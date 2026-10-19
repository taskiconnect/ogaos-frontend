import { documentStyles } from './documentStyles'
/** Clone escaped React DOM, never interpolate customer data into document.write. */
export async function printBusinessDocument(element: HTMLElement, title: string) {
  const popup = window.open('', '_blank', 'width=980,height=900')
  if (!popup) throw new Error('Allow pop-ups to print or save this document.')
  popup.document.title = title
  const style = popup.document.createElement('style')
  style.textContent = `body{margin:0;padding:24px;background:#eef2f8}${documentStyles}`
  popup.document.head.appendChild(style)
  popup.document.body.appendChild(element.cloneNode(true))
  await Promise.race([
    Promise.all(
      [...popup.document.images].map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.onload = resolve
              img.onerror = resolve
            }),
      ),
    ),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ])
  if (!popup.closed) {
    popup.focus()
    popup.print()
  }
}
