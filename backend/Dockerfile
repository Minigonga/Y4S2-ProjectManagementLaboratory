# Use the official lightweight Node image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port your Express server will run on
EXPOSE 5000

# Command to start the development server
CMD ["npm", "run", "dev"]