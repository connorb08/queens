FROM oven/bun:latest

RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd -r user && useradd -r -g user -G audio,video -m -d /home/user user && \
    mkdir -p /home/user/.cache/puppeteer && chown -R user:user /home/user

ENV DOCKER_ENV=true
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
ENV PUPPETEER_CACHE_DIR="/home/user/.cache/puppeteer"

WORKDIR /app

COPY package.json .

RUN bun install --production --ignore-scripts

COPY ./src .

USER user

EXPOSE 8080

CMD ["bun", "run", "server.ts"]
