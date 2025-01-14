# 使用 scp 上传文件，排除不需要的目录
scp -r `
    ./src `
    ./prisma `
    ./public `
    ./package.json `
    ./package-lock.json `
    ./next.config.ts `
    ./tsconfig.json `
    ./docker-compose.yml `
    ./Dockerfile `
    ./nginx.conf `
    ./deploy.sh `
    root@47.96.60.217:/root/chatbox-next/

# 使用 ssh 执行远程命令
ssh root@47.96.60.217 "cd /root/chatbox-next && chmod +x deploy.sh && ./deploy.sh"
