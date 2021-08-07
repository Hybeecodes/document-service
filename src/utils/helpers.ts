import * as randomString from 'randomstring';

export function getExtensionFromFilename(fileName: string) {
  const effectiveFileName = String(fileName).replace(/\.+$/, '');

  const lastDotIndex = effectiveFileName.lastIndexOf('.');

  if (lastDotIndex === -1) return null;

  return effectiveFileName.substring(lastDotIndex + 1);
}

export function generateRandomFileName(
  fileNameLength = 20,
  fileExtension = null,
) {
  const randomFileName = randomString.generate({
    length: Number(fileNameLength) || 20,
    charset: 'abcdefghijklmnopqrstuvwxyz1234567890',
  });

  const fileInfo = {
    baseName: randomFileName,
    extension: null,
    fileName: randomFileName,
  };

  if (fileExtension) {
    const extensionWithoutDot = String(fileExtension).startsWith('.')
      ? String(fileExtension).substring(1)
      : fileExtension;

    fileInfo.fileName = `${fileInfo.baseName}.${extensionWithoutDot}`;

    fileInfo.extension = extensionWithoutDot;
  }
  return fileInfo;
}

export function generateKeyName(fileName: string, uploadPath: string): string {
  return `${uploadPath}/${fileName}`;
}
