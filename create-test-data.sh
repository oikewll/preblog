#!/bin/bash

echo "创建测试数据..."

# 1. 先登录获取token
echo "1. 登录管理员账户..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

echo "登录响应: $LOGIN_RESPONSE"

# 检查是否登录成功
if echo "$LOGIN_RESPONSE" | grep -q "success"; then
  echo "✅ 登录成功！"
  echo ""
  echo "请使用以下凭证登录管理后台："
  echo "邮箱: admin@example.com"
  echo "密码: admin123"
  echo ""
  echo "访问管理后台: http://localhost:3000/admin"
else
  echo "❌ 登录失败，需要先创建管理员用户"
  echo ""
  echo "数据库中还没有用户。"
  echo "请先运行数据库迁移和种子脚本。"
fi

echo ""
echo "测试脚本完成！"
