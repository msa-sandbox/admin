######    Dev Stage (Hot Reload with Vite)   ######
FROM node:20-alpine AS dev
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Keep node_modules isolated inside container
VOLUME [ "/app/node_modules" ]

# Copy project sources
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run development server (HMR enabled)
CMD ["npm", "run", "dev"]



######    Build Stage (Production Build)   ######
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy sources and build for production
COPY . .
RUN npm run build



######   Nginx Stage (Serve Static Files)   ######
FROM nginx:alpine AS nginx
WORKDIR /usr/share/nginx/html

# Copy build artifacts from previous stage
COPY --from=build /app/dist .

# Custom nginx config for SPA (important for Vue Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
