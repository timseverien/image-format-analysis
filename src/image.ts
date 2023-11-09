import fs from 'fs-extra';
import * as path from 'node:path';
import ssim from 'ssim';
import {
	DIR_IMAGES,
	IMAGE_FORMAT_LIST,
	IMAGE_QUALITY_LIST,
	IMAGE_RESOLUTION_LIST,
} from './config';

export type CompressedImageFormat = 'avif' | 'jpeg' | 'webp';

export type ImageResolution = [number, number];

export type SourceImageFileInfo = {
	name: string;
	format: 'png';
	fileName: string;
	fileSize: number;
	resolution: ImageResolution;
};

export type CompressedImageFileInfo = {
	name: string;
	format: CompressedImageFormat;
	fileName: string;
	fileSize: number;
	resolution: ImageResolution;
	quality: number;
};

export type CompressedImageFileResult = CompressedImageFileInfo & {
	result: {
		mse: number;
		psnr: number;
		ssim: number;
	};
};

export type ImageFileMap = {
	source: SourceImageFileInfo;
	images: CompressedImageFileInfo[];
}[];

export function createCompressedImageFileInfo(
	data: Omit<CompressedImageFileInfo, 'fileName'>
): CompressedImageFileInfo {
	return {
		...data,
		fileName: getFileNameFromCompressedImageFile(data),
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

export async function getSourceImageFiles(): Promise<SourceImageFileInfo[]> {
	const files = (await fs.readdir(DIR_IMAGES)).filter((f) =>
		f.endsWith('.png')
	);

	return files.map((file) => parseSourceImageFileName(file));
}

export function getFileNameFromCompressedImageFile(
	compressedImageFile: Omit<CompressedImageFileInfo, 'fileName'>
): string {
	const [width, height] = compressedImageFile.resolution;
	return `${compressedImageFile.name}-${width}x${height}-${compressedImageFile.quality}.${compressedImageFile.format}`;
}

export function getFileNameFromSourceImageFile(
	compressedImageFile: Omit<SourceImageFileInfo, 'fileName'>
): string {
	const [width, height] = compressedImageFile.resolution;
	return `${compressedImageFile.name}-${width}x${height}.${compressedImageFile.format}`;
}

export async function getImageFileSize(
	file: SourceImageFileInfo | CompressedImageFileInfo
) {
	const imagePath = path.resolve(DIR_IMAGES, file.fileName);
	const imageStat = await fs.stat(imagePath);
	return imageStat.size;
}

export async function getImageFileMap(
	sourceImageFiles: SourceImageFileInfo[],
	formatList: CompressedImageFormat[] = IMAGE_FORMAT_LIST,
	resolutionList: ImageResolution[] = IMAGE_RESOLUTION_LIST,
	qualityList: number[] = IMAGE_QUALITY_LIST
): Promise<ImageFileMap> {
	return Promise.all(
		sourceImageFiles.map(async (sourceImage) => {
			const images: CompressedImageFileInfo[] = [];

			for (const format of formatList) {
				for (const resolution of resolutionList) {
					for (const quality of qualityList) {
						const image = createCompressedImageFileInfo({
							format,
							quality,
							resolution,
							fileSize: 0,
							name: sourceImage.name,
						});

						try {
							image.fileSize = await getImageFileSize(image);
						} catch {}

						images.push(image);
					}
				}
			}

			return {
				source: {
					...sourceImage,
					fileSize: await getImageFileSize(sourceImage),
				},
				images,
			};
		})
	);
}

export function isFileFormat(format: string): format is CompressedImageFormat {
	return (IMAGE_FORMAT_LIST as string[]).includes(format);
}

export function parseResolution(resolution: string): ImageResolution {
	const { x = '0', y = '0' } =
		/^(?<x>[0-9]+)x(?<y>[0-9]+)$/.exec(resolution)?.groups ?? {};
	return [Number.parseInt(x), Number.parseInt(y)];
}

export function parseCompressedImageFileName(
	fileName: string
): CompressedImageFileInfo {
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

export function getMeanSquaredError(
	image1: Uint8ClampedArray,
	image2: Uint8ClampedArray
): number {
	if (image1.length !== image2.length) {
		throw new Error('Images are different in size');
	}

	let errorSum = 0;

	for (let i = 0; i < image1.length; i++) {
		// Skip alpha channel
		if (i > 0 && i % 4 === 0) continue;
		errorSum += (image1[i] - image2[i]) ** 2;
	}

	return errorSum / image1.length / 3;
}

export function getPeakSignalToNoiseRatio(
	image1: Uint8ClampedArray,
	image2: Uint8ClampedArray
): number {
	const mse = getMeanSquaredError(image1, image2);
	return mse > 0 ? 10 * Math.log10(255 ** 2 / mse) : 0;
}

function imageDataWithoutAlpha(data: Uint8ClampedArray) {
	return data.filter((v, i) => i > 0 && i % 4 !== 0);
}

export function getStructuralSimilarity(
	image1: Uint8ClampedArray,
	image2: Uint8ClampedArray
): number {
	return ssim(
		Array.from(imageDataWithoutAlpha(image1)),
		Array.from(imageDataWithoutAlpha(image2))
	);
}
