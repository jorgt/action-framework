FROM postgres:17

# Install dependencies and TimescaleDB
RUN apt-get update && apt-get install -y \
  gnupg2 wget build-essential postgresql-server-dev-17 cmake git \
  && wget https://github.com/timescale/timescaledb/archive/refs/tags/2.17.2.tar.gz -O timescaledb.tar.gz \
  && tar -xzf timescaledb.tar.gz && cd timescaledb-2.17.2 \
  && ./bootstrap && cd build && make && make install \
  && cd / && rm -rf timescaledb.tar.gz timescaledb-2.17.2

# Install pgvector
RUN git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git \
  && cd pgvector \
  && make \
  && make install \
  && cd / && rm -rf pgvector

# Clean up build dependencies
RUN apt-get remove -y build-essential cmake postgresql-server-dev-17 git \
  && apt-get autoremove -y && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Configure PostgreSQL to load TimescaleDB
RUN echo "shared_preload_libraries='timescaledb'" >> /usr/share/postgresql/postgresql.conf.sample

# Create initialization script directory
RUN mkdir -p /docker-entrypoint-initdb.d
COPY ./init.sql /docker-entrypoint-initdb.d/

CMD ["postgres"]
