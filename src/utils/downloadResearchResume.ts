export async function downloadResearchResume() {
  const response = await fetch('/api/research-resume', {cache:'no-store'});
  if (!response.ok) throw new Error('The research resume is not available. Please try again later.');
  if (!response.headers.get('content-type')?.includes('application/pdf')) throw new Error('The research resume could not be downloaded.');
  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  let fileName = 'Research_Resume.pdf';
  if (encodedName) { try { fileName = decodeURIComponent(encodedName); } catch {} }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
