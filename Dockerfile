FROM oven/bun:1

WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN bunx -y playwright@1.42.1 install chromium --with-deps

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

COPY . .

ENTRYPOINT ["bun", "start"]
