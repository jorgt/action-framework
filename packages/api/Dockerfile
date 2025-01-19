# Use the official Node.js image
FROM node:22.1.0-alpine3.19 as build
WORKDIR /app

# Install build tools for native dependencies
# RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Production stage
FROM node:22.1.0-alpine3.19 as prod
WORKDIR /app

# Copy the built application from the build stage
COPY --from=build /app .

# Remove build tools and unnecessary files to reduce image size
RUN npm prune --production

# Expose the port Fastify uses
EXPOSE 5001

# Start the application
CMD ["node", "src/index.js"]
