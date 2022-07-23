import { PlexOauth, IPlexClientDetails } from "plex-oauth";
import v4 from "uuid/dist/v4";
import axios from "axios";
import qs from "qs";
class PlexAPIOauth {
  
  constructor(
  clientId,
  product = "Plex-API-OAuth",
  device = "Web Client",
  version = "1",
  forwardUrl = "",
  platform = "Web"
) {
  this.clientId = clientId;
  this.product = product
  this.device = device
  this.version = version 
  this.forwardUrl = forwardUrl
  this.platform = platform

  if (clientId === null) {
    var clientId = localStorage.getItem("plex-client-id"); //Defaults to last used ClientId from any previous runs
  }
  if (clientId === null) {
    const uuid = v4(); //If no ClientId is saved, generate a new one and save it
    clientId = uuid;
  }

  localStorage.setItem("plex-client-id", clientId);

  console.log("Plex ClientID:");
  console.log(clientId);

  var plexData = localStorage.getItem("plex-database"); //Retrieve plexData from localStorage if saved from previous actions
  if (plexData === null) {
    plexData = {
      plexAuthToken: "",
      plexUserData: {},
      plexServers: {},
      plexLibraries: {},
      plexMovies: {},
      plexMusic: {},
      plexTVShows: {},
    };
  }

  console.log("Plex DataBase:");
  console.log(plexData);

}
  

  openInNewTab(url) {
    var separateWindow = window.open(url, "_blank");
    separateWindow?.focus;
  }

  plexClientInformation = {
    clientIdentifier: clientId, // This is a unique identifier used to identify your app with Plex. - If none is provided a new one is generated and saved locally
    product: product, // Name of your application - Defaults to Plex-API-OAuth
    device: device, // The type of device your application is running on - Defaults to "Web Client"
    version: version, // Version of your application - Defaults to 1
    forwardUrl: forwardUrl, // Url to forward back to after signing in - Defaults to an empty string
    platform: platform, // Platform your application runs on - Defaults to 'Web'
  };

  plexOauth = new PlexOauth(plexClientInformation);
  // Get hosted UI URL and Pin Id

  async function plexLogin() {
    await plexOauth
      .requestHostedLoginURL()
      .then((data) => {
        let [hostedUILink, pinId] = data;

        console.log("Plex Auth URL:");
        console.log(hostedUILink); // UI URL used to log into Plex
        console.log("Plex Pin ID:");
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
            console.log("Plex Auth Token:");
            console.log(authToken); // Returns the auth token if set, otherwise returns null
            if (authToken !== null) {
              plexData.plexAuthToken = authToken;
            } else {
              console.log("No Authentication Token returned from Plex");
            }
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

  async function validatePlexAuthToken() {
    return await axios({
      method: "GET",
      url:
        "https://plex.tv/api/v2/user?" +
        require("qs").stringify({
          "X-Plex-Product": clientInformation.product,
          "X-Plex-Client-Identifier": clientInformation.clientId,
          "X-Plex-Token": plexData.plexAuthToken,
        }),
      headers: { accept: "application/json" },
    })
      .then((response) => {
        console.log(response);
        console.log(response.status);
        if (response.status === 200) {
          plexData.plexUserData = response.data;
          return true;
        }
        if (response.status === 401) {
          console.log("Authentican Token Failed Validation");
          return false;
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
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
  }
  function authToken() {
    return plexData.plexAuthToken;
  }
  function plexData() {
    return plexData;
  }
  function plexUserData() {
    return plexData.plexUserData;
  }
  function plexServers() {
    return plexData.plexServers;
  }
  function plexLibraries() {
    return plexData.plexLibraries;
  }
};
export { PlexAPIOauth };
