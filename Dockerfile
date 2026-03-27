# Use a lightweight Node image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Step 1: Reach INTO the server folder to get the dependencies
COPY server/package*.json ./

# Step 2: Install them (using --omit=dev as recommended by the latest npm)
RUN npm install --omit=dev

# Step 3: Copy all the backend code from the server folder
COPY server/ .

# Step 4: Open the port
EXPOSE 3001

# Step 5: Start the engine
CMD ["node", "server.js"]