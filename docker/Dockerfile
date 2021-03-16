FROM hayd/alpine-deno:1.8.1
EXPOSE 1993
WORKDIR /app
USER deno
COPY example.js .
RUN deno cache example.js
ADD . .
RUN deno cache example.js
CMD ["run", "-A", "--unstable", "example.js"]
