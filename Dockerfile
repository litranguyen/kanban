FROM node:20-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package.json ./
COPY frontend/ /frontend
RUN npm install
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
RUN python -m pip install --no-cache-dir fastapi uvicorn[standard] httpx python-dotenv
COPY backend /app
COPY --from=frontend-builder /frontend/out /app/frontend_build
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
