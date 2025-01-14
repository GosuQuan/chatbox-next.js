# 压缩项目文件
Compress-Archive -Path * -DestinationPath chatbox-next.zip -Force

# 使用 scp 上传到服务器
scp chatbox-next.zip root@47.98.105.87:/root/chatbox-next.zip

# 使用 ssh 执行远程命令
ssh root@47.98.105.87 "
mkdir -p /root/chatbox-next
cd /root
unzip -o chatbox-next.zip -d chatbox-next
cd chatbox-next
chmod +x deploy.sh
./deploy.sh
"
