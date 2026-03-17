// this service handles:
//1. connecting to WebSocket(if it doesn't exists)
// ws.websocket(), onopen, onmessage, onerror mainly use
// onopen -> this checks when a websocket connection start/opens
// so onopen will update our connectionStatus
// onmessage -> when message starting
// so onmessage will handle our transcrption state(partial or full)?? i think(whne user is speaking)
// when ai is speaking onmessage updates our voiceState
// onerror -> whenever a error occurs during the streaming
// i think we can start our expontianl backoff here (3 attemps)
// HOW TO HANDLE EXPONTIONAL BACKOFF? it is simple i think
// int count = 0
// function() starts
// if(count < MAX)
// delay = pow(2, cnt) seconds
// count++;
// else
// maxium attempts reached -> disconnect
// kal subha karte hai ab ye
