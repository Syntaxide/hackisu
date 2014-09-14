soundcloud forwarder for HackISU.

Purpose: take a soundcloud track id and return the mp3 file.

Example:
http://localhost:3000/app/tracks/167554498
-> https://soundcloud.hs.llnwd.net/eklchKVLzsZb.128.mp3?AWSAccessKeyId=AKIAJNIGGLK7XA7YZSNQ&Expires=1410659225&Signature=vmNeD3noTJ5n7rbXFzcwtP5aqTE%3D&e=1410659225&h=e9081f12c9d3b36100323452cdab5a5c

http://localhost:3000/app/tracks/
-> [ {"title":"Coffee Break - Zeds Dead","id":127823388,"artwork_url":"https://i1.sndcdn.com/artworks-000035659679-oztgdt-large.jpg?e76cf77"} {"title":"Crayon feat KLP Give You Up Darius Remix","id":04120136,"artwork_url":"https://i1.sndcdn.com/artworks-000054584031-n79yh0-large.jpg?e76cf77"} {"title":"Goldroom ft. Chela - Fifteen (Oxford remix)","id":48597328,"artwork_url":"https://i1.sndcdn.com/artworks-000054740698-y3drzk-large.jpg?e76cf77"} {"title":"Skrillex - Bangarang feat Sirah","id":45719017,"artwork_url":"https://i1.sndcdn.com/artworks-000080856705-uztc0k-large.jpg?e76cf77"} ]
