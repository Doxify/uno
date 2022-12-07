<p align="center">
  <img align="center" src="https://i.imgur.com/5Tm1JmZ.png" width="40%" height="40%">
  <h3 align="center">Uno</h3>
  <p align="center"> 
    An online multiplayer clone of the card game, <a href="https://www.mattelgames.com/en-us/cards/uno">Uno</a>.
  </p>
</p>

---

## I. Built with
* Node
* Express
* Postgres
* Pusher

## II. Running the application

### Prerequisites
* Create a [Pusher](https://pusher.com) account to get an API key.
* Use the following [template](https://pastebin.com/raw/ECmYJfKN) to create a `.env` file in the root of this project.

### Docker
1. Build the application's docker image:
    ```sh
    docker build -t uno-app .
    ```
2. Start the docker container:
    ```sh
    docker-compose up
    ```
3. Application is now running on https://localhost:3000.

### Without Docker
1. Install and configure Postgres.
2. Install Node.js
3. Start the application from the `app` directory:
    ```sh
    cd app
    node bin/www
    ```
4. Application is now running on https://localhost:3000.

## III. Contributing
All contributions are welcome! Please do not hesitate to contribute in any way you see fit. If there is something you think that I could have done better then I am more than happy to listen to what you have to say!

**Bugs:** Open an issue and I will do my best to respond ASAP.

**Pull Requests:** Open an issue first so that we can discuss proposed changes.

## IV. Contributors
Huge shoutout to the following people for contributing to this project!

* [Benjamin](https://github.com/benjaminkao) - helped with backend/frontend
* [KC](https://github.com/yogeskc) - helped with frontend
* [Abishek](https://github.com/AbishekNeralla) - helped with testing
