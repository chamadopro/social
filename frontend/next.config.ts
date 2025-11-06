import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '3001',
          pathname: '/uploads/**',
        },
        {
          protocol: 'http',
          hostname: '192.168.15.9',
          port: '3001',
          pathname: '/uploads/**',
        },
        {
          protocol: 'http',
          hostname: '192.168.15.5',
          port: '3001',
          pathname: '/uploads/**',
        },
      {
        protocol: 'https',
        hostname: 'chamadopro-uploads.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  // Permitir requisições cross-origin do IP da rede local durante desenvolvimento
  // Necessário para testar no celular acessando pelo IP do computador
  // Nota: allowedDevOrigins aceita apenas strings, não regexes
  allowedDevOrigins: process.env.NODE_ENV === 'development' 
    ? [
        'http://192.168.15.9:3000',
        'http://192.168.15.5:3000',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        // Adicione outros IPs aqui se necessário
        // Exemplo: 'http://192.168.1.100:3000',
      ]
    : [],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/:path*`,
      },
    ];
  },
};

export default nextConfig;