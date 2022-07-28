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
  plexArtistLibraries;
  plexAlbumLibraries;
  plexSongLibraries;
  plexMusicLibraries;
  plexMovieLibraries;
  plexTVShowLibraries;
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
    plexArtistLibraries = [],
    plexAlbumLibraries = [],
    plexSongLibraries = [],
    plexMusicLibraries = [],
    plexMovieLibraries = [],
    plexTVShowLibraries = [],
    plexLibraryContent = [],
    plexMovieLibraryContent = [],
    plexTVShowLibraryContent = [],
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
    this.plexLibraries = plexLibraries;
    this.plexArtistLibraries = plexArtistLibraries;
    this.plexAlbumLibraries = plexAlbumLibraries;
    this.plexSongLibraries = plexSongLibraries;
    this.plexMusicLibraries = plexMusicLibraries;
    this.plexMovieLibraries = plexMovieLibraries;
    this.plexTVShowLibraries = plexTVShowLibraries;
    this.plexLibraryContent = plexLibraryContent;
    this.plexMovieLibraryContent = plexMovieLibraryContent;
    this.plexTVShowLibraryContent = plexTVShowLibraryContent;
    this.plexDevices = plexDevices;

    this.plexClientInformation = {
      clientIdentifier: this.clientId, // This is a unique identifier used to identify your app with Plex. - If none is provided a new one is generated and saved locally
      product: this.product, // Name of your application - Defaults to Plex-API-OAuth
      device: this.device, // The type of device your application is running on - Defaults to "Web Client"
      version: this.version, // Version of your application - Defaults to 1
      forwardUrl: this.forwardUrl, // Url to forward back to after signing in - Defaults to an empty string
      platform: this.platform, // Platform your application runs on - Defaults to 'Web'
    };
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
    this.plexArtistLibraries = [];
    this.plexAlbumLibraries = [];
    this.plexSongLibraries = [];
    this.plexMusicLibraries = [];
    this.plexMovieLibraries = [];
    this.plexTVShowLibraries = [];
    this.plexLibraryContent = [];
    this.plexMovieLibraryContent = [];
    this.plexTVShowLibraryContent = [];
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
    plexLibraries = [],
    plexLibraryContent = [],
    plexArtistLibraries = [],
    plexAlbumLibraries = [],
    plexSongLibraries = [],
    plexMusicLibraries = [],
    plexMovieLibraries = [],
    plexTVShowLibraries = [],
    plexMovieLibraryContent = [],
    plexTVShowLibraryContent = [],
    plexDevices = [],
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
    this.plexLibraries = plexLibraries;
    this.plexArtistLibraries = plexArtistLibraries;
    this.plexAlbumLibraries = plexAlbumLibraries;
    this.plexSongLibraries = plexSongLibraries;
    this.plexMusicLibraries = plexMusicLibraries;
    this.plexMovieLibraries = plexMovieLibraries;
    this.plexTVShowLibraries = plexTVShowLibraries;
    this.plexLibraryContent = plexLibraryContent;
    this.plexMovieLibraryContent = plexMovieLibraryContent;
    this.plexTVShowLibraryContent = plexTVShowLibraryContent;
    this.plexDevices = plexDevices;
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
      plexLibraries: this.plexLibraries,
      plexMusicLibraries: this.plexMusicLibraries,
      plexArtistLibraries: this.plexArtistLibraries,
      plexAlbumLibraries: this.plexAlbumLibraries,
      plexSongLibraries: this.plexSongLibraries,
      plexSeasonLibraries: this.plexSeasonLibraries,
      plexEpisodeLibraries: this.plexEpisodeLibraries,
      plexMovieLibraries: this.plexMovieLibraries,
      plexTVShowLibraries: this.plexTVShowLibraries,
      plexLibraryContent: this.plexLibraryContent,
      plexMovieLibraryContent: this.plexMovieLibraryContent,
      plexTVShowLibraryContent: this.plexTVShowLibraryContent,
      plexDevices: this.plexDevices,
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
      return this.plexTVUserData;
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
          productVersion: Obj.productVersion,
          platform: Obj.platform,
          platformVersion: Obj.platformVersion,
          device: Obj.device,
          clientIdentifier: Obj.clientIdentifier,
          createdAt: Obj.createdAt,
          lastSeenAt: Obj.lastSeenAt,
          localConnections: Obj.connections.filter(
            (connection) => connection.local === true
          ),
          provides: Obj.provides,
          ownerId: Obj.ownerId,
          sourceTitle: Obj.sourceTitle,
          publicAddress: Obj.publicAddress,
          accessToken: Obj.accessToken,
          owned: Obj.owned,
          home: Obj.home,
          synced: Obj.synced,
          relay: Obj.relay,
          relayConnections: Obj.connections.filter(
            (connection) => connection.relay === true
          ),
          presence: Obj.presence,
          httpsRequired: Obj.httpsRequired,
          publicAddressMatches: Obj.publicAddressMatches,
          dnsRebindingProtection: Obj.dnsRebindingProtection,
          natLoopbackSupported: Obj.natLoopbackSupported,
          connections: Obj.connections,
        };
      });
    return this.plexServers;
  }

  async GetPlexLibraries() {
    let libraryArray = [];
    for (const server of this.plexServers) {
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
    this.plexMusicLibraries = libraryArray.filter(
      (Obj) => Obj.type === "artist"
    );
    this.plexMovieLibraries = libraryArray.filter(
      (Obj) => Obj.type === "movie"
    );
    this.plexTVShowLibraries = libraryArray.filter(
      (Obj) => Obj.type === "show"
    );
    return this.plexLibraries;
  }

  async GetPlexMovieLibraryContent() {
    let movieLibraryContent = [];
    for (const server of this.plexServers) {
      for (const library of this.plexLibraries.filter(
        (Obj) =>
          Obj.server.clientIdentifier === server.clientIdentifier &&
          Obj.type === "movie"
      )) {
        let response = await axios({
          method: "GET",
          url:
            server?.relayConnections[0].uri +
            "/library/sections/" +
            library?.key +
            "/all?" +
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
    this.plexMovieLibraryContent = movieLibraryContent;
    return movieLibraryContent;
  }
  async GetPlexMusicLibraryContent() {
    let artistLibraryContent = [];
    let albumLibraryContent = [];
    let songLibraryContent = [];
    for (const server of this.plexServers) {
      for (const library of this.plexLibraries.filter(
        (Obj) =>
          Obj.server.clientIdentifier === server.clientIdentifier &&
          Obj.type === "artist"
      )) {
        let response = await axios({
          method: "GET",
          url:
            server?.relayConnections[0].uri +
            "/library/sections/" +
            library?.key +
            "/all?" +
            qs.stringify({
              "X-Plex-Token": server?.accessToken,
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
      for (const musicLibrary of this.plexMusicLibraries.filter(
        (Obj) => Obj.server.clientIdentifier === server.clientIdentifier
      )) {
        let response = await axios({
          method: "GET",
          url:
            server?.relayConnections[0].uri +
            "/library/sections/" +
            musicLibrary?.key +
            "/all?" +
            qs.stringify({
              type: 9,
              "X-Plex-Token": server?.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        for (const data of response.data.MediaContainer.Metadata) {
          let tempObject = data;
          albumLibraryContent.push(tempObject);
        }
        response = await axios({
          method: "GET",
          url:
            server?.relayConnections[0].uri +
            "/library/sections/" +
            musicLibrary?.key +
            "/all?" +
            qs.stringify({
              type: 10,
              "X-Plex-Token": server?.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        for (const data of response.data.MediaContainer.Metadata) {
          let tempObject = {
            server: server,
            library: musicLibrary,
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
          };
          songLibraryContent.push(tempObject);
        }
      }
    }
    this.plexArtistLibraries = artistLibraryContent;
    this.plexAlbumLibraries = albumLibraryContent;
    this.plexSongLibraries = songLibraryContent;
    return artistLibraryContent;
  }
  async GetPlexTVShowLibraryContent() {
    let tvShowLibraryContent = [];
    let seasonLibraryContent = [];
    let episodeLibraryContent = [];
    for (const server of this.plexServers) {
      for (const showLibrary of this.plexTVShowLibraries.filter(
        (Obj) => Obj.server.clientIdentifier === server.clientIdentifier
      )) {
        let response = await axios({
          method: "GET",
          url:
            server?.relayConnections[0].uri +
            "/library/sections/" +
            showLibrary?.key +
            "/all?" +
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

        response = await axios({
          method: "GET",
          url:
            server?.relayConnections[0].uri +
            "/library/sections/" +
            showLibrary?.key +
            "/all?" +
            qs.stringify({
              type: 3,
              "X-Plex-Token": server?.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        for (const data of response.data.MediaContainer.Metadata) {
          let tempObject = data;
          seasonLibraryContent.push(tempObject);
        }

        response = await axios({
          method: "GET",
          url:
            server?.relayConnections[0].uri +
            "/library/sections/" +
            showLibrary?.key +
            "/all?" +
            qs.stringify({
              type: 4,
              "X-Plex-Token": server?.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        for (const data of response.data.MediaContainer.Metadata) {
          let tempObject = data;
          episodeLibraryContent.push(tempObject);
        }
      }
    }
    this.plexTVShowLibraryContent = tvShowLibraryContent;
    this.plexSeasonLibraries = seasonLibraryContent;
    this.episodeLibraryContent = episodeLibraryContent;
    return tvShowLibraryContent;
  }

  async GetPlexTVShowSeasons(server, searchString) {
    let responseArray = [];
    let queryArray = this.plexServers;
    if (server) {
      queryArray = this.plexServers.filter((Obj) => (Obj = server));
    }
    if (searchString) {
    }
    for (const server of queryArray) {
      for (const showLibrary of this.plexTVShowLibraries.filter(
        (Obj) => Obj.server.clientIdentifier === server.clientIdentifier
      )) {
        let response = await axios({
          method: "GET",
          url:
            server?.relayConnections[0].uri +
            "/library/sections/" +
            showLibrary?.key +
            "/all?" +
            qs.stringify({
              title: searchString || null,
              type: 3,
              "X-Plex-Token": server?.accessToken,
            }),
          headers: { accept: "application/json" },
        }).catch((err) => {
          throw err;
        });
        responseArray.push(...response.data.MediaContainer.Metadata);
      }
    }
    return responseArray;
  }
}
