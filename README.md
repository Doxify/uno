<p align="center">
  <img src="https://i.imgur.com/FlLw5QH.png" width="35%" height="35%">
  <h3 align="center">Uno</h3>

  <p align="center"> 
  An online multiplayer clone of the card game, <a href="https://www.mattelgames.com/en-us/cards/uno">Uno</a>.
  </p>
</p>

---

## Built with
* Node
* Express
* Postgres
* Pusher

## Running the application
<!-- This project uses docker, make sure you have docker installed before running this project.
 -->
### Prerequisites
* This project uses docker, make sure you have docker installed before running this project.
* Use the following [template](https://pastebin.com/raw/ECmYJfKN) to create a `.env` file in the root of this project.

### Usage
1. Build the application's docker image:
    ```sh
    docker build -t uno-app .
    ```
2. Start the docker container:
    ```sh
    docker-compose up
    ```
3. Application is now running on https://localhost:3000.

## Contributors
Thank you to these contributors for helping me work on this application!

* [Benjamin](https://github.com/benjaminkao) - helped with backend/frontend
* [KC](https://github.com/yogeskc) - helped with frontend
* [Abishek](https://github.com/AbishekNeralla) - helped with testing
