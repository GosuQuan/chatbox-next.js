import { message } from 'antd';
import { MessageType } from 'antd/es/message/interface';

interface ToastOptions {
  duration?: number;
  key?: string;
}

// 确保只在客户端运行
const isClient = typeof window !== 'undefined';

class Toast {
  static success(content: string, options?: ToastOptions) {
    if (!isClient) return;
    return message.success({
      content,
      duration: options?.duration || 2,
      key: options?.key,
      className: 'custom-toast success-toast',
    });
  }

  static error(content: string, options?: ToastOptions) {
    if (!isClient) return;
    return message.error({
      content,
      duration: options?.duration || 3,
      key: options?.key,
      className: 'custom-toast error-toast',
    });
  }

  static warning(content: string, options?: ToastOptions) {
    if (!isClient) return;
    return message.warning({
      content,
      duration: options?.duration || 3,
      key: options?.key,
      className: 'custom-toast warning-toast',
    });
  }

  static info(content: string, options?: ToastOptions) {
    if (!isClient) return;
    return message.info({
      content,
      duration: options?.duration || 2,
      key: options?.key,
      className: 'custom-toast info-toast',
    });
  }

  static loading(content: string, key: string) {
    if (!isClient) return;
    return message.loading({
      content,
      duration: 0,
      key,
      className: 'custom-toast loading-toast',
    });
  }

  static update(key: string, content: string, type: MessageType) {
    if (!isClient) return;
    message[type]({
      content,
      key,
      duration: 2,
      className: `custom-toast ${type}-toast`,
    });
  }

  static destroy(key?: string) {
    if (!isClient) return;
    message.destroy(key);
  }
}

export default Toast;
