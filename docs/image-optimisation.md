# Image Optimisation Notes

- No local raster source images were present in the original frontend; imagery is embedded as remote `readdy.ai` URLs.
- `frontend/src/components/base/ResponsiveImage.tsx` generates responsive URL candidates by adjusting remote width/height query parameters.
- Critical hero images use eager loading and `fetchPriority="high"`.
- Below-the-fold images should use the default lazy behaviour.
- Django `media_library` is ready for locally managed images with Pillow-detected dimensions and optional WebP/AVIF fields.
- Brand assets, logos, icons and membership badges should remain SVG or high-resolution managed media to preserve sharpness.
