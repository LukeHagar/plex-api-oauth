import { PlexOauth } from "plex-oauth";
import { v4 } from "uuid";
import axios from "axios";
import qs from "qs";
import InfiniteScroll from "react-infinite-scroller";
import { useState, useEffect } from "react";

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
  cancelToken;
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
    plexDevices = [],
    cancelToken = null
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
    this.cancelToken = cancelToken;

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

  fnBrowserDetect() {
    let userAgent = navigator.userAgent;
    let browserName;

    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "edge";
    } else {
      browserName = "No browser detection";
    }
    return browserName;
  }

  GenerateClientId() {
    this.clientId = v4();
    this.plexClientInformation.clientIdentifier = this.clientId;
  }

  GenerateClientInformation() {
    if (typeof navigator !== "undefined") {
      this.clientId = v4();
      this.product = this.fnBrowserDetect;
      this.device = navigator.userAgentData.platform;
      this.version = navigator.userAgentData.brands[0].version;
      this.plexClientInformation = {
        clientIdentifier: this.clientId,
        product: this.product,
        device: this.device,
        version: this.version,
        forwardUrl: this.forwardUrl,
        platform: this.platform,
      };
      console.log("Client Information generated successfully");
    }
    throw "Unable to detect Client";
  }

  async PlexLogin() {
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
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
      console.log(error.config);
    });

    if (response.status === 200) {
      this.plexTVUserData = response.data;
      return this.plexTVUserData;
    }
    if (response.status === 401) {
      return null;
    }
  }

  async GetPlexServers(searchParams = {}, filter = {}) {
    let serverArray = [];
    let response = await axios({
      method: "GET",
      url:
        "https://plex.tv/api/v2/resources?" +
        qs.stringify({
          ...searchParams,
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
    for (const server of response.data
      .filter((Obj) => Obj.product === "Plex Media Server")
      .filter((Obj) => {
        for (var key in filter) {
          if (Obj[key] === filter[key]) {
            return Obj;
          }
        }
      })) {
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
    searchParams = {},
    servers = this.plexServers,
    libraries = this.plexLibraries
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
          url: connectionUri.uri + "/library/sections/" + library?.key + "/all",
          params: {
            type: 1,
            ...searchParams,
            "X-Plex-Token": server?.accessToken,
          },
          cancelToken: axios.CancelToken((c) => (this.cancelToken = c)),
          headers: { accept: "application/json" },
        }).catch((e) => {
          if (axios.isCancel(e)) return;
          throw e;
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
    searchParams = {},
    servers = this.plexServers,
    libraries = this.plexLibraries
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
          url: connectionUri.uri + "/library/sections/" + library?.key + "/all",
          headers: { accept: "application/json" },
          params: {
            type: 8,
            ...searchParams,
            "X-Plex-Token": server.accessToken,
          },
          cancelToken: axios.CancelToken((c) => (this.cancelToken = c)),
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
    searchParams = {},
    servers = this.plexServers,
    libraries = this.plexLibraries
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
          url: connectionUri.uri + "/library/sections/" + library?.key + "/all",
          headers: { accept: "application/json" },
          params: {
            type: 9,
            ...searchParams,
            "X-Plex-Token": server.accessToken,
          },
          cancelToken: axios.CancelToken((c) => (this.cancelToken = c)),
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
    searchParams = {},
    servers = this.plexServers,
    libraries = this.plexLibraries
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
          url: connectionUri.uri + "/library/sections/" + library?.key + "/all",
          headers: { accept: "application/json" },
          params: {
            type: 10,
            ...searchParams,
            "X-Plex-Token": server.accessToken,
          },
          cancelToken: axios.CancelToken((c) => (this.cancelToken = c)),
        }).catch((err) => {
          if (axios.isCancel(err)) return;
          throw err;
        });
        console.log(response);
        try {
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
        } catch {}
      }
    }
    return songLibraryContent;
  }

  async GetPlexShows(
    searchParams = {},
    servers = this.plexServers,
    libraries = this.plexLibraries
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
            "/all",
          headers: { accept: "application/json" },
          params: {
            type: 2,
            ...searchParams,
            "X-Plex-Token": server?.accessToken,
          },
          cancelToken: axios.CancelToken((c) => (this.cancelToken = c)),
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
    searchParams = {},
    servers = this.plexServers,
    libraries = this.plexLibraries
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
            "/all",
          headers: { accept: "application/json" },
          params: {
            type: 3,
            ...searchParams,
            "X-Plex-Token": server?.accessToken,
          },
          cancelToken: axios.CancelToken((c) => (this.cancelToken = c)),
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
    searchParams = {},
    servers = this.plexServers,
    libraries = this.plexLibraries
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
            "/all",
          headers: { accept: "application/json" },
          params: {
            type: 4,
            ...searchParams,
            "X-Plex-Token": server?.accessToken,
          },
          cancelToken: axios.CancelToken((c) => (this.cancelToken = c)),
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

  GetLibraryPages(
    libraryType = "",
    query = null,
    pageNumber = 0,
    chunkSize = 50
  ) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(false);

    let data = null;

    useEffect(() => {
      setItems([]);
    }, [query, libraryType]);

    useEffect(() => {
      setLoading(true);
      setError(false);
      let searchParams = {
        "X-Plex-Container-Start": pageNumber * chunkSize,
        "X-Plex-Container-Size": chunkSize,
      };
      if (query !== null) {
        searchParams = {
          title: query,
          "X-Plex-Container-Start": pageNumber * chunkSize,
          "X-Plex-Container-Size": chunkSize,
        };
      }

      switch (libraryType) {
        case "artists":
          data = this.GetPlexArtists(searchParams);
          break;
        case "albums":
          data = this.GetPlexAlbums(searchParams);
          break;
        case "songs":
          data = this.GetPlexSongs(searchParams);
          break;
        case "shows":
          data = this.GetPlexShows(searchParams);
          break;
        case "seasons":
          data = this.GetPlexSeasons(searchParams);
          break;
        case "episodes":
          data = this.GetPlexEpisodes(searchParams);
          break;
        case "movies":
          data = this.GetPlexMovies(searchParams);
          break;
      }
      try {
        data
          .then((finalData) => {
            setItems((previousData) => {
              return [...previousData, ...finalData];
            });
            setHasMore(finalData.length > 0);
            setLoading(false);
            console.log({ loading, error, items, hasMore });
          })
          .catch((e) => {
            setError(e);
          });
      } catch {}
      return () => {
        if (this.cancelToken) {
          this.cancelToken();
        }
      };
    }, [query, pageNumber]);
    return { loading, error, items, hasMore };
  }
}
