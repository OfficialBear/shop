import request from '@/utils/request';

/**
 * Upload a file.
 *
 * POST /api/admin/common/upload
 */
export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return request<string>('/api/admin/common/upload', {
    method: 'POST',
    data: formData,
  });
}
