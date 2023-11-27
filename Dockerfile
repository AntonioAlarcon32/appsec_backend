# Step 1: Use a Node.js base image
FROM node:20

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the application source code
COPY . .

# Step 6: Expose the port the app runs on
EXPOSE 3500

# Step 7: Define the command to run the app
CMD ["node", "index.js"]
