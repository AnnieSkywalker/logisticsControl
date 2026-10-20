FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p data uploads && chmod +x entrypoint.sh

EXPOSE 3001

CMD ["./entrypoint.sh"]
