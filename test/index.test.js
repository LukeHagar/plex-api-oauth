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
    this.timeout(12000);
    let response = await PlexSession.GetPlexServers({ owned: true });
    assert.notEqual(PlexSession.plexServers, emptyArray);
    assert.notEqual(PlexSession.plexServers, null);
    assert.notEqual(PlexSession.plexServers, undefined);
    assert.notEqual(PlexSession.plexDevices, emptyArray);
    assert.notEqual(PlexSession.plexDevices, null);
    assert.notEqual(PlexSession.plexDevices, undefined);
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    //console.log("Plex Servers");
    //console.log(PlexSession.plexServers);
  });
  it("Get Plex Libraries", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexLibraries();
    assert.notEqual(PlexSession.plexLibraries, null);
    assert.notEqual(PlexSession.plexLibraries, undefined);
    assert.notEqual(PlexSession.plexLibraries, emptyArray);
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    //console.log("Plex Libraries");
    //console.log(PlexSession.plexLibraries);
  });
  it("Get Plex Movie Libraries", async function () {
    this.timeout(20000);
    let response = await PlexSession.GetPlexMovieLibraries();
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex Movie Libraries");
    // console.log(response);
  });
  it("Get Plex Music Libraries", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexMusicLibraries();
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex Music Libraries");
    // console.log(response);
  });
  it("Get Plex TV Libraries", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexTVShowLibraries();
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex TV Libraries");
    // console.log(response);
  });
  it("Get Plex Movies", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexMovies();
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex Movies");
    // console.log(response);
  });
  it("Get Plex Shows", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexShows();
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex Shows");
    // console.log(response);
  });
  it("Get Plex Seasons", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexSeasons();
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex Seasons");
    // console.log(response);
  });
  it("Get Plex Episodes", async function () {
    this.timeout(20000);
    let response = await PlexSession.GetPlexEpisodes();
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex Episodes");
    // console.log(response);
  });
  it("Get Plex Artists", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexArtists();
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex Artists");
    // console.log(response);
  });
  it("Get Plex Albums", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexAlbums();
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex Albums");
    // console.log(response);
  });
  it("Get Plex Songs", async function () {
    this.timeout(20000);
    let response = await PlexSession.GetPlexSongs();
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    //console.log("Plex Songs");
    //console.log(response);
  });
});
