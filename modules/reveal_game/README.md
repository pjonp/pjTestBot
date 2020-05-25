# S.E. Image Reveal Game
***
#### Basic Setup

###### Cover Image:
- Starting cover image

###### Font Color:
- Overlay status font color

###### Background Color:
- Overlay status background color

###### Databasefile:
- Database file to pull answer & images from in json format:
<code>

[ {
    "name": "answer word",
    "image": "https://.../images/image1.png"
  },
  {
    "name": "answer 2",
    "image": "https://.../002.png"
  } ]
</code>

###### Chat Command:
- Command to start & stop image reveal game

###### Chat Command Start Argument:
- Argument to start image reveal game !guess **start**

###### Chat Command Stop Argument:
- Argument to start image reveal game !guess **stop**

###### Overlay Winner Text:
- Text to display on overlay status screen with a winner:
-- {user}, {points}, & {answer} are variables

###### Overlay Timeout Text:
- Text to display on overlay status screen when no winner:
-- {points}, & {answer} are variables  
***
#### Middleware Setup

###### Token:
- Token from [jebaited.net](https://jebaited.net/)
-- Required Scopes: **addPoints** & **botMsg**

###### Winner Points:
- Stream Element points given to winner

###### Chat Winner Text:
- Text bot will send to chat with a winner:
-- {user}, {points}, & {answer} are variables

###### Chat Timeout Text:
- Text bot will send to chat when no winner:
-- {points}, & {answer} are variables
***
#### Gameplay Settings

###### Autostart:
- Autostart game when loaded

###### Loop game:
- Yes: Automatically starts a round once previous round is done and will continue to start new rounds until manually disabled with stop command i.e. *!guess stop*
- No: Only 1 game round will play

###### Mods can start/stop games:
- Yes: Broadcaster & Mods can use the start & stop commands
- No: **Only** Broadcaster can use the start & stop commands

###### Grid Size (# x #):
- Number of squares to be revealed in the game area: i.e. 2 -> (2x2) = 4 total squares

###### Countdown to start game:
- Countdown shown on the status before squares begin being revealed

###### Delay between reveals:
- Time between each square being revealed

###### Time allowed when full image is shown:
- Amount of time before the game is over once all squares are revealed

###### Gameover displaytime:
- Amount of time the gameover text is displayed on the status screen before the overlay hides or the next round is started
