// 将中文字符串转换为拼音风格的 slug
function slugify(text) {
  // 如果有中文，使用时间戳+随机数生成 slug
  const hasChinese = /[一-龥]/.test(text);
  if (hasChinese) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${timestamp}${random}`;
  }
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// 分页助手
function paginate(page = 1, pageSize = 10) {
  const p = Math.max(1, parseInt(page) || 1);
  const size = Math.min(50, Math.max(1, parseInt(pageSize) || 10));
  return {
    offset: (p - 1) * size,
    limit: size,
    page: p,
    pageSize: size,
  };
}

// 生成分页响应
function paginatedResponse(data, total, page, pageSize) {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

module.exports = { slugify, paginate, paginatedResponse };
