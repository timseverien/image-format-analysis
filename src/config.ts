import { range } from 'lodash';
import * as path from 'node:path';
import type { CompressedImageFormat, ImageResolution } from './image';

export const DIR_ROOT = path.resolve(__dirname, '..');

export const DIR_DATA = path.resolve(DIR_ROOT, 'data');
export const DIR_IMAGES = path.resolve(DIR_DATA, 'images');
export const DIR_IMAGES_SOURCE = path.resolve(DIR_DATA, 'images-source');
export const DIR_RESULTS = path.resolve(DIR_DATA, 'results');

export const FILE_RESULT = path.resolve(DIR_DATA, 'results.json');

export const IMAGE_FORMAT_LIST: CompressedImageFormat[] = [
	'avif',
	'jpeg',
	'webp',
];

export const IMAGE_QUALITY_LIST = range(10, 101, 10);

export const IMAGE_RESOLUTION_LIST: ImageResolution[] = [[1024, 1024]];
