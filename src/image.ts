import { IMAGE_FORMAT_LIST } from './config';

export type ConvertedImageFormat = 'avif' | 'jpeg' | 'webp';

export type ImageResolution = [number, number];

export type SourceImageFileInfo = {
	name: string;
	format: 'png';
	fileName: string;
	fileSize: number;
	resolution: ImageResolution;
};

export type ConvertedImageFileInfo = {
	name: string;
	format: ConvertedImageFormat;
	fileName: string;
	fileSize: number;
	resolution: ImageResolution;
	quality: number;
};

export type ConvertedImageFileResult = ConvertedImageFileInfo & {
	result: {
		mse: number;
		psnr: number;
		ssim: number;
	};
};

export function createConvertedImageFileInfo(
	data: Omit<ConvertedImageFileInfo, 'fileName'>
): ConvertedImageFileInfo {
	return {
		...data,
		fileName: getFileNameFromConvertedImageFile(data),
	};
}

export function createSourceImageFileInfo(
	data: Omit<SourceImageFileInfo, 'fileName'>
): SourceImageFileInfo {
	return {
		...data,
		fileName: getFileNameFromSourceImageFile(data),
	};
}

export function getFileNameFromConvertedImageFile(
	convertedImageFile: Omit<ConvertedImageFileInfo, 'fileName'>
): string {
	const [width, height] = convertedImageFile.resolution;
	return `${convertedImageFile.name}-${width}x${height}-${convertedImageFile.quality}.${convertedImageFile.format}`;
}

export function getFileNameFromSourceImageFile(
	convertedImageFile: Omit<SourceImageFileInfo, 'fileName'>
): string {
	const [width, height] = convertedImageFile.resolution;
	return `${convertedImageFile.name}-${width}x${height}.${convertedImageFile.format}`;
}

export function isFileFormat(format: string): format is ConvertedImageFormat {
	return (IMAGE_FORMAT_LIST as string[]).includes(format);
}

export function parseResolution(resolution: string): ImageResolution {
	const { x = '0', y = '0' } =
		/^(?<x>[0-9]+)x(?<y>[0-9]+)$/.exec(resolution)?.groups ?? {};
	return [Number.parseInt(x), Number.parseInt(y)];
}

export function parseConvertedImageFileName(
	fileName: string
): ConvertedImageFileInfo {
	const {
		name = 'unknown',
		resolution = '0x0',
		format = 'avif',
		quality = '0',
	} = /^(?<name>.+?)-(?<resolution>[0-9]+x[0-9]+)-(?<quality>[0-9]+)\.(?<format>[a-z]+)$/.exec(
		fileName
	)?.groups ?? {};

	if (!isFileFormat(format)) {
		throw new Error(`Format "${format}" is not supported`);
	}

	return {
		fileName,
		fileSize: 0,
		format,
		quality: Number.parseInt(quality),
		name: name,
		resolution: parseResolution(resolution),
	};
}

export function parseSourceImageFileName(
	fileName: string
): SourceImageFileInfo {
	const { name = 'unknown', resolution = '0x0' } =
		/^(?<name>.+?)-(?<resolution>[0-9]+x[0-9]+)\.png$/.exec(fileName)?.groups ??
		{};

	return {
		fileName,
		fileSize: 0,
		format: 'png',
		name: name,
		resolution: parseResolution(resolution),
	};
}
