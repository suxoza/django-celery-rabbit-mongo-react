# The first instruction is what image we want to base our container on
# We Use an official Python runtime as a parent image
FROM python:3.10

ENV PYTHONUNBUFFERED 1
COPY . /drf_src/
WORKDIR /drf_src
RUN pip install -r requirements.txt

# VOLUME /drf_src
# EXPOSE 8080
# CMD python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000
