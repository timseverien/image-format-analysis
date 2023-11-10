import fs, { ensureDir } from 'fs-extra';
import * as path from 'node:path';
import ProgressBar from 'progress';
import sharp from 'sharp';
import {
	DIR_IMAGES,
	DIR_IMAGES_SOURCE,
	IMAGE_FORMAT_LIST,
	IMAGE_QUALITY_LIST,
	IMAGE_RESOLUTION_LIST,
} from '../config';
import {
	createCompressedImageFileInfo,
	createSourceImageFileInfo,
} from '../image';

const imageFiles = await fs.readdir(DIR_IMAGES_SOURCE);

const bar = new ProgressBar(
	'converting [:bar] :current/:total (:percent) :etas',
	{
		total:
			IMAGE_FORMAT_LIST.length *
			IMAGE_RESOLUTION_LIST.length *
			IMAGE_QUALITY_LIST.length *
			imageFiles.length,
	}
);

await ensureDir(DIR_IMAGES);

for (const imageFileName of imageFiles) {
	const imageFilePath = path.resolve(DIR_IMAGES_SOURCE, imageFileName);

	const image = sharp(imageFilePath).png({
		quality: 100,
	});

	for (const resolution of IMAGE_RESOLUTION_LIST) {
		const sourceImageFile = createSourceImageFileInfo({
			resolution,
			fileSize: 0,
			format: 'png',
			name: path.basename(imageFileName, path.extname(imageFileName)),
		});
		const sourceImageFilePath = path.resolve(
			DIR_IMAGES,
			sourceImageFile.fileName
		);

		image.resize({
			height: resolution[1],
			width: resolution[0],
		});

		if (!(await fs.pathExists(sourceImageFilePath))) {
			// Save source image
			await image.toFile(sourceImageFilePath);
		}

		// Save converted images
		for (const format of IMAGE_FORMAT_LIST) {
			for (const quality of IMAGE_QUALITY_LIST) {
				const compressedImageFile = createCompressedImageFileInfo({
					format,
					quality,
					resolution,
					fileSize: 0,
					name: sourceImageFile.name,
				});
				const compressedImageFilePath = path.resolve(
					DIR_IMAGES,
					compressedImageFile.fileName
				);

				if (!(await fs.pathExists(compressedImageFilePath))) {
					await image
						.toFormat(format, {
							quality: quality,
						})
						.toFile(compressedImageFilePath);
				}

				bar.tick();
			}
		}
	}
}

bar.terminate();
