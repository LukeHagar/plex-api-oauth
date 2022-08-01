import { PlexOauth } from "plex-oauth";
import { v4 } from "uuid";
import axios from "axios";
import qs from "qs";
import { useState, useEffect } from "react";

export async function PlexLogin(plexClientInformation) {
  var plexOauth = new PlexOauth(plexClientInformation);
  let data = await plexOauth.requestHostedLoginURL().catch((err) => {
    throw err;
  });

  let [hostedUILink, pinId] = data;

  console.debug("Plex Auth URL:");
  console.debug(hostedUILink); // UI URL used to log into Plex

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
    console.debug("Plex Authentication Successful");
  } else {
    console.debug("Plex Authentication Failed");
  }
  return authToken;
  // An auth token will only be null if the user never signs into the hosted UI, or you stop checking for a new one before they can log in
}

export async function GetPlexUserData(plexClientInformation, plexTVAuthToken) {
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
      console.debug(error.response.data);
      console.debug(error.response.status);
      console.debug(error.response.headers);
    } else if (error.request) {
      console.debug(error.request);
    } else {
      console.debug("Error", error.message);
    }
    console.debug(error.config);
  });

  if (response?.status === 200) {
    return response.data;
  }
  if (response?.status === 401) {
    return null;
  }
}

export async function GetPlexDevices(plexClientInformation, plexTVAuthToken) {
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

export async function GetPlexServers(plexClientInformation, plexTVAuthToken) {
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

export async function GetPlexLibraries(plexServers, plexLibraries) {
  let libraryArray = [];
  for (const server of plexServers) {
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

export async function GetPlexMovieLibraries(plexServers, plexLibraries) {
  let libraryArray = [];
  for (const server of plexServers) {
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

export async function GetPlexMusicLibraries(plexServers, plexLibraries) {
  let libraryArray = [];
  for (const server of plexServers) {
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

export async function GetPlexTVShowLibraries(plexServers, plexLibraries) {
  let libraryArray = [];
  for (const server of plexServers) {
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

export async function GetPlexMovies(
  searchParams = {},
  plexServers,
  plexLibraries
) {
  let movieLibraryContent = [];
  for (const server of servers) {
    let connectionUri = server.relayConnection;
    if (server.localConnection) {
      connectionUri = server.localConnection;
    }
    for (const library of plexLibraries.filter(
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
        headers: { accept: "application/json" },
      }).catch((e) => {
        if (axios.isCancel(e)) return;
        throw e;
      });
      console.debug(response.data);
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

export async function GetPlexArtists(
  searchParams = {},
  plexServers,
  plexLibraries
) {
  let artistLibraryContent = [];
  for (const server of plexServers) {
    let connectionUri = server.relayConnection;
    if (server.localConnection) {
      connectionUri = server.localConnection;
    }
    for (const library of plexLibraries.filter(
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
      }).catch((err) => {
        throw err;
      });
      console.debug(response.data);
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

export async function GetPlexAlbums(
  searchParams = {},
  plexServers,
  plexLibraries
) {
  let albumLibraryContent = [];
  for (const server of plexServers) {
    let connectionUri = server.relayConnection;
    if (server.localConnection) {
      connectionUri = server.localConnection;
    }
    for (const library of plexLibraries.filter(
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
      }).catch((err) => {
        throw err;
      });
      console.debug(response.data);
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

export async function GetPlexSongs(
  searchParams = {},
  plexServers,
  plexLibraries
) {
  let songLibraryContent = [];
  for (const server of plexServers) {
    let connectionUri = server.relayConnection;
    if (server.localConnection) {
      connectionUri = server.localConnection;
    }
    for (const library of plexLibraries.filter(
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
      }).catch((err) => {
        if (axios.isCancel(err)) return;
        throw err;
      });
      console.debug(response);
      try {
        console.debug(response.data);
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

export async function GetPlexShows(
  searchParams = {},
  plexServers,
  plexLibraries
) {
  let tvShowLibraryContent = [];
  for (const server of plexServers) {
    let connectionUri = server.relayConnection;
    if (server.localConnection) {
      connectionUri = server.localConnection;
    }
    for (const showLibrary of plexLibraries.filter(
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
      }).catch((err) => {
        throw err;
      });
      console.debug(response.data);
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

export async function GetPlexSeasons(
  searchParams = {},
  plexServers,
  plexLibraries
) {
  let seasonArray = [];
  for (const server of plexServers) {
    let connectionUri = server.relayConnection;
    if (server.localConnection) {
      connectionUri = server.localConnection;
    }
    for (const showLibrary of plexLibraries.filter(
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

export async function GetPlexEpisodes(
  searchParams = {},
  plexServers,
  plexLibraries
) {
  let episodeLibrary = [];
  for (const server of plexServers) {
    let connectionUri = server.relayConnection;
    if (server.localConnection) {
      connectionUri = server.localConnection;
    }
    for (const showLibrary of plexLibraries.filter(
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

export function FnBrowserDetect() {
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

export function SavePlexSession(plexClientInformation, plexTVAuthToken) {
  window.localStorage.setItem(
    "plexServers, plexLibraries",
    JSON.stringify({
      plexClientInformation: plexClientInformation,
      plexTVAuthToken: plexTVAuthToken,
    })
  );
}

export function LoadPlexSession() {
  return JSON.parse(
    window.localStorage?.getItem("plexServers, plexLibraries") || "{}"
  );
}

export function CreatePlexClientInformation(
  clientIdentifier = v4(),
  product = FnBrowserDetect(),
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
  console.debug("Client Information generated successfully");
  return plexClientInformation;
}

export async function GetLibraryPages(
  plexServers,
  plexLibraries,
  libraryType = "",
  pageNumber = 0,
  chunkSize = 50
) {
  let data = null;
  let items = [];
  let hasMore = false;

  let searchParams = {
    "X-Plex-Container-Start": pageNumber * chunkSize,
    "X-Plex-Container-Size": chunkSize,
  };

  console.debug(searchParams);

  switch (libraryType) {
    case "artists":
      data = await GetPlexArtists(searchParams, plexServers, plexLibraries);
      break;
    case "albums":
      data = await GetPlexAlbums(searchParams, plexServers, plexLibraries);
      break;
    case "songs":
      data = await GetPlexSongs(searchParams, plexServers, plexLibraries);
      break;
    case "shows":
      data = await GetPlexShows(searchParams, plexServers, plexLibraries);
      break;
    case "seasons":
      data = await GetPlexSeasons(searchParams, plexServers, plexLibraries);
      break;
    case "episodes":
      data = await GetPlexEpisodes(searchParams, plexServers, plexLibraries);
      break;
    case "movies":
      data = await GetPlexMovies(searchParams, plexServers, plexLibraries);
      break;
  }
  console.debug(data);
  try {
    items = data;
    hasMore = data.length === chunkSize;
    console.debug({ items, hasMore });
  } catch {
    items = [];
    hasMore = false;
  }
  return { items, hasMore };
}
