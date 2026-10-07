# ---------- Frontend build ----------
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend ./

RUN npm run build


# ---------- Final application ----------
FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/

RUN npm install --prefix backend --omit=dev

COPY backend ./backend

COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 5000

ENV PORT=5000

CMD ["node", "backend/server.js"]
