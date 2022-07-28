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
    plexLibraries = [],
    plexDevices = []
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
    this.plexLibraries = plexLibraries;

    this.plexClientInformation = {
      clientIdentifier: this.clientId, // This is a unique identifier used to identify your app with Plex. - If none is provided a new one is generated and saved locally
      product: this.product, // Name of your application - Defaults to Plex-API-OAuth
      device: this.device, // The type of device your application is running on - Defaults to "Web Client"
      version: this.version, // Version of your application - Defaults to 1
      forwardUrl: this.forwardUrl, // Url to forward back to after signing in - Defaults to an empty string
      platform: this.platform, // Platform your application runs on - Defaults to 'Web'
    };
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  PlexLogout() {
    this.clientId = "";
    this.product = "Plex-API-OAuth";
    this.device = "Web-Client";
    this.version = "1";
    this.forwardUrl = "";
    this.platform = "Web";
    this.plexTVAuthToken = "";
    this.plexTVUserData = {};
    this.plexServers = [];
    this.plexLibraries = [];
    this.plexDevices = [];
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
    plexLibraries = [],
    plexLibraryContent = [],
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
    this.plexLibraries = plexLibraries;
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
    window.localStorage.setItem(
      "plexSessionData",
      JSON.stringify({
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
        plexLibraries: this.plexLibraries,
        plexClientInformation: this.plexClientInformation,
      })
    );
  }

  LoadPlexSession() {
    this.SetPlexSession(
      JSON.parse(window.localStorage?.getItem("plexSessionData") || "{}")
    );
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
      return this.plexTVUserData;
    }
    if (response.status === 401) {
      //console.log("Authentican Token Failed Validation");
      return null;
    }
  }

  async GetPlexServers(searchParams = null) {
    let serverArray = [];
    let response = await axios({
      method: "GET",
      url:
        "https://plex.tv/api/v2/resources?" +
        qs.stringify(searchParams) +
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
    for (const server of response.data.filter(
      (Obj) => Obj.product === "Plex Media Server"
    )) {
      let localConnection = null;
      let serverCapabilities = null;
      let preferredConnection = server.connections.filter(
        (connection) => connection.relay === true
      )[0];
      for (const connection of server.connections.filter(
        (entry) => entry.local === true
      )) {
        if (localConnection === null && serverCapabilities === null) {
          try {
            let response = await axios({
              method: "GET",
              url:
                connection.uri +
                "/?" +
                qs.stringify({ "X-Plex-Token": server.accessToken }),
              timeout: 1000,
            });
            localConnection = connection;
            serverCapabilities = response.data.MediaContainer;
            preferredConnection = connection;
          } catch {}
        }
      }
      serverArray.push({
        name: server.name,
        product: server.product,
        productVersion: server.productVersion,
        platform: server.platform,
        platformVersion: server.platformVersion,
        device: server.device,
        clientIdentifier: server.clientIdentifier,
        createdAt: server.createdAt,
        lastSeenAt: server.lastSeenAt,
        localConnection: localConnection,
        preferredConnection: preferredConnection,
        provides: server.provides,
        ownerId: server.ownerId,
        sourceTitle: server.sourceTitle,
        publicAddress: server.publicAddress,
        accessToken: server.accessToken,
        owned: server.owned,
        home: server.home,
        synced: server.synced,
        relay: server.relay,
        relayConnection: server.connections.filter(
          (connection) => connection.relay === true
        )[0],
        serverCapabilities: serverCapabilities,
        presence: server.presence,
        httpsRequired: server.httpsRequired,
        publicAddressMatches: server.publicAddressMatches,
        dnsRebindingProtection: server.dnsRebindingProtection,
        natLoopbackSupported: server.natLoopbackSupported,
        connections: server.connections,
      });
    }
    this.plexServers = serverArray;
    return serverArray;
  }

  async GetPlexLibraries(servers = this.plexServers) {
    let libraryArray = [];
    for (const server of servers) {
      let connectionUri = server.relayConnection;
      if (server.localConnection) {
        connectionUri = server.localConnection;
      }
      let response = await axios({
        method: "GET",
        url:
          connectionUri.uri +
          "/library/sections/?" +
          qs.stringify({
            "X-Plex-Token": server.accessToken,
          }),
        headers: { accept: "application/json" },
      }).catch((err) => {
        throw err;
      });
      for (const library of response.data.MediaContainer.Directory) {
        libraryArray.push({
          server: server,
          allowSync: library.allowSync,
          art: library.art,
          composite: library.composite,
          filters: library.filters,
          refreshing: library.refreshing,
          thumb: library.thumb,
          key: library.key,
          type: library.type,
          title: library.title,
          agent: library.agent,
          scanner: library.scanner,
          language: library.language,
          uuid: library.uuid,
          updatedAt: library.updatedAt,
          createdAt: library.createdAt,
          scannedAt: library.scannedAt,
          content: library.content,
          directory: library.directory,
          contentChangedAt: library.contentChangedAt,
          hidden: library.hidden,
          Location: library.Location,
        });
      }
    }
    this.plexLibraries = libraryArray;
    return this.plexLibraries;
  }

  async GetPlexMovieLibraries(servers = this.plexServers) {
    let libraryArray = [];
    for (const server of servers) {
      let connectionUri = server.relayConnection;
      if (server.localConnection) {
        connectionUri = server.localConnection;
      }
      let response = await axios({
        method: "GET",
        url:
          connectionUri.uri +
          "/library/sections/?" +
          qs.stringify({
            "X-Plex-Token": server.accessToken,
          }),
        headers: { accept: "application/json" },
      }).catch((err) => {
        throw err;
      });
      for (const library of response.data.MediaContainer.Directory.filter(
        (Obj) => Obj.type === "movie"
      )) {
        libraryArray.push({
          server: server,
          allowSync: library.allowSync,
          art: library.art,
          composite: library.composite,
          filters: library.filters,
          refreshing: library.refreshing,
          thumb: library.thumb,
          key: library.key,
          type: library.type,
          title: library.title,
          agent: library.agent,
          scanner: library.scanner,
          language: library.language,
          uuid: library.uuid,
          updatedAt: library.updatedAt,
          createdAt: library.createdAt,
          scannedAt: library.scannedAt,
          content: library.content,
          directory: library.directory,
          contentChangedAt: library.contentChangedAt,
          hidden: library.hidden,
          Location: library.Location,
        });
      }
    }
    return libraryArray;
  }

  async GetPlexMusicLibraries(servers = this.plexServers) {
    let libraryArray = [];
    for (const server of servers) {
      let connectionUri = server.relayConnection;
      if (server.localConnection) {
        connectionUri = server.localConnection;
      }
      let response = await axios({
        method: "GET",
        url:
          connectionUri.uri +
          "/library/sections/?" +
          qs.stringify({
            "X-Plex-Token": server.accessToken,
          }),
        headers: { accept: "application/json" },
      }).catch((err) => {
        throw err;
      });
      for (const library of response.data.MediaContainer.Directory.filter(
        (Obj) => Obj.type === "artist"
      )) {
        libraryArray.push({
          server: server,
          allowSync: library.allowSync,
          art: library.art,
          composite: library.composite,
          filters: library.filters,
          refreshing: library.refreshing,
          thumb: library.thumb,
          key: library.key,
          type: library.type,
          title: library.title,
          agent: library.agent,
          scanner: library.scanner,
          language: library.language,
          uuid: library.uuid,
          updatedAt: library.updatedAt,
          createdAt: library.createdAt,
          scannedAt: library.scannedAt,
          content: library.content,
          directory: library.directory,
          contentChangedAt: library.contentChangedAt,
          hidden: library.hidden,
          Location: library.Location,
        });
      }
    }
    return libraryArray;
  }

  async GetPlexTVShowLibraries(servers = this.plexServers) {
    let libraryArray = [];
    for (const server of servers) {
      let connectionUri = server.relayConnection;
      if (server.localConnection) {
        connectionUri = server.localConnection;
      }
      let response = await axios({
        method: "GET",
        url:
          connectionUri.uri +
          "/library/sections/?" +
          qs.stringify({
            "X-Plex-Token": server.accessToken,
          }),
        headers: { accept: "application/json" },
      }).catch((err) => {
        throw err;
      });
      for (const library of response.data.MediaContainer.Directory.filter(
        (Obj) => Obj.type === "show"
      )) {
        libraryArray.push({
          server: server,
          allowSync: library.allowSync,
          art: library.art,
          composite: library.composite,
          filters: library.filters,
          refreshing: library.refreshing,
          thumb: library.thumb,
          key: library.key,
          type: library.type,
          title: library.title,
          agent: library.agent,
          scanner: library.scanner,
          language: library.language,
          uuid: library.uuid,
          updatedAt: library.updatedAt,
          createdAt: library.createdAt,
          scannedAt: library.scannedAt,
          content: library.content,
          directory: library.directory,
          contentChangedAt: library.contentChangedAt,
          hidden: library.hidden,
          Location: library.Location,
        });
      }
    }
    return libraryArray;
  }

  async GetPlexMovies(
    servers = this.plexServers,
    libraries = this.plexLibraries,
    searchParams = null
  ) {
    let movieLibraryContent = [];
    for (const server of servers) {
      let connectionUri = server.relayConnection;
      if (server.localConnection) {
        connectionUri = server.localConnection;
      }
      for (const library of libraries.filter(
        (Obj) =>
          Obj.server.clientIdentifier === server.clientIdentifier &&
          Obj.type === "movie"
      )) {
        let response = await axios({
          method: "GET",
          url:
            connectionUri.uri +
            "/library/sections/" +
            library?.key +
            "/all?" +
            qs.stringify(searchParams) +
            qs.stringify({
              type: 1,
              "X-Plex-Token": server?.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        for (const data of response.data.MediaContainer.Metadata) {
          movieLibraryContent.push({
            server: server,
            library: library,
            ratingKey: data.ratingKey,
            key: data.key,
            guid: data.guid,
            studio: data.studio,
            type: data.type,
            title: data.title,
            contentRating: data.contentRating,
            summary: data.summary,
            rating: data.rating,
            audienceRating: data.audienceRating,
            year: data.year,
            tagline: data.tagline,
            thumb: data.thumb,
            art: data.art,
            duration: data.duration,
            originallyAvailableAt: data.originallyAvailableAt,
            addedAt: data.addedAt,
            updatedAt: data.updatedAt,
            audienceRatingImage: data.audienceRatingImage,
            primaryExtraKey: data.primaryExtraKey,
            ratingImage: data.ratingImage,
            Media: data.Media,
            Genre: data.Genre,
            Director: data.Director,
            Writer: data.Writer,
            Country: data.Country,
            Role: data.Role,
          });
        }
      }
    }
    return movieLibraryContent;
  }

  async GetPlexArtists(
    servers = this.plexServers,
    libraries = this.plexLibraries,
    searchParams = null
  ) {
    let artistLibraryContent = [];
    for (const server of servers) {
      let connectionUri = server.relayConnection;
      if (server.localConnection) {
        connectionUri = server.localConnection;
      }
      for (const library of libraries.filter(
        (Obj) =>
          Obj.server.clientIdentifier === server.clientIdentifier &&
          Obj.type === "artist"
      )) {
        let response = await axios({
          method: "GET",
          url:
            connectionUri.uri +
            "/library/sections/" +
            library?.key +
            "/all?" +
            qs.stringify(searchParams) +
            qs.stringify({
              "X-Plex-Token": server.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        for (const data of response.data.MediaContainer.Metadata) {
          artistLibraryContent.push({
            server: server,
            library: library,
            ratingKey: data.ratingKey,
            key: data.key,
            guid: data.guid,
            type: data.type,
            title: data.title,
            summary: data.summary,
            index: data.index,
            thumb: data.thumb,
            art: data.art,
            addedAt: data.addedAt,
            updatedAt: data.updatedAt,
            Genre: data.Genre,
            Country: data.Country,
          });
        }
      }
    }

    return artistLibraryContent;
  }

  async GetPlexAlbums(
    servers = this.plexServers,
    libraries = this.plexLibraries,
    searchParams = null
  ) {
    let albumLibraryContent = [];
    for (const server of servers) {
      let connectionUri = server.relayConnection;
      if (server.localConnection) {
        connectionUri = server.localConnection;
      }
      for (const library of libraries.filter(
        (Obj) =>
          Obj.server.clientIdentifier === server.clientIdentifier &&
          Obj.type === "artist"
      )) {
        let response = await axios({
          method: "GET",
          url:
            connectionUri.uri +
            "/library/sections/" +
            library?.key +
            "/all?" +
            qs.stringify(searchParams) +
            qs.stringify({
              type: 9,
              "X-Plex-Token": server?.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        for (const data of response.data.MediaContainer.Metadata) {
          albumLibraryContent.push({
            server: server,
            library: library,
            addedAt: data.addedAt,
            guid: data.guid,
            index: data.index,
            key: data.key,
            loudnessAnalysisVersion: data.loudnessAnalysisVersion,
            musicAnalysisVersion: data.musicAnalysisVersion,
            originallyAvailableAt: data.originallyAvailableAt,
            parentGuid: data.parentGuid,
            parentKey: data.parentKey,
            parentRatingKey: data.parentRatingKey,
            parentThumb: data.parentThumb,
            parentTitle: data.parentTitle,
            ratingKey: data.ratingKey,
            summary: data.summary,
            thumb: data.thumb,
            title: data.title,
            type: data.type,
            updatedAt: data.updatedAt,
            year: data.year,
          });
        }
      }
    }
    return albumLibraryContent;
  }

  async GetPlexSongs(
    servers = this.plexServers,
    libraries = this.plexLibraries,
    searchParams = null
  ) {
    let songLibraryContent = [];
    for (const server of servers) {
      let connectionUri = server.relayConnection;
      if (server.localConnection) {
        connectionUri = server.localConnection;
      }
      for (const library of libraries.filter(
        (Obj) =>
          Obj.server.clientIdentifier === server.clientIdentifier &&
          Obj.type === "artist"
      )) {
        let response = await axios({
          method: "GET",
          url:
            connectionUri.uri +
            "/library/sections/" +
            library?.key +
            "/all?" +
            qs.stringify(searchParams) +
            qs.stringify({
              type: 10,
              "X-Plex-Token": server?.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        for (const data of response.data.MediaContainer.Metadata) {
          songLibraryContent.push({
            server: server,
            library: library,
            ratingKey: data.ratingKey,
            key: data.key,
            parentRatingKey: data.parentRatingKey,
            grandparentRatingKey: data.grandparentRatingKey,
            guid: data.guid,
            parentGuid: data.parentGuid,
            grandparentGuid: data.grandparentGuid,
            type: data.type,
            title: data.title,
            grandparentKey: data.grandparentKey,
            parentKey: data.parentKey,
            grandparentTitle: data.grandparentTitle,
            parentTitle: data.parentTitle,
            originalTitle: data.originalTitle,
            summary: data.summary,
            index: data.index,
            parentIndex: data.parentIndex,
            thumb: data.thumb,
            parentThumb: data.parentThumb,
            grandparentThumb: data.grandparentThumb,
            duration: data.duration,
            addedAt: data.addedAt,
            updatedAt: data.updatedAt,
            musicAnalysisVersion: data.musicAnalysisVersion,
            Media: data.Media,
          });
        }
      }
    }
    return songLibraryContent;
  }

  async GetPlexShows(
    servers = this.plexServers,
    libraries = this.plexLibraries,
    searchParams = null
  ) {
    let tvShowLibraryContent = [];
    for (const server of servers) {
      let connectionUri = server.relayConnection;
      if (server.localConnection) {
        connectionUri = server.localConnection;
      }
      for (const showLibrary of libraries.filter(
        (Obj) =>
          Obj.server.clientIdentifier === server.clientIdentifier &&
          Obj.type === "show"
      )) {
        let response = await axios({
          method: "GET",
          url:
            connectionUri.uri +
            "/library/sections/" +
            showLibrary?.key +
            "/all?" +
            qs.stringify(searchParams) +
            qs.stringify({
              type: 2,
              "X-Plex-Token": server?.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        for (const data of response.data.MediaContainer.Metadata) {
          tvShowLibraryContent.push({
            server: server,
            library: showLibrary,
            ratingKey: data.ratingKey,
            key: data.key,
            guid: data.guid,
            studio: data.studio,
            type: data.type,
            title: data.title,
            contentRating: data.contentRating,
            summary: data.summary,
            index: data.index,
            rating: data.rating,
            audienceRating: data.audienceRating,
            year: data.year,
            tagline: data.tagline,
            thumb: data.thumb,
            art: data.art,
            theme: data.theme,
            duration: data.duration,
            originallyAvailableAt: data.originallyAvailableAt,
            leafCount: data.leafCount,
            viewedLeafCount: data.viewedLeafCount,
            childCount: data.childCount,
            addedAt: data.addedAt,
            updatedAt: data.updatedAt,
            audienceRatingImage: data.audienceRatingImage,
            primaryExtraKey: data.primaryExtraKey,
            ratingImage: data.ratingImage,
            Media: data.Media,
            Genre: data.Genre,
            Country: data.Country,
            Role: data.Role,
          });
        }
      }
    }
    return tvShowLibraryContent;
  }

  async GetPlexSeasons(
    servers = this.plexServers,
    libraries = this.plexLibraries,
    searchParams = null
  ) {
    let seasonArray = [];
    for (const server of servers) {
      let connectionUri = server.relayConnection;
      if (server.localConnection) {
        connectionUri = server.localConnection;
      }
      for (const showLibrary of libraries.filter(
        (Obj) =>
          Obj.server.clientIdentifier === server.clientIdentifier &&
          Obj.type === "show"
      )) {
        let response = await axios({
          method: "GET",
          url:
            connectionUri.uri +
            "/library/sections/" +
            showLibrary?.key +
            "/all?" +
            qs.stringify(searchParams) +
            qs.stringify({
              type: 3,
              "X-Plex-Token": server?.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        for (const season of response.data.MediaContainer.Metadata) {
          seasonArray.push(season);
        }
      }
    }
    return seasonArray;
  }

  async GetPlexEpisodes(
    servers = this.plexServers,
    libraries = this.plexLibraries,
    searchParams = null
  ) {
    let episodeLibrary = [];
    for (const server of servers) {
      let connectionUri = server.relayConnection;
      if (server.localConnection) {
        connectionUri = server.localConnection;
      }
      for (const showLibrary of libraries.filter(
        (Obj) =>
          Obj.server.clientIdentifier === server.clientIdentifier &&
          Obj.type === "show"
      )) {
        let response = await axios({
          method: "GET",
          url:
            connectionUri.uri +
            "/library/sections/" +
            showLibrary?.key +
            "/all?" +
            qs.stringify(searchParams) +
            qs.stringify({
              type: 4,
              "X-Plex-Token": server?.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        for (const episode of response.data.MediaContainer.Metadata) {
          episodeLibrary.push(episode);
        }
      }
    }
    return episodeLibrary;
  }
}
