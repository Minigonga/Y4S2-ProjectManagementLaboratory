# Use the official lightweight Node image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start the Vite dev server and expose it to the Docker network
CMD ["npm", "run", "dev", "--", "--host"]