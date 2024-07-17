import Koa from "koa";
import serve from "koa-static";
import http2 from "node:http2";
import { createRequestHandler } from "remix-koa-adapter";
import * as build from "../build/index.js";

const { PORT, USE_HTTP2_NO_TLS } = process.env;
const app = new Koa();

app.use(serve("public"));

app.use(
  createRequestHandler({
    build,
  })
);

if (USE_HTTP2_NO_TLS) {
  console.log("Using HTTP2 without TLS");
}
const server = USE_HTTP2_NO_TLS ? http2.createServer(app.callback()) : app;

server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
  // ... code to run after your server is running goes here ...
});
