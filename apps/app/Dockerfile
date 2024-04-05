FROM oven/bun:1

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package.json ./
RUN bun install
RUN rm -rdf node_modules
RUN bun install --production

RUN bunx -y playwright install chromium --with-deps

COPY . .

ENTRYPOINT ["bun", "start"]
