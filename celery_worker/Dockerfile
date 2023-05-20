FROM python:3.10-slim

COPY requirements.txt /
RUN pip install -r /requirements.txt
ADD . /celery_worker
WORKDIR /celery_worker

ENTRYPOINT celery -A tasks worker --loglevel=info --without-gossip --without-mingle