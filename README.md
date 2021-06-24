# dodo-tradmon-engine

Trading Monitor for DodoEx

Bounty link: [here](https://gitcoin.co/issue/DODOEX/gitCoinGrant/1/100025887)

Integration Description: [here](https://hackmd.io/@rymnc/dodo-tradmon)

Architecture Diagram: ![Dodo Tradmon](https://user-images.githubusercontent.com/43716372/123160137-71387480-d48b-11eb-863d-f3e307fc5ed5.png)

**Running the e2e test:**

1. Requirements: docker/podman, docker-compose
2. Start the ecosystem:

   docker: `docker-compose up`

   podman: `sudo docker-compose up`

3. Install dependencies locally

   `yarn`

4. Run the e2e test

   `yarn test`

   It should subscribe to the websocket engine and receive a singular event.

5. Teardown

   docker: `docker-compose down` or ctrl+c

   podman: `sudo docker-compose down` (ctrl+c doesn't work for podman)

Recording:

[![asciicast](https://asciinema.org/a/tBWrqQpEwvZOv5LzJxoRLOU1E.svg)](https://asciinema.org/a/tBWrqQpEwvZOv5LzJxoRLOU1E)
