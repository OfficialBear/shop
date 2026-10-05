import { redirectToLogin } from './request';

interface DownloadOptions {
  /** 查询参数 */
  params?: Record<string, string | number | undefined>;
  /** 无法从响应头解析文件名时的兜底名 */
  fallbackFileName: string;
}

const XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * 解析 Content-Disposition 中的文件名（兼容 filename* 与 filename）。
 */
function parseFileName(disposition: string | null): string | undefined {
  if (!disposition) {
    return undefined;
  }
  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(disposition);
  if (star?.[1]) {
    const raw = star[1].replace(/^"|"$/g, '');
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain?.[1];
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data.msg === 'string' && data.msg) {
      return data.msg;
    }
  } catch {
    // 非 JSON
  }
  return `导出失败 (${response.status})`;
}

/**
 * 下载文件（走全局 `/api` 前缀）。
 *
 * 不能复用全局 `request`：它会把响应按 Result JSON 解包，拿不到二进制。
 * 因此这里用 fetch + blob，并识别 JSON 错误响应。
 */
export async function downloadFile(
  path: string,
  options: DownloadOptions,
): Promise<void> {
  const query = new URLSearchParams();
  Object.entries(options.params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  const url = `/api${path}${qs ? `?${qs}` : ''}`;

  const response = await fetch(url, { credentials: 'same-origin' });

  if (response.status === 401) {
    redirectToLogin();
    throw new Error('登录已过期，请重新登录');
  }

  const contentType = response.headers.get('Content-Type') ?? '';
  if (!response.ok || contentType.includes('application/json')) {
    throw new Error(await readErrorMessage(response));
  }

  const blob = await response.blob();
  const fileName =
    parseFileName(response.headers.get('Content-Disposition')) ??
    options.fallbackFileName;

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
