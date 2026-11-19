/** Downloads a PDF served by the API, keeping the server's file name. */
export async function downloadPdf(url: string, fallbackName: string, unavailable = 'The file is not available. Please try again later.') {
  const response = await fetch(url, {cache:'no-store'});
  if (!response.ok) throw new Error(unavailable);
  if (!response.headers.get('content-type')?.includes('application/pdf')) throw new Error('The PDF could not be downloaded.');
  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  let fileName = fallbackName;
  if (encodedName) { try { fileName = decodeURIComponent(encodedName); } catch {} }
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export async function downloadResearchResume() {
  await downloadPdf('/api/research-resume', 'Research_Resume.pdf', 'The research resume is not available. Please try again later.');
}
