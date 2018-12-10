# first, cat this file from shared/goss into whatever directory within which we are building our image
COPY goss-entrypoint.sh /

RUN sudo chmod +x /goss-entrypoint.sh

ENTRYPOINT ["/goss-entrypoint.sh"]
