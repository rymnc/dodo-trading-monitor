# dodo-tradmon-engine

Trading Monitor for DodoEx

Bounty link: [here](https://gitcoin.co/issue/DODOEX/gitCoinGrant/1/100025887)

Integration Description: [here](https://hackmd.io/@rymnc/dodo-tradmon)

Architecture Diagram:

<p align="center">
  <img width="600" src="https://user-images.githubusercontent.com/43716372/123160137-71387480-d48b-11eb-863d-f3e307fc5ed5.png">
</p>

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

<p align="center">
  <img width="600" src="https://rymnc.com/ca5db0df651c34eaaf160c23deb052dd/demo.svg">
</p>


Demo Video Link: https://youtu.be/RbZHo9oFY1E