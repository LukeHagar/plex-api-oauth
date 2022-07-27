import { PlexOauth } from "plex-oauth";
import { v4 } from "uuid";
import axios from "axios";
import qs from "qs";

export class PlexAPIOAuth {
  plexClientInformation;
  clientId;
  product;
  device;
  version;
  forwardUrl;
  platform;
  plexTVAuthToken;
  plexTVUserData;
  plexServers;
  plexLibraries;
  plexDevices;
  constructor(
    clientId = "",
    product = "Plex-API-OAuth",
    device = "Web-Client",
    version = "1",
    forwardUrl = "",
    platform = "Web",
    plexTVAuthToken = "",
    plexTVUserData = {},
    plexServers = [],
    plexDevices = [],
    selectedPlexServer = {}
  ) {
    this.clientId = clientId;
    this.product = product;
    this.device = device;
    this.version = version;
    this.forwardUrl = forwardUrl;
    this.platform = platform;

    this.plexTVAuthToken = plexTVAuthToken;
    this.plexTVUserData = plexTVUserData;
    this.plexServers = plexServers;
    this.plexDevices = plexDevices;
    this.selectedPlexServer = selectedPlexServer;

    this.plexClientInformation = {
      clientIdentifier: this.clientId, // This is a unique identifier used to identify your app with Plex. - If none is provided a new one is generated and saved locally
      product: this.product, // Name of your application - Defaults to Plex-API-OAuth
      device: this.device, // The type of device your application is running on - Defaults to "Web Client"
      version: this.version, // Version of your application - Defaults to 1
      forwardUrl: this.forwardUrl, // Url to forward back to after signing in - Defaults to an empty string
      platform: this.platform, // Platform your application runs on - Defaults to 'Web'
    };
  }

  SetPlexSession({
    clientId = "",
    product = "Plex-API-OAuth",
    device = "Web-Client",
    version = "1",
    forwardUrl = "",
    platform = "Web",
    plexTVAuthToken = "",
    plexTVUserData = {},
    plexServers = [],
    plexDevices = [],
    selectedPlexServer = {},
  }) {
    this.plexTVAuthToken = plexTVAuthToken;
    this.plexTVUserData = plexTVUserData;
    this.clientId = clientId;
    this.product = product;
    this.device = device;
    this.version = version;
    this.forwardUrl = forwardUrl;
    this.platform = platform;
    this.plexServers = plexServers;
    this.plexDevices = plexDevices;
    this.selectedPlexServer = selectedPlexServer;

    this.plexClientInformation = {
      clientIdentifier: this.clientId, // This is a unique identifier used to identify your app with Plex. - If none is provided a new one is generated and saved locally
      product: this.product, // Name of your application - Defaults to Plex-API-OAuth
      device: this.device, // The type of device your application is running on - Defaults to "Web Client"
      version: this.version, // Version of your application - Defaults to 1
      forwardUrl: this.forwardUrl, // Url to forward back to after signing in - Defaults to an empty string
      platform: this.platform, // Platform your application runs on - Defaults to 'Web'
    };
  }

  SavePlexSession() {
    console.log("Saving State:");
    let sessionData = {
      plexTVAuthToken: this.plexTVAuthToken,
      plexTVUserData: this.plexTVUserData,
      clientId: this.clientId,
      product: this.product,
      device: this.device,
      version: this.version,
      forwardUrl: this.forwardUrl,
      platform: this.platform,
      plexServers: this.plexServers,
      plexDevices: this.plexDevices,
      selectedPlexServer: this.selectedPlexServer,
      plexClientInformation: this.plexClientInformation,
    };
    console.log(sessionData);
    window.localStorage.setItem("plexSessionData", JSON.stringify(sessionData));
  }

  LoadPlexSession() {
    console.log("Loading State:");
    let sessionData = JSON.parse(
      window.localStorage?.getItem("plexSessionData") || "{}"
    );
    this.SetPlexSession(sessionData);
    console.log(sessionData);
  }

  GenerateClientId() {
    this.clientId = v4();
    this.plexClientInformation.clientIdentifier = this.clientId;
  }

  async PlexLogin() {
    if (
      this.clientId == null ||
      this.plexClientInformation.clientIdentifier == null
    ) {
      this.GenerateClientId();
    }
    var plexOauth = new PlexOauth(this.plexClientInformation);
    let data = await plexOauth.requestHostedLoginURL().catch((err) => {
      throw err;
    });

    let [hostedUILink, pinId] = data;

    console.log("Plex Auth URL:");
    console.log(hostedUILink); // UI URL used to log into Plex

    if (typeof window !== "undefined") {
      window.open(hostedUILink, "_blank");
      window.focus();
    }

    /*
     * You can now navigate the user's browser to the 'hostedUILink'. This will include the forward URL
     * for your application, so when they have finished signing into Plex, they will be redirected back
     * to the specified URL. From there, you just need to perform a query to check for the auth token.
     * (See Below)
     */

    // Check for the auth token, once returning to the application

    let authToken = await plexOauth
      .checkForAuthToken(pinId, 1000, 10)
      .catch((err) => {
        throw err;
      });

    if (authToken !== null) {
      this.plexTVAuthToken = authToken;
      console.log("Plex Authentication Successful");
      return authToken;
    } else {
      console.log("Plex Authentication Failed");
      return authToken;
    }
    // An auth token will only be null if the user never signs into the hosted UI, or you stop checking for a new one before they can log in
  }

  async GetPlexUserData() {
    let response = await axios({
      method: "GET",
      url:
        "https://plex.tv/api/v2/user?" +
        qs.stringify({
          "X-Plex-Product": this.plexClientInformation.product,
          "X-Plex-Client-Identifier":
            this.plexClientInformation.clientIdentifier,
          "X-Plex-Token": this.plexTVAuthToken,
        }),
      headers: { accept: "application/json" },
    }).catch(function (error) {
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

    //console.log(response);
    //console.log(response.status);
    if (response.status === 200) {
      //console.log("Authentican Token Validated Successfully");
      this.plexTVUserData = response.data;
      //console.log("Populated User Data Successfully");
      return response.data;
    }
    if (response.status === 401) {
      //console.log("Authentican Token Failed Validation");
      return null;
    }
  }

  async GetPlexServers() {
    let response = await axios({
      method: "GET",
      url:
        "https://plex.tv/api/v2/resources?" +
        qs.stringify({
          includeHttps: 1,
          includeRelay: 1,
          includeIPv6: 1,
          "X-Plex-Product": this.plexClientInformation.product,
          "X-Plex-Client-Identifier":
            this.plexClientInformation.clientIdentifier,
          "X-Plex-Token": this.plexTVAuthToken,
        }),
      headers: { accept: "application/json" },
    }).catch((err) => {
      throw err;
    });
    this.plexDevices = response.data;
    this.plexServers = response.data
      .filter((Obj) => Obj.product === "Plex Media Server")
      .map((Obj) => {
        return {
          name: Obj.name,
          product: Obj.product,
          productVersion: Obj.product,
          platform: Obj.platform,
          platformVersion: Obj.platform,
          device: Obj.device,
          clientIdentifier: Obj.client,
          createdAt: Obj.created,
          lastSeenAt: Obj.last,
          localConnections: Obj.connections.filter(
            (connection) => connection.local === true
          ),
          provides: Obj.provides,
          ownerId: Obj.owner,
          sourceTitle: Obj.source,
          publicAddress: Obj.public,
          accessToken: Obj.access,
          owned: Obj.owned,
          home: Obj.home,
          synced: Obj.synced,
          relay: Obj.relay,
          relayConnections: Obj.connections.filter(
            (connection) => connection.relay === true
          ),
          presence: Obj.presence,
          httpsRequired: Obj.https,
          publicAddressMatches: Obj.public,
          dnsRebindingProtection: Obj.dns,
          natLoopbackSupported: Obj.natLoopbackSupported,
          connections: Obj.connections,
        };
      });
    return response.data;
  }

  async GetPlexLibraries() {
    let libraryArray = []
    this.plexServers.forEach((server) => {
      let response = await axios({
      method: "GET",
      url:
        server.relayConnections[0].uri +
        "/library/sections/?" +
        qs.stringify({
          "X-Plex-Token": server.accessToken,
        }),
      headers: { accept: "application/json" },
    }).catch((err) => {
      throw err;
    });
    libraryArray = [...libraryArray, ...response?.data?.MediaContainer?.Directory]
  })
  this.plexLibraries = libraryArray
  }

  // async PopulateLibraryContent(server: PlexServer, library: PlexLibrary) {
  //   let response = await axios({
  //     method: "GET",
  //     url:
  //       server?.relayConnections[0].uri +
  //       "/library/sections/" +
  //       library?.uuid +
  //       "?" +
  //       qs.stringify({
  //         "X-Plex-Token": server?.accessToken,
  //       }),
  //     headers: { accept: "application/json" },
  //   }).catch((err) => {
  //     throw err;
  //   });
  //   console.log(response.data);
  //   return response.data;
  // }
}
