import { resolveResource } from '@tauri-apps/api/path';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import { save } from '@tauri-apps/plugin-dialog';
import { message, Space, Typography } from 'antd';
import { ModalFunc } from 'antd/es/modal/confirm';
import { invoke } from '@tauri-apps/api/core';
const { Text, Link } = Typography;
const iFile = {
  Window: <Link>通过名称为 <Text code>_启动窗口</Text> 的窗口启动</Link>,
  Window_main: <Link>通过名称为 <Text code>_启动子程序</Text> 的子程序启动</Link>,
} as const;

/**
 * 保存 E_dev 目录下指定文件列表中的某个文件：
 * - names: 例如 ['foo', 'bar']，对应资源里 E_dev/foo.e, E_dev/bar.e
 */

export function saveEFiles(names: string[], confirm: ModalFunc,eFiles:string) {
  (async () => {
    if (names.length === 0) {
      message.error('未指定要保存的文件');
      return;
    }

    // 1. 选择要保存的文件名
    let chosen: string | null = null;
    if (names.length === 1) {
      chosen = names[0];
    } else {
      chosen = await new Promise<string | null>((resolve) => {
        confirm({
          title: '选择要创建的项目类型',
          content: (
            <Space direction="vertical" >
              {names.map((n: string) => (
                <div key={n} onClick={() => resolve(n)}>
                  {iFile[n as keyof typeof iFile]}
                </div>
              ))}
            </Space>
          ),
          onCancel: () => resolve(null),
          okButtonProps: { style: { display: 'none' } }, // 隐藏默认 OK 按钮,
          cancelText: '取消',
        });
      });
    }
    if (!chosen) {
      return;
    }

    try {
      // 2. 获取资源目录下 E_dev/<chosen>.e 的绝对路径
      // 方法 A: 使用 resolveResource
      // 注意：resolveResource 接收相对资源路径，如 'E_dev/foo.e'
      const resourcePath = await resolveResource(`E_dev/${chosen}.e`);
      // resolveResource 返回可能是字符串或 null，若不存在则返回 null
      if (!resourcePath) {
        throw new Error(`资源不存在: E_dev/${chosen}.e`);
      }

      // 3. 读取二进制内容
      // 这里 readFile 接受完整绝对路径字符串时，可不传 baseDir
      // 但若插件要求 options，某些版本可直接：
      const data = await readFile(resourcePath);
      // 如果版本不支持直接传绝对路径，可使用 path API 拼 baseDir
      // 但通常 readFile(absolutePath) 可行。

      // 4. 弹出系统“另存为”对话框
      const dest = await save({
        title: '保存 E 文件',
        defaultPath: `${chosen}.e`,
        filters: [{ name: 'E 文件', extensions: ['e'] }],
      });
      if (!dest) {
        message.info('已取消创建');
        return;
      }

      // 5. 写入目标路径
      // writeFile 接受绝对路径，也可直接：await writeFile(dest, data);
      await writeFile(dest, data);
      message.success(`已保存到：${dest}`);
      invoke('open_exe', { exePath: eFiles, args: [dest] })
    } catch (err: any) {
      console.error(err);
      message.error('保存失败：' + (err?.message || err));
    }
  })();
}
