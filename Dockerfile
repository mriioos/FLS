# Get if production or development version should be built
ARG APP_VERSION='development'

# Specify the base image
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3001/tcp

# Re-declare ARG before using in ENV
ARG APP_VERSION

# Set environment variables
ENV NODE_ENV=${APP_VERSION}
#ENV NODE_ENV=production

# Define the command to run your app
ENTRYPOINT ["node", "app.js"]