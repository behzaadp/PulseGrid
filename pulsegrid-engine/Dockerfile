# Use the official lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies (none for now, but good practice)
COPY package.json ./
RUN npm install

# Copy the server code
COPY . .

# Expose the port your app runs on
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]