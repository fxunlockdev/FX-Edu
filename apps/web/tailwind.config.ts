import type { Config } from 'tailwindcss';
import luminaPreset from '@fxunlock/ui/tailwind-preset';

const config: Config = {
  presets: [luminaPreset],
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    // Pick up Lumina classes used inside the design-system package.
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
