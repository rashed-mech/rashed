import type { ResearchResume } from '../types';
import { MAX_RESEARCH_RESUME_BYTES } from '../utils/resumeLimits';

export function validateResearchResume(body: {fileName?: unknown; dataBase64?: unknown}): ResearchResume {
  if (typeof body.fileName !== 'string' || !/\.pdf$/i.test(body.fileName.trim()) || typeof body.dataBase64 !== 'string') throw new Error('Choose a PDF file to upload.');
  const encoded = body.dataBase64;
  if (!encoded.length || encoded.length > Math.ceil(MAX_RESEARCH_RESUME_BYTES / 3) * 4) throw new Error('The PDF must be 3 MB or smaller.');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) || encoded.length % 4 !== 0) throw new Error('The uploaded PDF could not be read.');
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.length > MAX_RESEARCH_RESUME_BYTES) throw new Error('The PDF must be 3 MB or smaller.');
  if (bytes.subarray(0, 5).toString() !== '%PDF-' || !bytes.subarray(-1024).includes(Buffer.from('%%EOF'))) throw new Error('This file is not a valid PDF.');
  const fileName = body.fileName.trim().replace(/[\x00-\x1f\x7f/\\"]/g, '_').slice(-150);
  return {fileName, size:bytes.length, updatedAt:new Date().toISOString(), dataBase64:bytes.toString('base64')};
}

export function resumeMetadata(resume?: ResearchResume | null) {
  if (!resume) return null;
  const {dataBase64: _content, ...metadata} = resume;
  return metadata;
}
