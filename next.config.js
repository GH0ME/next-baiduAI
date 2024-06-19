/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },

  // async redirects(){
    //返回重定向
    // return [
    //   {
        //source: '/about-us', //被重定向的地址
        //destination: '/about', //重定向到的地址
        //permanent: true //是否是 永久重定向
    //   },
    // ]
  // }
}

module.exports = nextConfig
