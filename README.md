# HomeStreamer
A streaming server that is designed to run on a local network. 

Store all the videos in one place and start a server on that machine and stream those videos in devices connected to same network.
#

Server creates a symbolic link of the video file in `resources/uploads` directory. User can do this using interface.
#

### Installation

- `npm` and `node.js` should be already installed on the machine to run the server.
- Follow below steps if you need customization otherwise they will automatically be performed.
    - Run ``npm install`` in command prompt or terminal
    - Copy `.env.example` and save it as `.env`. Customize the values if needed.

### Run

- [NOTE] To create symbolic links in windows `Admin Privilege` is required.
- To start the server run the following file:
    * windows : ``run.bat --admin``
        - to start the server without admin privilege ``run.bat``
    * unix   : ``sh run.sh``

- Application will ask to choose the IP Address to host the server before starting the actual server.
