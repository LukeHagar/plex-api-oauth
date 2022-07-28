import { PlexAPIOAuth } from "../src/index.js";
import { strict as assert } from "assert";

describe("Unit Tests", function () {
  let PlexSession = new PlexAPIOAuth();
  let emptyArray = [];
  it("Generate ClientId", function () {
    PlexSession.GenerateClientId();
    assert.notEqual(PlexSession.clientId, null);
    assert.notEqual(PlexSession.clientId, undefined);
    // console.log("Plex Session");
    // console.log(PlexSession);
  });
  it("Login", async function () {
    this.timeout(10000);
    let response = await PlexSession.PlexLogin();
    assert.notEqual(PlexSession.plexTVAuthToken, undefined);
    assert.notEqual(response, undefined);
    // console.log("Auth Token");
    // console.log(PlexSession.plexTVAuthToken);
  });
  it("Get Plex User Data", async function () {
    this.timeout(5000);
    let response = await PlexSession.GetPlexUserData();
    assert.notEqual(PlexSession.plexTVUserData, undefined);
    assert.notEqual(response, undefined);
    // console.log("User Data");
    // console.log(PlexSession.plexTVUserData);
  });
  it("Get Plex Servers", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexServers();
    assert.notEqual(PlexSession.plexServers, emptyArray);
    assert.notEqual(PlexSession.plexServers, null);
    assert.notEqual(PlexSession.plexServers, undefined);
    assert.notEqual(PlexSession.plexDevices, emptyArray);
    assert.notEqual(response, null);
    // console.log("Plex Servers");
    // console.log(PlexSession.plexServers);
  });
  it("Get Plex Libraries", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexLibraries();
    assert.notEqual(PlexSession.plexLibraries, null);
    assert.notEqual(PlexSession.plexLibraries, undefined);
    assert.notEqual(PlexSession.plexLibraries, emptyArray);
    assert.notEqual(PlexSession.plexMusicLibraries, null);
    assert.notEqual(PlexSession.plexMusicLibraries, undefined);
    assert.notEqual(PlexSession.plexMusicLibraries, emptyArray);
    assert.notEqual(PlexSession.plexMovieLibraries, null);
    assert.notEqual(PlexSession.plexMovieLibraries, undefined);
    assert.notEqual(PlexSession.plexMovieLibraries, emptyArray);
    assert.notEqual(PlexSession.plexTVShowLibraries, null);
    assert.notEqual(PlexSession.plexTVShowLibraries, undefined);
    assert.notEqual(PlexSession.plexTVShowLibraries, emptyArray);
    // console.log("Plex Libraries");
    // console.log(PlexSession.plexLibraries);
  });
  // it("Get Plex Movie Library Contents", async function () {
  //   this.timeout(10000);
  //   let response = await PlexSession.GetPlexMovieLibraryContent();
  //   assert.notEqual(PlexSession.plexMovieLibraryContent, null);
  //   assert.notEqual(PlexSession.plexMovieLibraryContent, undefined);
  //   assert.notEqual(PlexSession.plexMovieLibraryContent, emptyArray);
  //   // console.log("Plex Movie Library Content");
  //   // console.log(PlexSession.plexMovieLibraryContent);
  // });
  // it("Get Plex Music Library Contents", async function () {
  //   this.timeout(10000);
  //   let response = await PlexSession.GetPlexMusicLibraryContent();
  //   assert.notEqual(PlexSession.plexArtistLibraries, null);
  //   assert.notEqual(PlexSession.plexArtistLibraries, undefined);
  //   assert.notEqual(PlexSession.plexArtistLibraries, emptyArray);
  //   assert.notEqual(PlexSession.plexAlbumLibraries, null);
  //   assert.notEqual(PlexSession.plexAlbumLibraries, undefined);
  //   assert.notEqual(PlexSession.plexAlbumLibraries, emptyArray);
  //   assert.notEqual(PlexSession.plexSongLibraries, null);
  //   assert.notEqual(PlexSession.plexSongLibraries, undefined);
  //   assert.notEqual(PlexSession.plexSongLibraries, emptyArray);
  //   // console.log("Plex Library Content");
  //   // console.log(PlexSession.plexAlbumLibraries);
  // });
  // it("Get Plex TV Library Contents", async function () {
  //   this.timeout(30000);
  //   let response = await PlexSession.GetPlexTVShowLibraryContent();
  //   assert.notEqual(PlexSession.plexTVShowLibraryContent, null);
  //   assert.notEqual(PlexSession.plexTVShowLibraryContent, undefined);
  //   assert.notEqual(PlexSession.plexTVShowLibraryContent, emptyArray);
  //   assert.notEqual(PlexSession.plexSeasonLibraries, null);
  //   assert.notEqual(PlexSession.plexSeasonLibraries, undefined);
  //   assert.notEqual(PlexSession.plexSeasonLibraries, emptyArray);
  //   assert.notEqual(PlexSession.episodeLibraryContent, null);
  //   assert.notEqual(PlexSession.episodeLibraryContent, undefined);
  //   assert.notEqual(PlexSession.episodeLibraryContent, emptyArray);
  //   //console.log("Plex TV Library Content");
  //   //console.log(PlexSession.plexSeasonLibraries);
  // });
  it("Get Plex TV Show Seasons - Stateless", async function () {
    this.timeout(4000);
    let response = await PlexSession.GetPlexTVShowSeasons();
    //console.log(response);
  });
});
