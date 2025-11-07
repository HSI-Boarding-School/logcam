FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

EXPOSE 3000

# Run Next.js in production mode
CMD ["npm", "start", "--", "-p", "3000"]

