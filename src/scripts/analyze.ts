import fs from 'fs-extra';
import * as path from 'node:path';
import ProgressBar from 'progress';
import sharp from 'sharp';
import { DIR_DATA, DIR_IMAGES, FILE_RESULT } from '../config';
import {
	getImageFileMap,
	getMeanSquaredError,
	getPeakSignalToNoiseRatio,
	getSourceImageFiles,
	getStructuralSimilarity,
} from '../image';

const sourceImageFiles = await getSourceImageFiles();
const imageFileMap = await getImageFileMap(sourceImageFiles);

const bar = new ProgressBar(
	'converting [:bar] :current/:total (:percent) :etas',
	{
		total: imageFileMap.reduce((sum, d) => sum + d.images.length, 0),
	}
);

await fs.ensureDir(path.dirname(DIR_DATA));

const results: {
	source: {
		[fileName: string]: {
			size: number;
		};
	};
	compressed: {
		[fileName: string]: {
			size: number;
			mse: number;
			psnr: number;
			ssim: number;
		};
	};
} = fs.pathExistsSync(FILE_RESULT)
	? fs.readJsonSync(FILE_RESULT)
	: {
			source: {},
			compressed: {},
	  };

for (const { source, images } of imageFileMap) {
	const sourceImageFilePath = path.resolve(DIR_IMAGES, source.fileName);

	const imageSourceData = new Uint8ClampedArray(
		await sharp(sourceImageFilePath).raw().toBuffer()
	);

	results.source[source.fileName] = {
		size: source.fileSize,
	};

	for (const convertedImageFile of images) {
		const convertedImageFilePath = path.resolve(
			DIR_IMAGES,
			convertedImageFile.fileName
		);

		const imageConvertedData = new Uint8ClampedArray(
			await sharp(convertedImageFilePath).raw().toBuffer()
		);

		results.compressed[convertedImageFile.fileName] = {
			mse: getMeanSquaredError(imageSourceData, imageConvertedData),
			psnr: getPeakSignalToNoiseRatio(imageSourceData, imageConvertedData),
			ssim: getStructuralSimilarity(imageSourceData, imageConvertedData),
			size: convertedImageFile.fileSize,
		};

		await fs.writeJson(FILE_RESULT, results);

		bar.tick();
	}
}

bar.terminate();
