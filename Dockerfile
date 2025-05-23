# === Build stage ===
FROM node:18-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY app/package*.json ./

# ✅ Install build tools needed for bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN npm install

# Copy rest of the app
COPY app .

# Build the Next.js app
RUN npm run build

# === Production stage ===
FROM node:18-slim AS production

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/postcss.config.* ./
COPY --from=builder /app/tailwind.config.* ./

# Start the app
CMD ["npm", "start"]
