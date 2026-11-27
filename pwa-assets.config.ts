import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: { ...minimal2023Preset, maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#07090a' } }, apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#07090a' } } },
  images: ['public/icon.svg'],
});
