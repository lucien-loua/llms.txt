FROM python:3.13.3-slim

WORKDIR /app

COPY requirements.txt ./
COPY app/ ./app/

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5001"]
