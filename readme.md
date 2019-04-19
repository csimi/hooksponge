[![image version](https://images.microbadger.com/badges/version/csimi/hooksponge.svg)](https://hub.docker.com/r/csimi/hooksponge)

# About

HookSponge was created for inspecting webhook triggers.
There are countless ways to inspect incoming webhooks as development for this is more common than sending/triggering webhooks.
When triggering webhooks you are not in control of the URI, so tools designed for multi-tenant environments like Webhook.site or RequestBin just don't work.

HookSponge soaks up every HTTP or HTTPS (with a self-signed cert) request except for "/" and its own assets.

# Requirements

- docker-compose file version 2+
- redis 5+ for storage

# Usage

Add a hooksponge container into your docker-compose file while aliasing the hosts of external servers in your network configuration.
```
  hooksponge:
    image: csimi/hooksponge
    depends_on:
      - redis
    ports:
      - "3000:3000"
    networks:
      my-network:
        aliases:
          - api.example.com
          - webhook.example.com
    environment:
      - BIND_HOST=0.0.0.0
      - BIND_PORT=3000
      - REDIS_KEY=hooksponge
      - REDIS_HOST=redis
      - REDIS_PORT=6379
```

# Configuration

You can change the settings using environment variables.

## BIND_HOST

Type: `String`

Default: `0.0.0.0`

The ip or hostname to bind to.

## BIND_PORT

Type: `Integer`

Default: `3000`

The port to bind to.
There is an additional requirement to bind to 80 and 443 in order to intercept requests.

## REDIS_KEY

Type: `String`

Default: `hooksponge`

The redis stream's key.

## REDIS_HOST

Type: `String`

Default: none

The redis server's ip or hostname.

## REDIS_PORT

Type: `Integer`

Default: `6379`

The redis server's port.

# TODO:

- [x] Automatic updater
- [x] Desktop notifications
- [ ] Delete/purge events
- [ ] Inline documentation
- [ ] Tests

# Attribution

The sponge favicon and logo was created by [Twitter for Twemoji](https://github.com/twitter/twemoji) and is licensed under the CC-BY 4.0.
