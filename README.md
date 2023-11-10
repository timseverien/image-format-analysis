# Image format analysis

This repository contains code to download, convert, and analyze for my blog post about AVIF.

## Usage

- Run `npm install` to install dependencies
- Run `npm run download` to download images from Unsplash
- Run `npm run convert` to convert downloaded images to AVIF, JPEG, and WebP images
- Run `npm run analyze` to analyze the converted images

The results will be saved in `data/results.json`, containing image names, their file sizes, and scores for mean squared error, peak signal-to-noise ratio, and structural similarity index measure.

```json
{
	"source": {
		"0-1024x1024.png": { "size": 12345 },
		"1-1024x1024.png": { "size": 12345 }
	},
	"compressed": {
		"0-1024x1024-0.avif": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 },
		"0-1024x1024-0.jpeg": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 },
		"0-1024x1024-0.webp": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 },
		"0-1024x1024-100.avif": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 },
		"0-1024x1024-100.jpeg": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 },
		"0-1024x1024-100.webp": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 },
		"1-1024x1024-0.avif": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 },
		"1-1024x1024-0.jpeg": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 },
		"1-1024x1024-0.webp": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 },
		"1-1024x1024-100.avif": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 },
		"1-1024x1024-100.jpeg": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 },
		"1-1024x1024-100.webp": { "size": 1234, "mse": 1, "psnr": 2, "ssim": 3 }
	}
}
```

To obtain the file name, resolution, quality setting, and format, please parse the file name.

Source images use the format `[name]-[resolution].png`. Compressed images use the format `[name]-[resolution]-[quality].[format]`.

## Using your own images

- Place your images in the `data/images-source` directory. Try to use source or high-quality material. Using source images that already have compression artifacts may skew results.
- (Optional) Make changes to `src/scripts/config.ts` to modify image formats, resolutions, and image quality settings.
- Run `npm run convert`
- Run `npm run analyze`
