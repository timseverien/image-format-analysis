import { range } from 'lodash';
import * as path from 'node:path';
import type { ConvertedImageFormat, ImageResolution } from './image';

export const DIR_ROOT = path.resolve(__dirname, '..');
export const DIR_DATA = path.resolve(DIR_ROOT, 'data');
export const DIR_IMAGES = path.resolve(DIR_DATA, 'images');
export const DIR_RESULTS = path.resolve(DIR_DATA, 'results');

export const IMAGE_FORMAT_LIST: ConvertedImageFormat[] = [
	'avif',
	'jpeg',
	'webp',
];

export const IMAGE_QUALITY_LIST = range(10, 100, 10);

export const IMAGE_RESOLUTION_LIST: ImageResolution[] = [[1024, 1024]];
