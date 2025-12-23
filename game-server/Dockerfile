FROM node:20-alpine

WORKDIR /app

# Copy only dependency files first (better caching)
COPY package.json package-lock.json* yarn.lock* ./

RUN npm install

# Copy the rest of the source
COPY . .

EXPOSE 6767

CMD ["npm", "run", "dev"]
