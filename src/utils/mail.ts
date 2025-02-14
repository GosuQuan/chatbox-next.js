import nodemailer from 'nodemailer';
import { config } from './config';

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: 'smtp.163.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // 您的163邮箱账号
    pass: process.env.EMAIL_PASS  // 您的163邮箱授权码
  }
});

interface SendMailOptions {
  to: string;
  subject: string;
  token: string;
  type: 'reset' | 'verify' | 'code';
}

export async function sendEmail({ to, subject, token, type }: SendMailOptions) {
  let content = '';
  if (type === 'reset') {
    const url = `${config.appUrl}/auth/reset-password?token=${token}`;
    content = `请点击以下链接重置密码：<br><a href="${url}">${url}</a>`;
  } else if (type === 'verify') {
    const url = `${config.appUrl}/auth/verify-email?token=${token}`;
    content = `请点击以下链接验证您的邮箱：<br><a href="${url}">${url}</a>`;
  } else {
    content = `您的验证码是：<b>${token}</b><br>该验证码将在10分钟后过期`;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${type === 'code' ? '注册验证码' : type === 'reset' ? '密码重置请求' : '验证您的邮箱'}</h2>
        <p>您好，</p>
        ${type === 'code' 
          ? `<p>您的验证码是：</p>
             <p style="font-size: 24px; font-weight: bold; color: #007bff; text-align: center; padding: 20px;">${token}</p>
             <p>该验证码将在10分钟后过期。</p>`
          : type === 'reset'
            ? `<p>我们收到了您的密码重置请求。如果这不是您本人的操作，请忽略此邮件。</p>
              <p>点击下面的链接重置密码：</p>
              <p>
                <a href="${config.appUrl}/auth/reset-password?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                  重置密码
                </a>
              </p>
              <p>此链接将在24小时后失效。</p>
              <p>如果按钮无法点击，请复制以下链接到浏览器中：</p>
              <p>${config.appUrl}/auth/reset-password?token=${token}</p>`
            : `<p>感谢您注册我们的服务。请点击下面的链接验证您的邮箱地址。</p>
               <p>点击下面的链接验证邮箱：</p>
               <p>
                 <a href="${config.appUrl}/auth/verify-email?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                   验证邮箱
                 </a>
               </p>
               <p>此链接将在24小时后失效。</p>
               <p>如果按钮无法点击，请复制以下链接到浏览器中：</p>
               <p>${config.appUrl}/auth/verify-email?token=${token}</p>`
        }
        <p>祥您使用愉快！</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('发送邮件失败:', error);
    return { success: false, error };
  }
}
