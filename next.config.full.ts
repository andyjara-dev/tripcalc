import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Do NOT use standalone output with next-intl
  // It causes issues with runtime file access
};

export default withNextIntl(nextConfig);
