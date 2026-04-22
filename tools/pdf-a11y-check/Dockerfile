FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY check_pdf.py .

ENTRYPOINT ["python", "/app/check_pdf.py"]
