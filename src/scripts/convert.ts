import fs from 'fs-extra';
import * as path from 'node:path';
import ProgressBar from 'progress';
import sharp from 'sharp';
import { DIR_IMAGES, IMAGE_FORMAT_LIST, IMAGE_QUALITY_LIST } from '../config';
import { getImageFileMap, getSourceImageFiles } from '../image';

const sourceImageFiles = await getSourceImageFiles();

const bar = new ProgressBar(
	'converting [:bar] :current/:total (:percent) :etas',
	{
		total:
			IMAGE_FORMAT_LIST.length *
			IMAGE_QUALITY_LIST.length *
			sourceImageFiles.length,
	}
);

const imageFileMap = await getImageFileMap(sourceImageFiles);

for (const { source, images } of imageFileMap) {
	const sourceImageFilePath = path.resolve(DIR_IMAGES, source.fileName);

	for (const convertedImageFile of images) {
		const convertedImageFilePath = path.resolve(
			DIR_IMAGES,
			convertedImageFile.fileName
		);

		if (await fs.pathExists(convertedImageFilePath)) {
			bar.interrupt(`Skipping ${convertedImageFile.fileName}`);
			bar.tick();
			continue;
		}

		await sharp(sourceImageFilePath)
			.toFormat(convertedImageFile.format, {
				quality: convertedImageFile.quality,
			})
			.toFile(convertedImageFilePath);

		bar.tick();
	}
}

bar.terminate();
