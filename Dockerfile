FROM ubuntu:14.04
ADD . /app
RUN /app/setup/provision.sh
COPY conf/supervisord.conf /etc/supervisor/conf.d/cast.conf
EXPOSE 80
CMD bash -C "/usr/bin/supervisord -c /etc/supervisor/conf.d/cast.conf";"bash"