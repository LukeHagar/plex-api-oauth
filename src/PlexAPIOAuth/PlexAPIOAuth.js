import { PlexOauth } from "plex-oauth";
import { v4 } from "uuid";
import axios from "axios";
import qs from "qs";
// import InfiniteScroll from "react-infinite-scroller";
import { useState, useEffect } from "react";
import { GeneratePlexClientInformation } from "..";

export async function PlexLogin(
  plexClientInformation = GeneratePlexClientInformation()
) {
  var plexOauth = new PlexOauth(plexClientInformation);
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

  let authToken = await plexOauth
    .checkForAuthToken(pinId, 1000, 10)
    .catch((err) => {
      throw err;
    });

  if (authToken !== null) {
    console.log("Plex Authentication Successful");
  } else {
    console.log("Plex Authentication Failed");
  }
  return {
    plexTVAuthToken: authToken,
    plexClientInformation: plexClientInformation,
  };
  // An auth token will only be null if the user never signs into the hosted UI, or you stop checking for a new one before they can log in
}

export async function GetPlexUserData({
  plexClientInformation,
  plexTVAuthToken,
}) {
  let response = await axios({
    method: "GET",
    url:
      "https://plex.tv/api/v2/user?" +
      qs.stringify({
        "X-Plex-Product": plexClientInformation.product,
        "X-Plex-Client-Identifier": plexClientInformation.clientIdentifier,
        "X-Plex-Token": plexTVAuthToken,
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

  if (response?.status === 200) {
    return response.data;
  }
  if (response?.status === 401) {
    return null;
  }
}

export async function GetPlexDevices({
  plexClientInformation,
  plexTVAuthToken,
}) {
  let serverArray = [];
  let response = await axios({
    method: "GET",
    url:
      "https://plex.tv/api/v2/resources?" +
      qs.stringify({
        includeHttps: 1,
        includeRelay: 1,
        includeIPv6: 1,
        "X-Plex-Product": plexClientInformation.product,
        "X-Plex-Client-Identifier": plexClientInformation.clientIdentifier,
        "X-Plex-Token": plexTVAuthToken,
      }),
    headers: { accept: "application/json" },
  }).catch((err) => {
    throw err;
  });
  return response.data;
}

export async function GetPlexServers({
  plexClientInformation,
  plexTVAuthToken,
}) {
  let serverArray = [];
  let response = await axios({
    method: "GET",
    url:
      "https://plex.tv/api/v2/resources?" +
      qs.stringify({
        includeHttps: 1,
        includeRelay: 1,
        includeIPv6: 1,
        "X-Plex-Product": plexClientInformation.product,
        "X-Plex-Client-Identifier": plexClientInformation.clientIdentifier,
        "X-Plex-Token": plexTVAuthToken,
      }),
    headers: { accept: "application/json" },
  }).catch((err) => {
    throw err;
  });
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
  return serverArray;
}

export async function GetPlexLibraries(servers) {
  let libraryArray = [];
  if (typeof servers === Object) {
    console.log("Single Object Detected");
  }
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
  return libraryArray;
}

export async function GetPlexMovieLibraries(servers) {
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

export async function GetPlexMusicLibraries(servers) {
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

export async function GetPlexTVShowLibraries(servers) {
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

export async function GetPlexMovies(searchParams = {}, servers, libraries) {
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
        cancelToken: axios.CancelToken((c) => (cancelToken = c)),
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

export async function GetPlexArtists(searchParams = {}, servers, libraries) {
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
        cancelToken: axios.CancelToken((c) => (cancelToken = c)),
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

export async function GetPlexAlbums(searchParams = {}, servers, libraries) {
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
        cancelToken: axios.CancelToken((c) => this.props.getCancelToken(c)),
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

export async function GetPlexSongs(searchParams = {}, servers, libraries) {
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
        cancelToken: axios.CancelToken((c) => (cancelToken = c)),
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

export async function GetPlexShows(searchParams = {}, servers, libraries) {
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
          connectionUri.uri + "/library/sections/" + showLibrary?.key + "/all",
        headers: { accept: "application/json" },
        params: {
          type: 2,
          ...searchParams,
          "X-Plex-Token": server?.accessToken,
        },
        cancelToken: axios.CancelToken((c) => (cancelToken = c)),
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

export async function GetPlexSeasons(searchParams = {}, servers, libraries) {
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
          connectionUri.uri + "/library/sections/" + showLibrary?.key + "/all",
        headers: { accept: "application/json" },
        params: {
          type: 3,
          ...searchParams,
          "X-Plex-Token": server?.accessToken,
        },
        cancelToken: axios.CancelToken((c) => (cancelToken = c)),
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

export async function GetPlexEpisodes(searchParams = {}, servers, libraries) {
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
          connectionUri.uri + "/library/sections/" + showLibrary?.key + "/all",
        headers: { accept: "application/json" },
        params: {
          type: 4,
          ...searchParams,
          "X-Plex-Token": server?.accessToken,
        },
        cancelToken: axios.CancelToken((c) => (cancelToken = c)),
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

export function fnBrowserDetect() {
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

export function SavePlexSession({ plexClientInformation, plexTVAuthToken }) {
  window.localStorage.setItem(
    "plexSessionData",
    JSON.stringify({
      plexClientInformation: plexClientInformation,
      plexTVAuthToken: plexTVAuthToken,
    })
  );
}

export function LoadPlexSession() {
  return JSON.parse(window.localStorage?.getItem("plexSessionData") || "{}");
}

export function CreatePlexClientInformation(
  clientIdentifier = v4(),
  product = fnBrowserDetect(),
  device = navigator.userAgentData.platform,
  version = navigator.userAgentData.brands[0].version,
  forwardUrl = "",
  platform = "Plex-API-OAuth"
) {
  let plexClientInformation = {
    clientIdentifier: clientIdentifier,
    product: product,
    device: device,
    version: version,
    forwardUrl: forwardUrl,
    platform: platform,
  };
  console.log("Client Information generated successfully");
  return plexClientInformation;
}

export function GetLibraryPages(
  servers,
  libraries,
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
        data = GetPlexArtists(searchParams, servers, libraries);
        break;
      case "albums":
        data = GetPlexAlbums(searchParams, servers, libraries);
        break;
      case "songs":
        data = GetPlexSongs(searchParams, servers, libraries);
        break;
      case "shows":
        data = GetPlexShows(searchParams, servers, libraries);
        break;
      case "seasons":
        data = GetPlexSeasons(searchParams, servers, libraries);
        break;
      case "episodes":
        data = GetPlexEpisodes(searchParams, servers, libraries);
        break;
      case "movies":
        data = GetPlexMovies(searchParams, servers, libraries);
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
  }, [query, pageNumber, libraryType]);
  return { loading, error, items, hasMore };
}
