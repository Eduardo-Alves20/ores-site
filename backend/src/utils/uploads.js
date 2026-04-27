import path from 'path';

function resolveUploadsDir() {
  const configured = process.env.UPLOADS_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured);
  }
  return path.resolve(process.cwd(), 'uploads');
}

export const uploadsDir = resolveUploadsDir();

