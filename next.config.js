/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',           // サービスワーカーやmanifestの出力先
  register: true,           // サービスワーカーの自動登録
  skipWaiting: true,        // 新しいSWが有効化されたら即時反映
  cleanupOutdatedCaches: true,
  disable: process.env.NODE_ENV === 'development',
  // ChunkLoadError対策: より積極的なキャッシュクリア
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 1週間
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24, // 1日
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24, // 1日
        },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'static-js-assets',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24, // 1日
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24, // 1日
        },
      },
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24, // 1日
        },
      },
    },
    {
      urlPattern: ({ url }) => {
        return url.origin === self.location.origin && url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/auth/');
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 60 * 60 * 24, // 1日
        },
      },
    },
    {
      urlPattern: ({ url }) => {
        return url.origin === self.location.origin && !url.pathname.startsWith('/api/');
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24, // 1日
        },
      },
    },
  ],
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
  assetPrefix: process.env.NEXT_PUBLIC_APP_URL || '/', // 環境変数がない場合はルートパスにフォールバック
  webpack: (config, { isServer, dev }) => {
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
        encoding: false,
      };
      
      // WebSocket関連のネイティブモジュールを無視
      config.resolve.alias = {
        ...config.resolve.alias,
        'bufferutil': false,
        'utf-8-validate': false,
      };

      // ChunkLoadError対策: より積極的なキャッシュクリア
      if (!dev) {
        config.output.chunkFilename = 'static/chunks/[name].[chunkhash].js';
        config.output.filename = 'static/js/[name].[chunkhash].js';
        
        // チャンクローディングのリトライ機能を追加
        config.optimization.splitChunks = {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        };
      }
    }
    return config;
  },
  reactStrictMode: true,
  // より積極的なキャッシュクリア
  generateEtags: false,
  compress: true,
  poweredByHeader: false,
  // CSS最適化を無効にしてcrittersエラーを回避
  // swcMinify: false,
  // より強力なキャッシュ無効化
  headers: async () => {
    return [
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/js/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
