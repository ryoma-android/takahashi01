/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',           // サービスワーカーやmanifestの出力先
  register: true,           // サービスワーカーの自動登録
  skipWaiting: true,        // 新しいSWが有効化されたら即時反映
  // 静的エクスポート時の注意: next/imageを使う場合はunoptimized: trueを推奨
  // images: { unoptimized: true }
});

const isExport = process.env.NEXT_PHASE === 'phase-export';

const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: isExport,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // クライアントサイドでNode.js固有のモジュールを無視
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
      
      // WebSocket関連のネイティブモジュールを無視
      config.resolve.alias = {
        ...config.resolve.alias,
        'bufferutil': false,
        'utf-8-validate': false,
      };
    }
    return config;
  },
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
