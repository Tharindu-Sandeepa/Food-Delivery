FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy ALL files (including src/utils)
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

EXPOSE 3000

CMD ["npm", "start"]