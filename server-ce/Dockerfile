# ---------------------------------------------
# Overleaf Community Edition (overleaf/overleaf)
# ---------------------------------------------

ARG OVERLEAF_BASE_TAG=sharelatex/sharelatex-base:latest
FROM $OVERLEAF_BASE_TAG

WORKDIR /overleaf

# Add required source files
# -------------------------
ADD genScript.js /overleaf/genScript.js
ADD services.js /overleaf/services.js
ADD package.json package-lock.json /overleaf/
ADD libraries/ /overleaf/libraries/
ADD services/ /overleaf/services/
ADD tools/migrations/ /overleaf/tools/migrations/

# Add npm patches
# -----------------------
ADD ../patches/ /overleaf/patches

# Install npm dependencies and build webpack assets
# ------------------------
RUN --mount=type=cache,target=/root/.cache \
    --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/overleaf/services/web/node_modules/.cache,id=server-ce-webpack-cache \
    --mount=type=tmpfs,target=/tmp true \
&&  node genScript install | bash \
&&  node genScript compile | bash

# Copy runit service startup scripts to its location
# --------------------------------------------------
ADD runit /etc/service

# Copy runit global settings to its location
# ------------------------------------------
ADD config/env.sh /etc/overleaf/env.sh

# Configure nginx
# ---------------
ADD nginx/nginx.conf.template /etc/nginx/templates/nginx.conf.template
ADD nginx/overleaf.conf /etc/nginx/sites-enabled/overleaf.conf
ADD nginx/clsi-nginx.conf /etc/nginx/sites-enabled/clsi-nginx.conf


# Configure log rotation
# ----------------------
ADD logrotate/overleaf /etc/logrotate.d/overleaf
RUN chmod 644 /etc/logrotate.d/overleaf

# Configure cron tasks
# ----------------------
ADD cron /overleaf/cron
ADD config/crontab-history /etc/cron.d/crontab-history
RUN chmod 600 /etc/cron.d/crontab-history
ADD config/crontab-deletion /etc/cron.d/crontab-deletion
RUN chmod 600 /etc/cron.d/crontab-deletion

# Copy Phusion Image startup and shutdown scripts to their locations
# ------------------------------------------------------------------
COPY init_scripts/ /etc/my_init.d/
COPY init_preshutdown_scripts/ /etc/my_init.pre_shutdown.d/

# Copy app settings files
# -----------------------
COPY config/settings.js /etc/overleaf/settings.js

# Copy history-v1 files
# -----------------------
COPY config/production.json /overleaf/services/history-v1/config/production.json
COPY config/custom-environment-variables.json /overleaf/services/history-v1/config/custom-environment-variables.json

# Copy grunt thin wrapper
# -----------------------
ADD bin/grunt /usr/local/bin/grunt
RUN chmod +x /usr/local/bin/grunt

# Copy history helper scripts
# ---------------------------
ADD bin/flush-history-queues /overleaf/bin/flush-history-queues
RUN chmod +x /overleaf/bin/flush-history-queues
ADD bin/force-history-resyncs /overleaf/bin/force-history-resyncs
RUN chmod +x /overleaf/bin/force-history-resyncs

# Copy Latexmkrc
# -----------------------
COPY config/latexmkrc /usr/local/share/latexmk/LatexMk

# --- Custom persistent TeX Live setup ---
# Ensure texlive is installed and binaries available globally
RUN tlmgr install scheme-full && \
    tlmgr path add

# Make sure PATH includes TeX binaries permanently
ENV PATH="/usr/local/texlive/bin/x86_64-linux:$PATH"

# File that controls open|closed status of the site
# -------------------------------------------------
ENV SITE_MAINTENANCE_FILE="/etc/overleaf/site_status"
RUN touch $SITE_MAINTENANCE_FILE

# Set Environment Variables
# --------------------------------
ENV OVERLEAF_CONFIG=/etc/overleaf/settings.js

ENV WEB_API_USER="overleaf"
ENV ADMIN_PRIVILEGE_AVAILABLE="true"

ENV OVERLEAF_APP_NAME="Overleaf Community Edition"

ENV OPTIMISE_PDF="true"

# Phusion Image timeouts before sending SIGKILL to processes
# ----------------------------------------------------------
ENV KILL_PROCESS_TIMEOUT=55
ENV KILL_ALL_PROCESSES_TIMEOUT=55
ENV GRACEFUL_SHUTDOWN_DELAY_SECONDS=1

ENV NODE_ENV="production"
ENV LOG_LEVEL="info"


EXPOSE 80

ENTRYPOINT ["/sbin/my_init"]
