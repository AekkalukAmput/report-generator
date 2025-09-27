const target = process.env.API_TARGET ?? "http://127.0.0.1:3001";
/** @type {import('http-proxy-middleware').Options | import('http-proxy-middleware').Options[]} */
export default [
  {
    context: ["/api"],
    target: "http://127.0.0.1:3001",
    secure: false,
    changeOrigin: true,
    logLevel: "debug",
    ws: true,
    // ตัด prefix /api ออกก่อนส่งไปยังปลายทาง
    pathRewrite: { "^/api": "" },
    // ถ้าใช้คุกกี้/withCredentials ให้กำหนด header เพิ่มได้ใน onProxyReq
    // onProxyReq(proxyReq, req, res) { }
  },
];
