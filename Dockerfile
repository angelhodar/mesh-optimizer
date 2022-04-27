FROM nytimes/blender:3.1-cpu-ubuntu18.04

# Install Node
RUN apt-get update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y g++ make cmake unzip libcurl4-openssl-dev tar gzip autoconf automake libtool

ARG FUNCTION_DIR="/function"
RUN mkdir -p ${FUNCTION_DIR}

COPY package*.json ${FUNCTION_DIR}
WORKDIR ${FUNCTION_DIR}

RUN npm install
RUN npm install aws-lambda-ric

COPY . .

# Download and run chmod
ADD aws-lambda-rie /usr/local/bin/aws-lambda-rie
ADD scripts/entry_script.sh /entry_script.sh

ENTRYPOINT ["/entry_script.sh"]

CMD ["app.handler"]