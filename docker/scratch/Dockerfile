# syntax=docker/dockerfile:1
FROM denoland/deno:alpine
WORKDIR /app/
COPY app.ts .
RUN /bin/deno bundle app.ts > app.js

FROM denoland/deno:distroless
WORKDIR /app/
COPY --from=0 /app/app.js .
CMD ["run", "-A", "--unstable", "./app.js"]  