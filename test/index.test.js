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
    assert.notEqual(PlexSession.plexDevices, null);
    assert.notEqual(PlexSession.plexDevices, undefined);
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex Servers");
    // console.log(PlexSession.plexServers);
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
    // console.log("Plex Libraries");
    // console.log(PlexSession.plexLibraries);
  });
  it("Get Plex Movies Libraries", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexMovieLibraries();
    assert.notEqual(PlexSession.plexMovieLibraries, null);
    assert.notEqual(PlexSession.plexMovieLibraries, undefined);
    assert.notEqual(PlexSession.plexMovieLibraries, emptyArray);
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex Libraries");
    // console.log(PlexSession.plexLibraries);
  });
  it("Get Plex Music Libraries", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexMusicLibraries();
    assert.notEqual(PlexSession.plexMusicLibraries, null);
    assert.notEqual(PlexSession.plexMusicLibraries, undefined);
    assert.notEqual(PlexSession.plexMusicLibraries, emptyArray);
    assert.notEqual(response, emptyArray);
    assert.notEqual(response, null);
    assert.notEqual(response, undefined);
    // console.log("Plex Libraries");
    // console.log(PlexSession.plexLibraries);
  });
  it("Get Plex TV Libraries", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexTVShowLibraries();
    assert.notEqual(PlexSession.plexTVShowLibraries, null);
    assert.notEqual(PlexSession.plexTVShowLibraries, undefined);
    assert.notEqual(PlexSession.plexTVShowLibraries, emptyArray);
    // console.log("Plex Libraries");
    // console.log(PlexSession.plexLibraries);
  });
});
