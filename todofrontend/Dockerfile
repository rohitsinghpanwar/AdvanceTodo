# Stage 1: Build the React/Vite app
FROM node:latest

# Set the working directory
WORKDIR /myapp

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy application code and build
COPY . .
EXPOSE 5173


CMD [ "npm", "run", "dev" ]
