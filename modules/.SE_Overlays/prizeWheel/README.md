# Chatter Wheel

###### Notes:
**This widget works as an active source! All data will be reset when the source is closed or reloaded!**
- Default setup is a 1000px X 1000px container, centered on the overlay editor
- Overlay Video and Image attempt to center themselves on load/update and will sometimes not show correctly while adjusting the settings. They will force center after 10 seconds.
- Wheel will add active chatters as segments
- Chatter list is cleared when source is shutdown or reloaded
- Requiring a 'trigger' word or phrase for Giveaway mode will clear the chatter list
- Having the bot respond in chat requires a 'botMsg' token from [jebaited.net](https://jebaited.net/)

***
 ###### Settings below are for all of the **chatterWheelAdvanced.json** options. Some of these options are not available with the default install and you will need import this file information into the Field tab on the custom widget editor to unlock them.
***
#### Testing

###### Load Test Data:
- Populate the wheel with 12 sample chatters

###### Show Wheel On Load:
- Show the wheel for adjusting the visuals

***
#### Visual Set Up

###### Wheel Size:
- Wheel diameter, default: 900px

###### Starting X Position:
- Wheel X position offset, default: 50px

###### Starting Y Position:
- Wheel Y position offset, default: 50px

###### Foreground Video:
- Video to display on top of the wheel
- Note: the code will try to auto-center this video over the wheel

###### Video Size %:
- Adjust video size as a percentage of the wheel, default: 110

###### Video Offset X:
- Override the auto-center video position in the X direction

###### Video Offset Y:
- Override the auto-center video position in the Y direction

###### Foreground Image:
- Image to display on top of the wheel and video
- Note: the code will try to auto-center this image over the wheel

###### Image Size %:
- Adjust image size as a percentage of the wheel, default: 15

###### Foreground Image Radius:
- Adjust image corner radius, default: 50

###### Image Offset X:
- Override the auto-center image position in the X direction

###### Image Offset Y:
- Override the auto-center image position in the Y direction

###### Font:
- Google font for chatters' names

###### Text Size:
- Font size of chatters' names

###### Max Chatters:
- Maximum number of recent chatters on the wheel. Once this limit is reached
- The chatter with the oldest message is removed until they are active in chat again

###### Spin speed:
- Spin intensity
- Higher speeds may cause audio issues if using a 'tick' sound

###### Duration:
- Time in seconds that the wheel spins

###### Spin Over Delay:
- How long the wheel will stay on the screen after spinning before starting a new spin or hiding

***
#### Game Set Up

###### Broadcaster Spin Command:
- Spins the wheel. If the wheel is hidden the wheel is brought onto the screen

###### Broadcaster Show Wheel Command:
- Shows the wheel on screen. Wheel segments will update in real time as chatters post messages to chat

###### Broadcaster Hide Wheel Command:
- Hides the wheel. Wheel segments will update in the background

###### Broadcaster Clear Wheel Command:
- **Clears all wheel data!**
- Removes all active chatters
- Removes all previous winners

###### Winner Angle:
- The angle of the segment that determines the winner:
  - 0: UP, default
  - 90: RIGHT
  - 180: DOWN
  - 270: LEFT

###### Clear Previous Winners With !clearwheel Command:
- YES: Winners are cleared when **!clearwheel** is used in chat
- NO: Only the chatter list is cleared with **!clearwheel** Previous winners cannot join the wheel after the clear

###### Ignore Winners From Future Spins:
- YES: Removes winners from the wheel. They can not join the wheel again until source is reloaded or **!clearwheel** is used (with setting above as YES)
- NO: Winners can win multiple times

###### Clear Chatter List Once Complete:
- YES: Chatter list is cleared once all spins are complete! Does **not** affect the winner setting above
- NO: Chatter is not cleared after spins complete

###### Ignored Chatters:
- Usernames that should not be included on the wheel
- Comma separated e.g. *streamelements,commanderroot*

###### Play Sound On Ticks

###### Sound Effect
- Audio file to play on each tick
- Short audio file!

###### Who is added:
- Chatters that are added to the wheel
- Everybody, Subs, VIPS, or Mods

###### Trigger Goal Event:
- Tips: Wheel will automatically spin once the TIP goal is reached
- Cheers: Wheel will automatically spin once the CHEERS goal is reached
- Chat Command Only: Only the broadcaster can trigger a spin with **!spin** command in chat
- Note: **!spin** command will work in all modes!

###### Minimum Goal Amount:
- Minimum goal amount for Tips or Cheers selected above to automatically spin the wheel
- Note: Goal is randomly selected between the Min & Max amounts. Set both to the same value for a fixed goal

###### Maximum Goal Amount:
- Maximum goal amount for Tips or Cheers selected above to automatically spin the wheel
- Note: Goal is randomly selected between the Min & Max amounts. Set both to the same value for a fixed goal

###### Allow Multiple Spins On Large Donations:
- Example: Tip goal limits are set to 10 min & 10 max. A $55 donation will...
- YES: Allow multiple spins (5 spins will occur. $5 remains in the bank and after $5 more in donations the wheel will spin again)
- NO: Only 1 spin will happen after the goal is reached (Once complete the bank is set to $0)


###### Require A Raffle Word To Join:
- "Raffle Mode"
- Chatters must say a specific word or phrase to be added
- Can be enabled via command below

###### Command to Enable/Set Raffle Word:
- Sets the word required to join on the wheel e.g. **!wheelword join**
- Only chatters that type **join** in chat are added to the wheel
- Notes:
  - Can be more than one word e.g. **!wheelword add me** requires 'add me' in chat
  - **This will clear the current chatter list**
  - Previous winners of any spin cannot join if that option is enabled. use !clearwheel to clear the winners list

***
#### Middleware Setup

###### Token:
- Token from [jebaited.net](https://jebaited.net/)
  - Required Scopes: **botMsg**

###### Announce winner to chat:
- Yes: Bot will send messages to chatroom
- No: Bot will **not** send messages to chatroom

###### Change Prize Command:
- Change the prize of the spin with chat command. Default **!spinprize**
  - e.g. !spinprize 1000 points

###### Prize Response:
- Default Prize. Overridden with above command

###### Chat Winner Text:
- Text bot will send to chat with a winner:
  - {chatter} & {prize} are variables

###### Chat Response (stream) Delay (s):
- Delay between the overlay end of spin and the bot's response to chat
- Adjust depending on your stream delay settings ~5 seconds
- Review your VOD to see the viewers experience
  - If set to 0, the bot will announce in chat before the viewers see the end of the wheel spin

***
###### Credits:
 - StreamElements middleware by lx
 - Default video animation by JayniusGamingTV
 - "Animated gradient webcam frame" by Kagrayz
 - Winwheel.js by Douglas McKechie @ www.dougtesting.net
 - Copyright (c)(MIT) 2020 pjonp
