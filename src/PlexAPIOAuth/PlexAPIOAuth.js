import { PlexOauth } from "plex-oauth";
import { v4 } from "uuid";
import axios from "axios";
import qs from "qs";

console.log(
  "THIS PACKAGE IS DEPRECATED. USE `@lukehagar/plexjs` https://github.com/LukeHagar/plexjs INSTEAD"
);

export function CreatePlexClientInformation({
  clientIdentifier = v4(),
  product = FnBrowserDetect(),
  device = navigator.userAgentData.platform,
  version = navigator.userAgentData.brands[0].version,
  forwardUrl = "",
  platform = "Plex-API-OAuth",
}) {
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
  console.debug("Plex Devices Reponse Query:");
  console.debug(response.data);
  for (const server of response.data) {
    let localConnection = {};
    let serverCapabilities = {};
    let preferredConnection = {};
    let relayConnection = {};
    if (server.connections) {
      if (server.connections.length > 0) {
        relayConnection = server.connections.filter(
          (connection) => connection.relay === true
        )[0];
        preferredConnection = server.connections.filter(
          (connection) => connection.relay === true
        )[0];
        for (const connection of server.connections.filter(
          (entry) => entry.local === true
        )) {
          if (localConnection === null && serverCapabilities === null) {
            try {
              let capabilitiesresponse = await axios({
                method: "GET",
                url:
                  connection.uri +
                  "/?" +
                  qs.stringify({ "X-Plex-Token": server.accessToken }),
                timeout: 1000,
              });
              localConnection = connection;
              serverCapabilities = capabilitiesresponse.data.MediaContainer;
              preferredConnection = connection;
            } catch {}
          }
        }
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
      relayConnection: relayConnection,
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
  console.debug("Plex Servers Reponse Query:");
  console.debug(response.data);
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
          let capabilitiesresponse = await axios({
            method: "GET",
            url:
              connection.uri +
              "/?" +
              qs.stringify({ "X-Plex-Token": server.accessToken }),
            timeout: 1000,
          });
          localConnection = connection;
          serverCapabilities = capabilitiesresponse.data.MediaContainer;
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

export async function GetPlexLibraries(plexServers) {
  let libraryArray = [];
  for (const server of plexServers) {
    let response = await axios({
      method: "GET",
      url:
        server.preferredConnection.uri +
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
        server: server.clientIdentifier,
        allowSync: library.allowSync,
        art: library.art,
        composite: library.composite,
        filters: library.filters,
        refreshing: library.refreshing,
        thumb:
          server.preferredConnection.uri +
          "/photo/:/transcode?" +
          qs.stringify({
            width: 240,
            height: 240,
            minSize: 1,
            upscale: 1,
            url: library.thumb + "?X-Plex-Token=" + server.accessToken,
            "X-Plex-Token": server.accessToken,
          }),
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
    let response = await axios({
      method: "GET",
      url:
        server.preferredConnection.uri +
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
        thumb:
          server.preferredConnection.uri +
          "/photo/:/transcode?" +
          qs.stringify({
            width: 240,
            height: 240,
            minSize: 1,
            upscale: 1,
            url: library.thumb + "?X-Plex-Token=" + server.accessToken,
            "X-Plex-Token": server.accessToken,
          }),
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
    let response = await axios({
      method: "GET",
      url:
        server.preferredConnection.uri +
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
        thumb:
          server.preferredConnection.uri +
          "/photo/:/transcode?" +
          qs.stringify({
            width: 240,
            height: 240,
            minSize: 1,
            upscale: 1,
            url: library.thumb + "?X-Plex-Token=" + server.accessToken,
            "X-Plex-Token": server.accessToken,
          }),
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
    let response = await axios({
      method: "GET",
      url:
        server.preferredConnection.uri +
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
        thumb:
          server.preferredConnection.uri +
          "/photo/:/transcode?" +
          qs.stringify({
            width: 240,
            height: 240,
            minSize: 1,
            upscale: 1,
            url: library.thumb + "?X-Plex-Token=" + server.accessToken,
            "X-Plex-Token": server.accessToken,
          }),
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
  for (const server of plexServers) {
    for (const library of plexLibraries.filter(
      (Obj) => Obj.server === server.clientIdentifier && Obj.type === "movie"
    )) {
      let response = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/library/sections/" +
          library?.key +
          "/all",
        params: {
          type: 1,
          ...searchParams,
          sort: "titleSort",
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
          server: server.clientIdentifier,
          library: library.uuid,
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
          thumb:
            server.preferredConnection.uri +
            "/photo/:/transcode?" +
            qs.stringify({
              width: 240,
              height: 240,
              minSize: 1,
              upscale: 1,
              url: data.thumb + "?X-Plex-Token=" + server.accessToken,
              "X-Plex-Token": server.accessToken,
            }),
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
    for (const library of plexLibraries.filter(
      (Obj) => Obj.server === server.clientIdentifier && Obj.type === "artist"
    )) {
      let response = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/library/sections/" +
          library?.key +
          "/all",
        headers: { accept: "application/json" },
        params: {
          type: 8,
          ...searchParams,
          sort: "titleSort",
          "X-Plex-Token": server.accessToken,
        },
      }).catch((err) => {
        throw err;
      });
      console.debug(response.data);
      for (const data of response.data.MediaContainer.Metadata) {
        artistLibraryContent.push({
          server: server.clientIdentifier,
          library: library.uuid,
          ratingKey: data.ratingKey,
          key: data.key,
          guid: data.guid,
          type: data.type,
          title: data.title,
          summary: data.summary,
          index: data.index,
          thumb:
            server.preferredConnection.uri +
            "/photo/:/transcode?" +
            qs.stringify({
              width: 240,
              height: 240,
              minSize: 1,
              upscale: 1,
              url: data.thumb + "?X-Plex-Token=" + server.accessToken,
              "X-Plex-Token": server.accessToken,
            }),
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
    for (const library of plexLibraries.filter(
      (Obj) => Obj.server === server.clientIdentifier && Obj.type === "artist"
    )) {
      let response = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/library/sections/" +
          library?.key +
          "/all",
        headers: { accept: "application/json" },
        params: {
          type: 9,
          ...searchParams,
          sort: "titleSort",
          "X-Plex-Token": server.accessToken,
        },
      }).catch((err) => {
        throw err;
      });
      console.debug(response.data);
      for (const data of response.data.MediaContainer.Metadata) {
        albumLibraryContent.push({
          server: server.clientIdentifier,
          library: library.uuid,
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
          thumb:
            server.preferredConnection.uri +
            "/photo/:/transcode?" +
            qs.stringify({
              width: 240,
              height: 240,
              minSize: 1,
              upscale: 1,
              url: data.thumb + "?X-Plex-Token=" + server.accessToken,
              "X-Plex-Token": server.accessToken,
            }),
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
    for (const library of plexLibraries.filter(
      (Obj) => Obj.server === server.clientIdentifier && Obj.type === "artist"
    )) {
      let response = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/library/sections/" +
          library?.key +
          "/all",
        headers: { accept: "application/json" },
        params: {
          type: 10,
          ...searchParams,
          sort: "titleSort",
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
            thumb:
              server.preferredConnection.uri +
              "/photo/:/transcode?" +
              qs.stringify({
                width: 240,
                height: 240,
                minSize: 1,
                upscale: 1,
                url: data.thumb + "?X-Plex-Token=" + server.accessToken,
                "X-Plex-Token": server.accessToken,
              }),
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
    for (const showLibrary of plexLibraries.filter(
      (Obj) => Obj.server === server.clientIdentifier && Obj.type === "show"
    )) {
      let response = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/library/sections/" +
          showLibrary?.key +
          "/all",
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
          thumb:
            server.preferredConnection.uri +
            "/photo/:/transcode?" +
            qs.stringify({
              width: 240,
              height: 240,
              minSize: 1,
              upscale: 1,
              url: data.thumb + "?X-Plex-Token=" + server.accessToken,
              "X-Plex-Token": server.accessToken,
            }),
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
    for (const showLibrary of plexLibraries.filter(
      (Obj) => Obj.server === server.clientIdentifier && Obj.type === "show"
    )) {
      let response = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/library/sections/" +
          showLibrary?.key +
          "/all",
        headers: { accept: "application/json" },
        params: {
          type: 3,
          ...searchParams,
          sort: "titleSort",
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
    for (const showLibrary of plexLibraries.filter(
      (Obj) => Obj.server === server.clientIdentifier && Obj.type === "show"
    )) {
      let response = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/library/sections/" +
          showLibrary?.key +
          "/all",
        headers: { accept: "application/json" },
        params: {
          type: 4,
          ...searchParams,
          sort: "titleSort",
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

export async function GetMusicHub(
  plexClientinformation,
  plexServers,
  plexLibraries
) {
  let hubs = [];
  for (const server of plexServers) {
    for (const musicLibrary of plexLibraries.filter(
      (Obj) => Obj.server === server.clientIdentifier && Obj.type === "artist"
    )) {
      let response = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/hubs/sections/" +
          musicLibrary?.key,
        headers: { accept: "application/json" },
        params: {
          count: 12,
          includeLibraryPlaylists: 1,
          includeStations: 1,
          includeRecentChannels: 1,
          includeMeta: 1,
          includeExternalMetadata: 1,
          excludeFields: "summary",
          "X-Plex-Product": plexClientinformation.product,
          "X-Plex-Version": plexClientinformation.version,
          "X-Plex-Client-Identifier": plexClientinformation.clientIdentifier,
          "X-Plex-Token": server?.accessToken,
        },
      }).catch((err) => {
        throw err;
      });
      console.debug(response.data);

      for (const hub of response.data.MediaContainer.Hub) {
        let hubMetaData = [];
        if (hub.size > 0 && hub.type !== "station") {
          for (const metaDataEntry of hub.Metadata) {
            let metaEntry = {
              Genre: metaDataEntry.Genre,
              addedAt: metaDataEntry.addedAt,
              guid: metaDataEntry.guid,
              index: metaDataEntry.index,
              key: metaDataEntry.key,
              librarySectionID: metaDataEntry.librarySectionID,
              librarySectionKey: metaDataEntry.librarySectionKey,
              librarySectionTitle: metaDataEntry.librarySectionTitle,
              loudnessAnalysisVersion: metaDataEntry.loudnessAnalysisVersion,
              musicAnalysisVersion: metaDataEntry.musicAnalysisVersion,
              originallyAvailableAt: metaDataEntry.originallyAvailableAt,
              parentGuid: metaDataEntry.parentGuid,
              parentKey: metaDataEntry.parentKey,
              parentRatingKey: metaDataEntry.parentRatingKey,
              parentThumb: metaDataEntry.parentThumb,
              parentTitle: metaDataEntry.parentTitle,
              ratingKey: metaDataEntry.ratingKey,
              studio: metaDataEntry.studio,
              thumb:
                server.preferredConnection.uri +
                "/photo/:/transcode?" +
                qs.stringify({
                  width: 240,
                  height: 240,
                  minSize: 1,
                  upscale: 1,
                  url:
                    metaDataEntry.thumb + "?X-Plex-Token=" + server.accessToken,
                  "X-Plex-Token": server.accessToken,
                }),
              title: metaDataEntry.title,
              type: metaDataEntry.type,
              updatedAt: metaDataEntry.updatedAt,
              year: metaDataEntry.year,
            };
            if (metaDataEntry.type === "playlist") {
              metaEntry = {
                addedAt: metaDataEntry.addedAt,
                thumb:
                  server.preferredConnection.uri +
                  "/photo/:/transcode?" +
                  qs.stringify({
                    width: 240,
                    height: 240,
                    minSize: 1,
                    upscale: 1,
                    url:
                      metaDataEntry.composite +
                      "?X-Plex-Token=" +
                      server.accessToken,
                    "X-Plex-Token": server.accessToken,
                  }),
                duration: metaDataEntry.duration,
                guid: metaDataEntry.guid,
                icon: metaDataEntry.icon,
                key: metaDataEntry.key,
                lastViewedAt: metaDataEntry.lastViewedAt,
                leafCount: metaDataEntry.leafCount,
                playlistType: metaDataEntry.playlistType,
                ratingKey: metaDataEntry.ratingKey,
                smart: metaDataEntry.smart,
                title: metaDataEntry.title,
                titleSort: metaDataEntry.titleSort,
                type: metaDataEntry.type,
                updatedAt: metaDataEntry.updatedAt,
                viewCount: metaDataEntry.viewCount,
              };
            }
            hubMetaData.push(metaEntry);
          }
          hubs.push({
            Metadata: hubMetaData,
            context: hub.context,
            hubIdentifier: hub.hubIdentifier,
            hubKey: hub.hubKey,
            key: hub.key,
            more: hub.more,
            promoted: hub.promoted,
            size: hub.size,
            style: hub.style,
            title: hub.title,
            type: hub.type,
          });
        }
      }
    }
  }
  return hubs;
}

export async function GetArtistPage(
  plexClientInformation,
  plexServers,
  plexLibraries,
  artistObject
) {
  let albums = [];
  let response = {};
  let songs = [];
  let relatedArtists = [];
  //.filter((Obj) => Obj.clientIdentifier === artistObject.server)
  //&&  Obj.uuid === artistObject.library;
  for (const server of plexServers) {
    for (const musicLibrary of plexLibraries.filter(
      (Obj) => Obj.server === server.clientIdentifier && Obj.type === "artist"
    )) {
      response = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/library/metadata/" +
          artistObject?.ratingKey +
          "/children",
        headers: { accept: "application/json" },
        params: {
          excludeAllLeaves: 1,
          includeUserState: 1,
          "X-Plex-Product": plexClientInformation.product,
          "X-Plex-Version": plexClientInformation.version,
          "X-Plex-Client-Identifier": plexClientInformation.clientIdentifier,
          "X-Plex-Token": server?.accessToken,
        },
      }).catch((err) => {
        throw err;
      });
      console.warn(response.data);
      if (response.data.MediaContainer.size > 0) {
        for (const album of response.data.MediaContainer.Metadata) {
          albums.push({
            server: server.clientIdentifier,
            library: musicLibrary.uuid,
            Director: album.Director,
            Genre: album.Genre,
            addedAt: album.addedAt,
            guid: album.guid,
            index: album.index,
            key: album.key,
            lastViewedAt: album.lastViewedAt,
            loudnessAnalysisVersion: album.loudnessAnalysisVersion,
            musicAnalysisVersion: album.musicAnalysisVersion,
            originallyAvailableAt: album.originallyAvailableAt,
            parentGuid: album.parentGuid,
            parentKey: album.parentKey,
            parentRatingKey: album.parentRatingKey,
            parentThumb: album.parentThumb,
            parentTitle: album.parentTitle,
            rating: album.rating,
            ratingKey: album.ratingKey,
            studio: album.studio,
            summary: album.summary,
            thumb:
              server.preferredConnection.uri +
              "/photo/:/transcode?" +
              qs.stringify({
                width: 240,
                height: 240,
                minSize: 1,
                upscale: 1,
                url: album.thumb + "?X-Plex-Token=" + server.accessToken,
                "X-Plex-Token": server.accessToken,
              }),
            title: album.title,
            type: album.type,
            updatedAt: album.updatedAt,
            viewCount: album.viewCount,
            year: album.year,
          });
        }
      }

      let albumResponse = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/library/sections/" +
          musicLibrary?.key +
          "/all",
        headers: { accept: "application/json" },
        params: {
          "album.subformat!": "Compilation,Live",
          "artist.id": artistObject.ratingKey,
          group: "title",
          sort: "ratingCount:desc",
          type: 9,
          includeUserState: 1,
          "X-Plex-Product": plexClientInformation.product,
          "X-Plex-Version": plexClientInformation.version,
          "X-Plex-Client-Identifier": plexClientInformation.clientIdentifier,
          "X-Plex-Token": server?.accessToken,
        },
      }).catch((err) => {
        throw err;
      });
      console.debug(albumResponse.data);
      if (albumResponse.data.MediaContainer.size > 0) {
        for (const album of albumResponse.data.MediaContainer.Metadata) {
          albums.push({
            server: server.clientIdentifier,
            library: musicLibrary.uuid,
            Director: album.Director,
            Genre: album.Genre,
            addedAt: album.addedAt,
            guid: album.guid,
            index: album.index,
            key: album.key,
            lastViewedAt: album.lastViewedAt,
            loudnessAnalysisVersion: album.loudnessAnalysisVersion,
            musicAnalysisVersion: album.musicAnalysisVersion,
            originallyAvailableAt: album.originallyAvailableAt,
            parentGuid: album.parentGuid,
            parentKey: album.parentKey,
            parentRatingKey: album.parentRatingKey,
            parentThumb: album.parentThumb,
            parentTitle: album.parentTitle,
            rating: album.rating,
            ratingKey: album.ratingKey,
            studio: album.studio,
            summary: album.summary,
            thumb:
              server.preferredConnection.uri +
              "/photo/:/transcode?" +
              qs.stringify({
                width: 240,
                height: 240,
                minSize: 1,
                upscale: 1,
                url: album.thumb + "?X-Plex-Token=" + server.accessToken,
                "X-Plex-Token": server.accessToken,
              }),
            title: album.title,
            type: album.type,
            updatedAt: album.updatedAt,
            viewCount: album.viewCount,
            year: album.year,
          });
        }
      }

      let relatedArtistsResponse = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/library/metadata/" +
          artistObject?.ratingKey +
          "/related",
        headers: { accept: "application/json" },
        params: {
          includeAugmentations: 1,
          includeExternalMetadata: 1,
          includeMeta: 1,
          "X-Plex-Product": plexClientInformation.product,
          "X-Plex-Version": plexClientInformation.version,
          "X-Plex-Client-Identifier": plexClientInformation.clientIdentifier,
          "X-Plex-Token": server?.accessToken,
        },
      }).catch((err) => {
        throw err;
      });
      console.debug(relatedArtistsResponse.data);
      if (
        relatedArtistsResponse.data.MediaContainer.Hub.some(function (Object) {
          return Object.title === "Similar Artists";
        })
      ) {
        let relatedArtistHub =
          relatedArtistsResponse.data.MediaContainer.Hub.filter(
            (Obj) => Obj.title === "Similar Artists"
          );
        console.warn(relatedArtistHub);
        for (const hubAlbum of relatedArtistHub) {
          for (const album of hubAlbum.Metadata) {
            relatedArtists.push({
              server: server.clientIdentifier,
              library: musicLibrary.uuid,
              Director: album.Director,
              Genre: album.Genre,
              addedAt: album.addedAt,
              guid: album.guid,
              index: album.index,
              key: album.key,
              lastViewedAt: album.lastViewedAt,
              loudnessAnalysisVersion: album.loudnessAnalysisVersion,
              musicAnalysisVersion: album.musicAnalysisVersion,
              originallyAvailableAt: album.originallyAvailableAt,
              parentGuid: album.parentGuid,
              parentKey: album.parentKey,
              parentRatingKey: album.parentRatingKey,
              parentThumb: album.parentThumb,
              parentTitle: album.parentTitle,
              rating: album.rating,
              ratingKey: album.ratingKey,
              studio: album.studio,
              summary: album.summary,
              thumb:
                server.preferredConnection.uri +
                "/photo/:/transcode?" +
                qs.stringify({
                  width: 240,
                  height: 240,
                  minSize: 1,
                  upscale: 1,
                  url: album.thumb + "?X-Plex-Token=" + server.accessToken,
                  "X-Plex-Token": server.accessToken,
                }),
              title: album.title,
              type: album.type,
              updatedAt: album.updatedAt,
              viewCount: album.viewCount,
              year: album.year,
            });
          }
        }
      }

      let songResponse = await axios({
        method: "GET",
        url:
          server.preferredConnection.uri +
          "/library/sections/" +
          musicLibrary?.key +
          "/all",
        headers: { accept: "application/json" },
        params: {
          "album.subformat!": "Compilation,Live",
          "artist.id": artistObject.ratingKey,
          group: "title",
          limit: 100,
          "ratingCount>": 1,
          resolveTags: 1,
          sort: "ratingCount:desc",
          type: 10,
          includeUserState: 1,
          includeCollections: 1,
          includeExternalMedia: 1,
          "X-Plex-Container-Start": 0,
          "X-Plex-Container-Size": 20,
          "X-Plex-Product": plexClientInformation.product,
          "X-Plex-Version": plexClientInformation.version,
          "X-Plex-Client-Identifier": plexClientInformation.clientIdentifier,
          "X-Plex-Token": server?.accessToken,
        },
      }).catch((err) => {
        throw err;
      });
      console.debug(songResponse.data);
      if (songResponse.data.MediaContainer.size > 0) {
        for (const song of songResponse.data.MediaContainer.Metadata) {
          songs.push({
            server: server.clientIdentifier,
            library: musicLibrary.uuid,
            ratingKey: song.ratingKey,
            key: song.key,
            parentRatingKey: song.parentRatingKey,
            grandparentRatingKey: song.grandparentRatingKey,
            guid: song.guid,
            parentGuid: song.parentGuid,
            grandparentGuid: song.grandparentGuid,
            type: song.type,
            title: song.title,
            grandparentKey: song.grandparentKey,
            parentKey: song.parentKey,
            grandparentTitle: song.grandparentTitle,
            parentTitle: song.parentTitle,
            originalTitle: song.originalTitle,
            summary: song.summary,
            index: song.index,
            parentIndex: song.parentIndex,
            thumb:
              server.preferredConnection.uri +
              "/photo/:/transcode?" +
              qs.stringify({
                width: 240,
                height: 240,
                minSize: 1,
                upscale: 1,
                url: song.thumb + "?X-Plex-Token=" + server.accessToken,
                "X-Plex-Token": server.accessToken,
              }),
            parentThumb: song.parentThumb,
            grandparentThumb: song.grandparentThumb,
            duration: song.duration,
            addedAt: song.addedAt,
            updatedAt: song.updatedAt,
            musicAnalysisVersion: song.musicAnalysisVersion,
            Media: song.Media,
          });
        }
      }
    }
  }

  const albumArray = albums
    .map((item) => {
      return Object.fromEntries(Object.entries(item).sort());
    })
    .map(JSON.stringify);

  return {
    inputObject: artistObject,
    response: response.data,
    albums: [...new Set(albumArray)].map(JSON.parse),
    songs,
    relatedArtists,
  };
}

// export async function GetAlbumPage(
//   plexClientInformation,
//   plexServers,
//   plexLibraries,
//   artistObject
// ) {
//   let albums = [];
//   let response = {};
//   let songs = [];
//   for (const server of plexServers.filter(
//     (Obj) => Obj.clientIdentifier === artistObject.server
//   )) {
//     for (const musicLibrary of plexLibraries.filter(
//       (Obj) =>
//         Obj.server === server.clientIdentifier &&
//         Obj.type === "artist" &&
//         Obj.uuid === artistObject.library
//     )) {
//       response = await axios({
//         method: "GET",
//         url:
//           server.preferredConnection.uri +
//           "/library/metadata/" +
//           artistObject?.ratingKey +
//           "/children",
//         headers: { accept: "application/json" },
//         params: {
//           excludeAllLeaves: 1,
//           includeUserState: 1,
//           "X-Plex-Product": plexClientInformation.product,
//           "X-Plex-Version": plexClientInformation.version,
//           "X-Plex-Client-Identifier": plexClientInformation.clientIdentifier,
//           "X-Plex-Token": server?.accessToken,
//         },
//       }).catch((err) => {
//         throw err;
//       });
//       console.debug(response.data);
//       if (response.data.MediaContainer.size > 0) {
//         for (const album of response.data.MediaContainer.Metadata) {
//           albums.push({
//             server: server.clientIdentifier,
//             library: musicLibrary.uuid,
//             Director: album.Director,
//             Genre: album.Genre,
//             addedAt: album.addedAt,
//             guid: album.guid,
//             index: album.index,
//             key: album.key,
//             lastViewedAt: album.lastViewedAt,
//             loudnessAnalysisVersion: album.loudnessAnalysisVersion,
//             musicAnalysisVersion: album.musicAnalysisVersion,
//             originallyAvailableAt: album.originallyAvailableAt,
//             parentGuid: album.parentGuid,
//             parentKey: album.parentKey,
//             parentRatingKey: album.parentRatingKey,
//             parentThumb: album.parentThumb,
//             parentTitle: album.parentTitle,
//             rating: album.rating,
//             ratingKey: album.ratingKey,
//             studio: album.studio,
//             summary: album.summary,
//             thumb:
//               server.preferredConnection.uri +
//               "/photo/:/transcode?" +
//               qs.stringify({
//                 width: 240,
//                 height: 240,
//                 minSize: 1,
//                 upscale: 1,
//                 url: album.thumb + "?X-Plex-Token=" + server.accessToken,
//                 "X-Plex-Token": server.accessToken,
//               }),
//             title: album.title,
//             type: album.type,
//             updatedAt: album.updatedAt,
//             viewCount: album.viewCount,
//             year: album.year,
//           });
//         }
//       }

//       let songResponse = await axios({
//         method: "GET",
//         url:
//           server.preferredConnection.uri +
//           "/library/sections/" +
//           musicLibrary?.key +
//           "/all",
//         headers: { accept: "application/json" },
//         params: {
//           "album.subformat!": "Compilation,Live",
//           "artist.id": artistObject.ratingKey,
//           group: "title",
//           limit: 100,
//           "ratingCount>": 1,
//           resolveTags: 1,
//           sort: "ratingCount:desc",
//           type: 10,
//           includeUserState: 1,
//           "X-Plex-Container-Start": 0,
//           "X-Plex-Container-Size": 20,
//           "X-Plex-Product": plexClientInformation.product,
//           "X-Plex-Version": plexClientInformation.version,
//           "X-Plex-Client-Identifier": plexClientInformation.clientIdentifier,
//           "X-Plex-Token": server?.accessToken,
//         },
//       }).catch((err) => {
//         throw err;
//       });
//       console.debug(songResponse.data);
//       for (const song of songResponse.data.MediaContainer.Metadata) {
//         songs.push({
//           server: server.clientIdentifier,
//           library: musicLibrary.uuid,
//           ratingKey: song.ratingKey,
//           key: song.key,
//           parentRatingKey: song.parentRatingKey,
//           grandparentRatingKey: song.grandparentRatingKey,
//           guid: song.guid,
//           parentGuid: song.parentGuid,
//           grandparentGuid: song.grandparentGuid,
//           type: song.type,
//           title: song.title,
//           grandparentKey: song.grandparentKey,
//           parentKey: song.parentKey,
//           grandparentTitle: song.grandparentTitle,
//           parentTitle: song.parentTitle,
//           originalTitle: song.originalTitle,
//           summary: song.summary,
//           index: song.index,
//           parentIndex: song.parentIndex,
//           thumb:
//             server.preferredConnection.uri +
//             "/photo/:/transcode?" +
//             qs.stringify({
//               width: 240,
//               height: 240,
//               minSize: 1,
//               upscale: 1,
//               url: song.thumb + "?X-Plex-Token=" + server.accessToken,
//               "X-Plex-Token": server.accessToken,
//             }),
//           parentThumb: song.parentThumb,
//           grandparentThumb: song.grandparentThumb,
//           duration: song.duration,
//           addedAt: song.addedAt,
//           updatedAt: song.updatedAt,
//           musicAnalysisVersion: song.musicAnalysisVersion,
//           Media: song.Media,
//         });
//       }
//     }
//   }
//   return { inputObject: artistObject, response: response.data, albums, songs };
// }
