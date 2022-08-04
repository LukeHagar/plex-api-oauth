# plex-api-oauth
An NPM Module designed to make Plex Media Server and plex.tv API calls easier to implement in JavaScript and React projects

<img src="https://img.shields.io/lgtm/grade/javascript/github/LukeHagar/plex-api-oauth" /> <img src="https://img.shields.io/npm/dw/plex-api-oauth" />

https://www.npmjs.com/package/plex-api-oauth

This is a JavaScript Module written to take the OAuth Module written by @Dmbob https://github.com/Dmbob/plex-oauth and incorporate it into a front end friend frame work to make development of Plex API Based applications better

## How to Use

Examples Assume React Syntax

### Loading a Saved State
``` JavaScript
 const loadedSession = LoadPlexSession();
if (
    loadedSession.plexClientInformation === null ||
    loadedSession.plexClientInformation === undefined
){
    loadedSession.plexClientInformation = CreatePlexClientInformation();
}

const [plexClientInformation, setPlexClientInformation] = useState(
  loadedSession.plexClientInformation
);
const [plexTVAuthToken, setPlexTVAuthToken] = useState(
  loadedSession.plexTVAuthToken
);
```

### Login Button + Save Session
``` JavaScript
 async function PlexLoginButton() {
    const tempPlexTVAuthToken = await PlexLogin(plexClientInformation);
    const tempPlexTVUserData = await GetPlexUserData(
      plexClientInformation,
      tempPlexTVAuthToken
    );
    const tempPlexServers = await GetPlexServers(
      plexClientInformation,
      tempPlexTVAuthToken
    );
    const tempPlexLibraries = await GetPlexLibraries(tempPlexServers);
    setPlexTVAuthToken(tempPlexTVAuthToken);
    setPlexServers(tempPlexServers);
    setPlexTVUserData(tempPlexTVUserData);
    setPlexLibraries(tempPlexLibraries);
    SavePlexSession(plexClientInformation, tempPlexTVAuthToken);
  }
```
