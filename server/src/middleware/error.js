// 全局错误处理中间件
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: '请求体 JSON 格式错误' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: '文件大小超过限制(5MB)' });
  }

  res.status(err.status || 500).json({
    message: err.message || '服务器内部错误',
  });
}

// 404 处理
function notFound(req, res) {
  res.status(404).json({ message: '接口不存在' });
}

module.exports = { errorHandler, notFound };
