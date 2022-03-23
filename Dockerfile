FROM nytimes/blender:3.1-cpu-ubuntu18.04

# Install Node
RUN apt-get update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs

ENV NODE_ENV production

# Prepare directory structure
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json .
RUN npm ci --only=production --ignore-scripts

# Move code
COPY . .

CMD ["node", "index.js"]