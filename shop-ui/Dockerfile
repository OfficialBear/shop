# 构建前：pnpm install --frozen-lockfile --config.strict-dep-builds=false && pnpm build
FROM nginx:1.27-alpine

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]