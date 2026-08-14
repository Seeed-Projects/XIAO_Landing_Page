/** @type {import('next').NextConfig} */
const nextConfig = {
  /* esptool-js 未声明 type:module 但源码为 ESM，需显式转译以供浏览器打包 */
  transpilePackages: ["esptool-js"],
};

export default nextConfig;
