# Use the official Node.js image as the base image
FROM node:16.13-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Run Prisma migrations
RUN npx prisma migrate dev

# Run Prisma seed
RUN npm run prisma:seed

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:prod"]
