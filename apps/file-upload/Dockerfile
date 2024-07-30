FROM node:18

# Set the working directory inside the Docker container
WORKDIR /app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install the app's dependencies
RUN npm install

# Copy the rest of the application code into the working directory
COPY . .

# Expose port 3000 to be accessible from outside the Docker container
EXPOSE 3000

# Define the command to run the application
CMD ["node", "server.js"]
