import { PlexAPIOAuth } from "../src/index.js";
import { strict as assert } from "assert";

describe("Login Test", function () {
  let PlexSession = new PlexAPIOAuth();
  let emptyArray = [];
  it("Generate ClientId", function () {
    PlexSession.GenerateClientId();
    assert.notEqual(PlexSession.clientId, null);
    assert.notEqual(PlexSession.clientId, undefined);
    console.log("Plex Session");
    console.log(PlexSession);
  });
  it("Login", async function () {
    this.timeout(10000);
    let response = await PlexSession.PlexLogin();
    assert.notEqual(PlexSession.plexTVAuthToken, undefined);
    assert.notEqual(response, undefined);
    console.log("Auth Token");
    console.log(PlexSession.plexTVAuthToken);
  });
  it("Get Plex User Data", async function () {
    this.timeout(5000);
    let response = await PlexSession.GetPlexUserData();
    assert.notEqual(PlexSession.plexTVUserData, undefined);
    assert.notEqual(response, undefined);
    console.log("User Data");
    console.log(PlexSession.plexTVUserData);
  });
  it("Get Plex Servers", async function () {
    this.timeout(10000);
    let response = await PlexSession.GetPlexServers();
    assert.notEqual(PlexSession.plexServers, emptyArray);
    assert.notEqual(PlexSession.plexServers, null);
    assert.notEqual(PlexSession.plexServers, undefined);
    assert.notEqual(PlexSession.plexDevices, emptyArray);
    assert.notEqual(response, null);
    console.log("Plex Servers");
    console.log(PlexSession.plexServers);
  });
  it("Get Plex Libraries", async function () {
    //this.timeout(10000);
    let response = await PlexSession.GetPlexLibraries();
    assert.notEqual(PlexSession.plexLibraries, null);
    assert.notEqual(PlexSession.plexLibraries, undefined);
    assert.notEqual(PlexSession.plexLibraries, emptyArray);
    assert.notEqual(await response, null);
    console.log("Plex Libraries");
    console.log(PlexSession.plexLibraries);
  });
});
