# Dev-mode image: runs the Vite dev server with HMR, source mounted as a volume by
# docker-compose. A separate multi-stage production Dockerfile (nginx-served static
# build) gets added in the Deployment phase — premature to build that before we have
# anything worth deploying.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
