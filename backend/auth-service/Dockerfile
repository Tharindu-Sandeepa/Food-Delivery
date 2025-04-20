# Use a Node base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install deps inside container
RUN npm install

# Now copy the rest of the app
COPY . .
EXPOSE 3005
CMD ["npm", "start"]