FROM node:18-alpine

WORKDIR /app

# 安装依赖（利用缓存）
COPY package.json .
COPY server/package*.json server/
RUN cd server && npm install

COPY client/package*.json client/
RUN cd client && npm install

# 复制所有源码
COPY . .

# 构建前端
RUN cd client && npm run build

EXPOSE 10000

CMD ["node", "server/src/index.js"]
