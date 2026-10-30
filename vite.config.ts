import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import {vanillaExtractPlugin} from '@vanilla-extract/vite-plugin';
export default defineConfig({plugins:[vanillaExtractPlugin(),react()],server:{watch:{ignored:['**/screenshots/**','**/docs/**','**/vendor/**']}},test:{include:['src/**/*.test.{js,ts}']}});
