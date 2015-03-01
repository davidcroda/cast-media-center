FROM ubuntu:14.04
ADD . /app
RUN /app/setup/provision.sh
EXPOSE 80
CMD bash -C "/usr/bin/supervisord -c /etc/supervisor/supervisord.conf";"bash"