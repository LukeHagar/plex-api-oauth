# plex-api-oauth
An NPM Module designed to make Plex Media Server and plex.tv API calls easier to implement in JavaScript and React projects

<img src="https://img.shields.io/lgtm/grade/javascript/github/LukeHagar/plex-api-oauth" /> <img src="https://img.shields.io/npm/dw/plex-api-oauth" />

https://www.npmjs.com/package/plex-api-oauth

This is a JavaScript Module written to take the OAuth Module written by @Dmbob https://github.com/Dmbob/plex-oauth and incorporate it into a front end friend frame work to make development of Plex API Based applications better

## How to Use

Examples Assume React Syntax

### Loading a Saved Session

LoadPlexSession:  
Function returns an object that contains the plexClientInformation and plexTVAuthToken keys/values according to how they were created
``` JavaScript
const loadedSession = LoadPlexSession();
if (loadedSession.plexClientInformation == null){
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

### Refresh Data with Saved Session
``` JavaScript
 async function Refresh() {
    const tempPlexTVUserData = await GetPlexUserData(
      plexClientInformation,
      plexTVAuthToken
    );
    const tempPlexServers = await GetPlexServers(
      plexClientInformation,
      plexTVAuthToken
    );
    const tempPlexDevices = await GetPlexDevices(
      plexClientInformation,
      plexTVAuthToken
    );
    const tempPlexLibraries = await GetPlexLibraries(tempPlexServers);
    UpdateHubs(tempPlexServers, tempPlexLibraries);
    setPlexServers(tempPlexServers);
    setPlexDevices(tempPlexDevices);
    setPlexTVUserData(tempPlexTVUserData);
    setPlexLibraries(tempPlexLibraries);
    setIsRefreshing(false);
  }
```

### Update Library list when the topic is changed (artists. albums, songs)
``` JavaScript
 async function UpdateLibrary() {
    setIsLoading(true);
    const returnObject = await GetLibraryPages(
      plexServers,
      plexLibraries,
      topic,
      pageNumber,
      250
    );
    console.log(returnObject);
    const tempItemArray = Array.from([
      ...new Set([...libraryItems, ...returnObject.items]),
    ]);

    setLibraryItems(tempItemArray);
    setLibraryHasMore(returnObject.hasMore);
    setIsLoading(false);
  }
```

### Intersection observer to load more library items when the callbackref object comes into view
``` JavaScript
 const observer = useRef();
  const lastLibraryItem = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && libraryHasMore) {
          setPageNumber(pageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
      console.log(node);
    },
    [isLoading, libraryHasMore]
  );
```

### Intersection observer Callback usage
``` JavaScript
                    if (libraryItems?.length === index + 100) {
                      return (
                        <Grid item xs="12" key={Obj.guid + index}>
                          <ListItem ref={lastLibraryItem}>
                            <ListItemAvatar>
                              <Avatar alt={NoArt} src={Obj.thumb} />
                            </ListItemAvatar>
                            <Typography variant="h6" noWrap>
                              {Obj.title} - {Obj.grandparentTitle} -{' '}
                              {Obj.parentTitle}
                            </Typography>
                          </ListItem>
                        </Grid>
                      );
                    }
```

### Intersection observer to load more library items when the callbackref object comes into view
``` JavaScript
 const observer = useRef();
  const lastLibraryItem = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && libraryHasMore) {
          setPageNumber(pageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
      console.log(node);
    },
    [isLoading, libraryHasMore]
  );
```

### Get Plex Music Hub data
``` JavaScript
 async function UpdateHubs(plexClientInformation, plexServers, plexLibraries) {
    const tempMusicHubs = await GetMusicHub(
      plexClientInformation,
      plexServers, // No Auth Token is needed since the server entries have their own access tokens
      plexLibraries
    );
    setMusicHubs(tempMusicHubs);
  }
```


