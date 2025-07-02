const { createHash } = require("crypto");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");

const { delay } = require("./utils");

// total number of steps in this demo
const MAX_STEP = 7;

/** start: configure fastify **/
const fastify = require("fastify")({
  logger: false,
});

Handlebars.registerHelper(require("./helpers.js"));

fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: Handlebars,
  },
  layout: "/src/partials/layout.hbs",
  options: {
    partials: {
      nav: "/src/partials/nav.hbs",
      footer: "/src/partials/footer.hbs",
      heading: "/src/partials/heading.hbs",
    },        
  },
  defaultContext: {
    maxStep: MAX_STEP
  }
});
/** end: configure fastly **/

/** start: routes **/

// replaced @fastify/static with a custom get handler which delays the response by N milliseconds
fastify.get("/:file(.+).:ext(css|js)", async function (request, reply) {
  await delay(request.query["delay"] || 0);
  const content = fs.readFileSync(
    `./public/${request.params["file"]}.${request.params["ext"]}`,
    "utf-8"
  );

  switch (request.params["ext"]) {
    case "css":
      reply.type("text/css");
      break;
    case "js":
      reply.type("text/javascript");
      break;
    default:
      reply.type("text/plain");
  }

  return content;
});


// redirect URLs according to Accept header
fastify.register(require("@fastify/reply-from"));

fastify.get("/images-accept/*", function (request, reply) {
  const { url } = request;
  const filename = path.parse(url).name;

  if (request.headers.accept) {
    if (request.headers.accept.includes("image/avif")) {
      return reply.from(
        `https://cdn.glitch.global/97616b87-f930-4eb0-a8a0-84c6a73d97e7/${filename}.avif`
      );
    } else if (request.headers.accept.includes("image/webp")) {
      return reply.from(
        `https://cdn.glitch.global/97616b87-f930-4eb0-a8a0-84c6a73d97e7/${filename}.webp`
      );
    }
  }

  return reply.from(
    `https://cdn.glitch.global/97616b87-f930-4eb0-a8a0-84c6a73d97e7/${filename}.jpg`
  );
});

// welcome route
fastify.get("/", function (request, reply) {
  let params = {
    title: "Learn Performance - Video",
  };

  reply.view("/src/pages/index.hbs", params);

  return reply;
});

/** start: demo routes **/
fastify.get("/1", function (request, reply) {
  let params = {
    step: 1,
    title: "The video element",
  };

  reply.view("/src/pages/1.hbs", params);

  return reply;
});

fastify.get("/2", function (request, reply) {
  let params = {
    step: 2,
    title: "preload"
  };

  reply.view("/src/pages/2.hbs", params);

  return reply;
});

fastify.get("/3", function (request, reply) {
  let params = {
    step: 3,
    title: "autoplay"
  };

  reply.view("/src/pages/3.hbs", params);

  return reply;
});

fastify.get("/4", function (request, reply) {
  let params = {
    step: 4,
    title: "GIF replacement"
  };

  reply.view("/src/pages/4.hbs", params);

  return reply;
});

fastify.get("/5", function (request, reply) {
  let params = {
    step: 5,
    title: "YouTube embed"
  };

  reply.view("/src/pages/5.hbs", params);

  return reply;
});

fastify.get("/6", function (request, reply) {
  let params = {
    step: 6,
    title: "lite-youtube-embed",
    head: `<link rel="stylesheet" href="/lite-yt-embed.css">
<script src="/lite-yt-embed.js"></script>`
  };

  reply.view("/src/pages/6.hbs", params);

  return reply;
});

fastify.get("/7", function (request, reply) {
  let params = {
    step: 7,
    title: "fetchpriority on poster image",
    head: `<script src="/script.js?delay=300"></script>`
  };

  reply.view("/src/pages/7.hbs", params);

  return reply;
});

/** end: routes **/

// start the fastify server
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
    fastify.log.info(`server listening on ${address}`);
  }
);
