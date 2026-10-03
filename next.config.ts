import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/play", destination: "/arcade/refract", permanent: true },
      { source: "/:area(salesforce|backend|frontend|fullstack|mobile)", destination: "/", permanent: true },
      { source: "/work/atmos", destination: "/#recognition", permanent: true },
      { source: "/work/tatkal-helper", destination: "/work/irctc-ticket-helper", permanent: true },
      { source: "/work/field-sales", destination: "/work/dealermatix-dms", permanent: true },
      { source: "/work/workflow-suite", destination: "/work/xmatix", permanent: true },
      { source: "/work/retail-automation", destination: "/#experience", permanent: true },
      { source: "/work/interview-bot", destination: "/#more", permanent: true },
      { source: "/story", destination: "/", permanent: false },
      { source: "/immersive", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
