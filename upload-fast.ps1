# 创建临时目录
New-Item -ItemType Directory -Force -Path .\temp-deploy

# 复制必要文件
Copy-Item -Path @(
    ".\package.json",
    ".\package-lock.json",
    ".\next.config.js",
    ".\tsconfig.json",
    ".\Dockerfile",
    ".\docker-compose.yml",
    ".\nginx.conf",
    ".\prisma\*",
    ".\src\*",
    ".\public\*"
) -Destination .\temp-deploy -Recurse -Force

# 压缩文件
Compress-Archive -Path .\temp-deploy\* -DestinationPath chatbox-next.zip -Force

# 删除临时目录
Remove-Item -Path .\temp-deploy -Recurse -Force

# 上传到服务器
scp chatbox-next.zip root@47.98.105.87:/root/chatbox-next.zip

# 在服务器上执行部署命令
ssh root@47.98.105.87 "mkdir -p /root/chatbox-next && cd /root && unzip -o chatbox-next.zip -d chatbox-next && cd chatbox-next && docker compose down && docker system prune -f && docker compose up -d --build"

# 清理本地 zip 文件
Remove-Item -Path .\chatbox-next.zip -Force
