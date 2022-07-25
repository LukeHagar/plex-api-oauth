import { PlexOauth } from "plex-oauth";
import { v4 } from "uuid";
import axios from "axios";
import qs from "qs";
export class PlexAPIOAuth {
  constructor(
    clientId = "",
    product = "Plex-API-OAuth",
    device = "Web-Client",
    version = "1",
    forwardUrl = "",
    platform = "Web",
    plexTVAuthToken = "",
    plexTVUserData = {},
    plexServers = {},
    plexLibraries = {},
    plexMovies = {},
    plexMusic = {},
    plexTVShows = {}
  ) {
    this.plexTVAuthToken = plexTVAuthToken;
    this.plexTVUserData = plexTVUserData;
    this.clientId = clientId;
    this.product = product;
    this.device = device;
    this.version = version;
    this.forwardUrl = forwardUrl;
    this.platform = platform;
    this.plexServers = plexServers;
    this.plexLibraries = plexLibraries;
    this.plexMovies = plexMovies;
    this.plexMusic = plexMusic;
    this.plexTVShows = plexTVShows;
    this.plexClientInformation = {
      clientId: this.clientId, // This is a unique identifier used to identify your app with Plex. - If none is provided a new one is generated and saved locally
      product: this.product, // Name of your application - Defaults to Plex-API-OAuth
      device: this.device, // The type of device your application is running on - Defaults to "Web Client"
      version: this.version, // Version of your application - Defaults to 1
      forwardUrl: this.forwardUrl, // Url to forward back to after signing in - Defaults to an empty string
      platform: this.platform, // Platform your application runs on - Defaults to 'Web'
    };
  }

  get ClientId() {
    return this.clientId;
  }
  set ClientId(clientId) {
    this.clientId = clientId;
  }
  get PlexTVAuthToken() {
    return this.plexTVAuthToken;
  }
  set PlexTVAuthToken(plexTVAuthToken) {
    this.plexTVAuthToken = plexTVAuthToken;
  }
  get PlexTVUserData() {
    return this.plexTVUserData;
  }
  set PlexTVUserData(plexTVUserData) {
    this.plexTVUserData = plexTVUserData;
  }
  get Product() {
    return this.product;
  }
  set Product(product) {
    this.product = product;
  }
  get Device() {
    return this.device;
  }
  set Device(device) {
    this.device = device;
  }
  get Version() {
    return this.version;
  }
  set Version(version) {
    this.version = version;
  }
  get ForwardUrl() {
    return this.forwardUrl;
  }
  set ForwardUrl(forwardUrl) {
    this.forwardUrl = forwardUrl;
  }
  get Platform() {
    return this.platform;
  }
  set Platform(platform) {
    this.platform = platform;
  }
  get PlexServers() {
    return this.plexServers;
  }
  set PlexServers(plexServers) {
    this.plexServers = plexServers;
  }
  get PlexLibraries() {
    return this.plexLibraries;
  }
  set PlexLibraries(plexLibraries) {
    this.plexLibraries = plexLibraries;
  }
  get PlexMovies() {
    return this.plexMovies;
  }
  set PlexMovies(plexMovies) {
    this.plexMovies = plexMovies;
  }
  get PlexMusic() {
    return this.plexMusic;
  }
  set PlexMusic(plexMusic) {
    this.plexMusic = plexMusic;
  }
  get PlexTVShows() {
    return this.plexTVShows;
  }
  set PlexTVShows(plexTVShows) {
    this.plexTVShows = plexTVShows;
  }
  get PlexClientInformation() {
    return this.plexClientInformation;
  }
  set PlexClientInformation(plexClientInformation) {
    this.plexClientInformation = plexClientInformation;
  }

  GenerateClientId() {
    this.clientId = v4();
    this.plexClientInformation.clientId = this.clientId;
  }

  PlexLogin() {
    var plexOauth = new PlexOauth(this.plexClientInformation);
    plexOauth
      .requestHostedLoginURL()
      .then((data) => {
        let [hostedUILink, pinId] = data;

        console.log("Plex Auth URL:");
        console.log(hostedUILink); // UI URL used to log into Plex
        console.log("Plex Pin ID:");
        console.log(pinId);

        window.open(hostedUILink, "_blank");
        window.focus();

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
            if (authToken !== null) {
              this.plexTVAuthToken = authToken;
              console.log("Plex Authentication Successful");
              return true;
            } else {
              console.log("Plex Authentication Failed");
              return false;
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

  GetPlexUserData() {
    axios({
      method: "GET",
      url:
        "https://plex.tv/api/v2/user?" +
        qs.stringify({
          "X-Plex-Product": this.plexClientInformation.product,
          "X-Plex-Client-Identifier": this.plexClientInformation.clientId,
          "X-Plex-Token": this.plexTVAuthToken,
        }),
      headers: { accept: "application/json" },
    })
      .then((response) => {
        console.log(response);
        console.log(response.status);
        if (response.status === 200) {
          this.plexUserData = response.data;
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
}
