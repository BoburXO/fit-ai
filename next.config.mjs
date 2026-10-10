/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Kamera faqat shu sahifaning o'zida ishlaydi; boshqa saytlarga ruxsat yo'q.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=()" },
        ],
      },
    ];
  },
};
export default nextConfig;
