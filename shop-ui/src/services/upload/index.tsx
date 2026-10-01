import request from '@/utils/request';

/**
 * Upload a file.
 *
 * POST /admin/common/upload
 */
export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return request<string>('/admin/common/upload', {
    method: 'POST',
    data: formData,
  });
}
