FROM node:18-alpine

WORKDIR /app

# 复制 root package.json
COPY package.json .

# 安装服务器依赖
COPY server/package*.json server/
RUN cd server && npm install

# 安装客户端依赖 + 构建
COPY client/package*.json client/
RUN cd client && npm install && npm run build

# 复制源码（不含 node_modules）
COPY . .

EXPOSE 10000

CMD ["node", "server/src/index.js"]
