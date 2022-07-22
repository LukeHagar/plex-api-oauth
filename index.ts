import { PlexOauth, IPlexClientDetails } from "plex-oauth"
import v4 from "uuid/dist/v4";
import axios from 'axios';
import qs from 'qs'
var PlexOauth = /** @class */ (function () {
var clientId = localStorage.getItem('plex-client-id')

if (clientId === null) {
    const uuid = v4();
    localStorage.setItem('plex-client-id', uuid);
    clientId = uuid;
  };

  const plexData = (localStorage.getItem('plex-database'))
console.log(plexData)

function openInNewTab(url: string | URL | undefined) {
    let separateWindow = window.open(url, '_blank');
    separateWindow?.focus;
  }


let clientInformation: IPlexClientDetails = {
    clientIdentifier: "<PROVIDE_UNIQUE_VALUE>", // This is a unique identifier used to identify your app with Plex.
    product: "<NAME_OF_YOUR_APP>",              // Name of your application
    device: "<NAME_OF_YOUR_DEVICE>",            // The type of device your application is running on
    version: "1",                               // Version of your application
    forwardUrl: "https://localhost:3000",       // Url to forward back to after signing in.
    platform: "Web",                            // Optional - Platform your application runs on - Defaults to 'Web'
}

let plexOauth = new PlexOauth(clientInformation);
    // Get hosted UI URL and Pin Id

function plexLogin() {
    plexOauth
      .requestHostedLoginURL()
      .then((data) => {
        let [hostedUILink, pinId] = data;

        console.log('Plex Auth URL:');
        console.log(hostedUILink); // UI URL used to log into Plex
        console.log('Plex Pin ID:');
        console.log(pinId);

        openInNewTab(hostedUILink);

        /*
         * You can now navigate the user's browser to the 'hostedUILink'. This will include the forward URL
         * for your application, so when they have finished signing into Plex, they will be redirected back
         * to the specified URL. From there, you just need to perform a query to check for the auth token.
         * (See Below)
         */

        // Check for the auth token, once returning to the application

        plexOauth
          .checkForAuthToken(pinId, 1000, 10)
          .then((authToken) => {
            console.log('Plex Auth Token:');
            console.log(authToken); // Returns the auth token if set, otherwise returns null
            if (authToken !== null) {
              validatePlexAuthToken(authToken);
            }
            else{ console.log("No Authentication Token returned from Plex")}
            // An auth token will only be null if the user never signs into the hosted UI, or you stop checking for a new one before they can log in
          })

          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  }

  function validatePlexAuthToken(authToken) {
    axios({
      method: 'GET',
      url:
        'https://plex.tv/api/v2/user?' +
        require('qs').stringify({
          'X-Plex-Product': clientInformation.product,
          'X-Plex-Client-Identifier': clientId,
          'X-Plex-Token': authToken,
        }),
      headers: { accept: 'application/json' },
    })
      .then((response) => {
        console.log(response);
        console.log(response.status);
        if (response.status === 200) {
          let tempData = plexData;
          tempData.plexUserData = response.data;
          tempData.plexAuthToken = authToken;
          setPlexData(tempData);
          getPlexServers();
          getPlexLibraries();
          getPlexMusicLibraries();
          savePlexState();
        }
        if (response.status === 401) {
        }
      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      });
  }}