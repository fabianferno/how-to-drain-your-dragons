# how-to-drain-your-dragons
zk game w online dragons and real humans

We are building a pvp battle game for this zk-hackathon called - "how-to-drain-your-dragon". 
- When each player joins the game, they land in a multiplayer lobby like open world map. They can roam around. All of this is off-chain. Each player has chooses three dragon when player joins a game (registers on chain) - each dragon can be either - fire, water, air, earth, aether. 

Players get to battle with another player in the game creating a battle. A battle works like this:  
Each battle is of two duels
In each duel - the players have to lock in their dragons not revealing which dragon. 
Once both locked in  - duel completes. In a duel a dragon wins or loses based on an effectiveness matrix with the type of dragon against an opponent. This is going to be similar to rock paper scissors.
In the first duel if the dragon loses - then it cannot be used in the next duel. 
Since none of the players know what dragon each player has - they have to deduce the other dragons the players have based on win/loss knowledge. 
When the two duels complete and the battle finishes  - the player with the most dragons remaining wins the battle. 

Winning player gains global points and losing player loses them. There is a global leaderboard which displays all users and their points- so basically people compete to stay on top of the leaderboard.


🚀 Game Flow
1. Player Registration
Player chooses 3 dragons → On-chain registration → Joins lobby

2. Battle Creation
Challenge opponent → Battle initialized → Both enter commit phase

3. Duel Execution (2 rounds)
Commit Phase: Secret dragon selection
     ↓
Reveal Phase: Prove commitment with nonce  
     ↓
Auto-Resolution: Determine winner, mark dead dragons
     ↓
Next Duel: Repeat until 2 duels complete

4. Battle Completion
Count remaining dragons → Determine winner → Update points & leaderboard


Use excalibur for the game logic - player registration can be done within nextjs UI
Players need to be find other players in the lobby - so we need to use socket.io to find other players. or some other way to find other players. - use a relevant library for this that is not too complex.- i can set up stuff and send creds in the env for this.  But for now make sure the game itself works and I will rewrite some of the handlers later to make it an on-chain game.