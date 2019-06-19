[![Dependency Status](https://img.shields.io/david/roman-kaspar/xmas-bell.svg)](https://david-dm.org/roman-kaspar/xmas-bell)
[![devDependency Status](https://img.shields.io/david/dev/roman-kaspar/xmas-bell.svg)](https://david-dm.org/roman-kaspar/xmas-bell?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/roman-kaspar/xmas-bell/badge.svg)](https://snyk.io/test/github/roman-kaspar/xmas-bell)

# xmas-bell
socket.io based web-app for remotely controlled audio playback

### THIS PROJECT IS NO LONGER MAINTAINED.

## Intro

If you happen to live in the part of the world where children get their Christmas presents in the morning, you are lucky, as Father Christmas (or Santa Claus) has enough time during the night to bring all the presents and put them under the tree.

But if you are from the part of the world where children get their presents in the afternoon or in the evening (as I am), then you probably take your children out of the room with the tree, hoping that when you come back, the presents will be there. Sometimes you, as a parent, know already that the presents are in the room, and the children (with you as well) can safely go back. To know when it is the right time to go back, we usually leave a bell on the table next to the tree, so when Father Christmas is leaving the room, he rings the bell. Sometimes, however, he forgets, so I wrote this app to help the parents in this situation...

## How it works

You install the server part of the application on a computer. You'll need a computer with speakers (can be the same one running the server part) in your room with the tree (and Christmas presents). There you open browser (tested with Google Chrome) and navigate to the server. You create a new session, which means that this computer will play the bell audio in the end. Make sure the computer with the browser doesn't fall asleep, and that the audio is on.

Then you will need another device with browser, that will be used as a remote control. It will typically be a smart phone (tested with mobile Safari and mobile Google Chrome browsers), but it can be another computer as well. You navigate to the same server from the browser and select already existing session there.

You'll see slider to control audio volume (doesn't when audio is hosted on mobile device), and play button to start the bell audio (and home button to go back to the session list). When it is the right time, press the play button and the other browser will play the bell audio for you.

## Installation

The server part is written for `node.js`, so you'll need to install `node.js`. To install dependencies use `npm install`. To start the server, use `npm start`.

```
$ git clone git@github.com:roman-kaspar/xmas-bell.git
$ cd xmas-bell
$ npm install
$ npm start
```

You can specify env. variable `PORT` to say what port the server should run on, the default is 3000.

Once the server is running, you can use browsers on your computers and devices to use it. Make sure everything is working well before you'll use it for real.

You can also replace `bell.mp3` file in the `xmas-bell` directory with the recording of your real bell, so the sound is really authentic.

## Demo

To try the service before you clone and run your own instance (e.g. to see that your browsers / devices can be used), I started an instance on Heroku at [xmas-bell.herokuapp.com](https://xmas-bell.herokuapp.com/). It is a playground only, do not use it for real, as anyone can connect there at anytime and ring any bell from any session.

Since it is a free Heroku instance, it can take some time for the instance to wake up. Even worse: there is no guarantee it will be up when you need it. So in case you consider using it at home, please spin up your local instance!

## Future development

For next season (Xmas 2017) I may add password protection for sessions, so then you'll be able to protect your own sessions and no one could access them (so no one can ring your bells, not without the right password).


## Merry Xmas

for you and your children!

## Credits
Christmas tree image from http://4vector.com/free-vector/christmas-tree-05-vector-25039
